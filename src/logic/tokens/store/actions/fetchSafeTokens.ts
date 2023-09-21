import BigNumber from 'bignumber.js'
import { Dispatch } from 'redux'

import { SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { getChains } from 'src/config/cache/chains'
import { currentCurrencySelector } from 'src/logic/currencyValues/store/selectors'
import { Errors, logError } from 'src/logic/exceptions/CodedException'
import { TokenBalance, fetchTokenCurrenciesBalances } from 'src/logic/safe/api/fetchTokenCurrenciesBalances'
import { AppReduxState } from 'src/logic/safe/store'
import { updateSafe } from 'src/logic/safe/store/actions/updateSafe'
import { currentSafe, safeByAddressSelector } from 'src/logic/safe/store/selectors'
import { addTokens } from 'src/logic/tokens/store/actions/addTokens'
import { Token, makeToken } from 'src/logic/tokens/store/model/token'
import { humanReadableValue } from 'src/logic/tokens/utils/humanReadableValue'
import { ZERO_ADDRESS, sameAddress } from 'src/logic/wallets/ethAddresses'
import { getTokenDetail } from 'src/services'
import { IMSafeInfo } from 'src/types/safe'

export type BalanceRecord = {
  tokenAddress?: string
  tokenBalance: string
  fiatBalance?: string
}

interface ExtractedData {
  balances: Array<BalanceRecord>
  nativeBalance: string
  tokens: Array<Token>
}

const extractDataFromResult = (
  acc: ExtractedData,
  { balance, fiatBalance, tokenInfo }: TokenBalance,
): ExtractedData => {
  const { address, decimals } = tokenInfo
  acc.balances.push({
    tokenAddress: address,
    fiatBalance,
    tokenBalance: humanReadableValue(balance, Number(decimals)),
  })

  // Extract network token balance from backend balances
  if (sameAddress(address, ZERO_ADDRESS)) {
    acc.nativeBalance = humanReadableValue(balance, Number(decimals))
  } else {
    acc.tokens.push(makeToken({ ...tokenInfo }))
  }

  return acc
}

export const fetchSafeTokens =
  (safeAddress: string, currency?: string) =>
  async (dispatch: Dispatch, getState: () => AppReduxState): Promise<void> => {
    const state = getState()
    const safe = currentSafe(state)

    if (!safe) {
      return
    }
    const selectedCurrency = currency ?? currentCurrencySelector(state)

    let tokenCurrenciesBalances: SafeBalanceResponse
    try {
      tokenCurrenciesBalances = await fetchTokenCurrenciesBalances({
        safeAddress,
        selectedCurrency,
      })
    } catch (e) {
      logError(Errors._601, e.message)
      return
    }

    const { balances, nativeBalance, tokens } = tokenCurrenciesBalances.items.reduce<ExtractedData>(
      extractDataFromResult,
      {
        balances: [],
        nativeBalance: '0',
        tokens: [],
      },
    )

    dispatch(
      updateSafe({
        address: safeAddress,
        balances,
        nativeBalance: '0',
        totalFiatBalance: new BigNumber(tokenCurrenciesBalances.fiatTotal).toFixed(6),
      }),
    )
    dispatch(addTokens(tokens))
  }

export const fetchMSafeTokens =
  (safeInfo: IMSafeInfo) =>
  async (dispatch: Dispatch, getState: () => AppReduxState): Promise<void> => {
    let listTokens: any[] = []
    const cw20Tokens = safeInfo.assets.CW20.asset.map((asset) => ({
      name: asset.asset_info.data.name,
      decimals: asset.asset_info.data.decimals,
      symbol: asset.asset_info.data.symbol,
      address: asset.contract_address,
      _id: asset['_id'],
    }))
    const listSafeTokens = [...(safeInfo?.balance || []), ...cw20Tokens]
    const state = getState()
    const safe = safeByAddressSelector(state, safeInfo.address)
    if (safeInfo?.balance) {
      const listChain = getChains()
      const tokenDetailsListData = await getTokenDetail()
      const tokenDetailsList = await tokenDetailsListData.json()
      listTokens = [...tokenDetailsList['ibc'], ...tokenDetailsList['cw20']]
      const importedConfig =
        safe?.coinConfig?.filter((c) => {
          if (c.isAddedToken) {
            return !listTokens.some((t) => t.address === c.address)
          }
          return false
        }) || []
      listTokens = [...listTokens, ...importedConfig]
      const filteredListTokens = listTokens.map((token) => {
        const isExist = listSafeTokens.some((t) => t.denom === token.minCoinDenom || t.address === token.address)
        return { ...token, enable: isExist }
      })
      const chainInfo: any = listChain.find((x: any) => x.internalChainId === safeInfo?.internalChainId)
      const nativeTokenData = safeInfo.balance?.find((balance) => balance.denom == chainInfo.denom)
      const balances: any[] = []
      if (nativeTokenData) {
        const nativeToken = {
          tokenBalance: `${humanReadableValue(
            +nativeTokenData?.amount > 0 ? nativeTokenData?.amount : 0,
            chainInfo.nativeCurrency.decimals,
          )}`,
          tokenAddress: '0000000000000000000000000000000000000000',
          decimals: chainInfo.nativeCurrency.decimals,
          logoUri: chainInfo.nativeCurrency.logoUri,
          name: chainInfo.nativeCurrency.name,
          symbol: chainInfo.nativeCurrency.symbol,
          denom: chainInfo.denom,
          type: 'native',
          enable: true,
        }
        balances.push(nativeToken)
        filteredListTokens.unshift(nativeToken)
      }

      const coinConfig = safe?.coinConfig?.length
        ? filteredListTokens
            .filter(
              (item) =>
                !safe?.coinConfig?.some((token) => token.denom === item.denom || token.address === item.address),
            )
            .concat(safe?.coinConfig)
        : filteredListTokens

      safeInfo.balance
        ?.filter((balance) => balance.denom != chainInfo.denom)
        .forEach((data: any) => {
          const tokenDetail = listTokens.find((token) => token.cosmosDenom == data.minimal_denom)
          balances.push({
            tokenBalance: `${humanReadableValue(+data?.amount > 0 ? data?.amount : 0, tokenDetail?.decimals || 6)}`,
            tokenAddress: tokenDetail?.address,
            decimals: tokenDetail?.decimals || 6,
            logoUri:
              tokenDetail?.icon ||
              tokenDetail?.logoUri ||
              'https://aura-nw.github.io/token-registry/images/undefined.png',
            name: tokenDetail?.name,
            symbol: tokenDetail?.coinDenom,
            denom: tokenDetail?.minCoinDenom,
            cosmosDenom: tokenDetail?.cosmosDenom,
            type: 'ibc',
          })
        })

      if (safeInfo.assets.CW20.asset?.length > 0) {
        safeInfo.assets.CW20.asset.forEach((data) => {
          const tokenDetail = listTokens.find((token) => token.address == data.contract_address)
          if (tokenDetail) {
            balances.push({
              tokenBalance: `${humanReadableValue(+data?.balance > 0 ? data?.balance : 0, tokenDetail?.decimals || 6)}`,
              tokenAddress: tokenDetail?.address,
              decimals: tokenDetail?.decimals || 6,
              name: tokenDetail?.name,
              logoUri:
                tokenDetail?.icon ||
                tokenDetail?.logoUri ||
                'https://aura-nw.github.io/token-registry/images/undefined.png',
              symbol: tokenDetail?.symbol,
              denom: tokenDetail?.symbol,
              type: 'CW20',
            })
          } else {
            listTokens.forEach((token) => {
              if (token.tokenType !== 'ibc' && token.tokenType !== 'native') {
                const isTokenInAsset = safeInfo.assets.CW20.asset.some(
                  (data) => data.contract_address === token.address,
                )
                if (!isTokenInAsset) {
                  balances.push({
                    tokenBalance: `${humanReadableValue(0, tokenDetail?.decimals || 6)}`,
                    tokenAddress: token?.address,
                    decimals: token?.decimals || 6,
                    name: token?.name,
                    logoUri:
                      token?.icon || token?.logoUri || 'https://aura-nw.github.io/token-registry/images/undefined.png',
                    symbol: token?.symbol,
                    denom: token?.symbol,
                    type: 'CW20',
                  })
                }
              }
            })
          }
        })
      }

      const nativeBalance = humanReadableValue(
        nativeTokenData?.amount ? nativeTokenData?.amount : '0',
        chainInfo.nativeCurrency.decimals,
      )
      dispatch(
        updateSafe({
          address: safeInfo.address,
          balances,
          nativeBalance,
          coinConfig,
        }),
      )
    }
  }
