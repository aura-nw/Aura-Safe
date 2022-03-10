import BigNumber from 'bignumber.js'
import { Dispatch } from 'redux'

import { fetchTokenCurrenciesBalances, TokenBalance } from 'src/logic/safe/api/fetchTokenCurrenciesBalances'
import { addTokens } from 'src/logic/tokens/store/actions/addTokens'
import { makeToken, Token } from 'src/logic/tokens/store/model/token'
import { updateSafe } from 'src/logic/safe/store/actions/updateSafe'
import { AppReduxState } from 'src/store'
import { humanReadableValue } from 'src/logic/tokens/utils/humanReadableValue'
import { currentSafe } from 'src/logic/safe/store/selectors'
import { currentCurrencySelector } from 'src/logic/currencyValues/store/selectors'
import { ZERO_ADDRESS, sameAddress } from 'src/logic/wallets/ethAddresses'
import { Errors, logError } from 'src/logic/exceptions/CodedException'
import { SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { IMSafeInfo } from 'src/types/safe'

export type BalanceRecord = {
  tokenAddress?: string
  tokenBalance: string
  fiatBalance?: string
}

interface ExtractedData {
  balances: Array<BalanceRecord>
  ethBalance: string
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
    acc.ethBalance = humanReadableValue(balance, Number(decimals))
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

      const { balances, ethBalance, tokens } = tokenCurrenciesBalances.items.reduce<ExtractedData>(
        extractDataFromResult,
        {
          balances: [],
          ethBalance: '0',
          tokens: [],
        },
      )

      dispatch(
        updateSafe({
          address: safeAddress,
          balances,
          ethBalance: '0',
          totalFiatBalance: new BigNumber(tokenCurrenciesBalances.fiatTotal).toFixed(2),
        }),
      )
      dispatch(addTokens(tokens))
    }



export const fetchMSafeTokens =
  (safeInfo: IMSafeInfo) =>
    async (dispatch: Dispatch, getState: () => AppReduxState): Promise<void> => {
      if (safeInfo) {
        let tokenCurrenciesBalances: SafeBalanceResponse = {
          fiatTotal: '0',
          items: []
        }
        if (safeInfo.balance) {
          safeInfo.balance.forEach(balance => {
            tokenCurrenciesBalances.items.push({
              balance: balance.amount,
              fiatBalance: '0',
              fiatConversion: '0',
              tokenInfo: {
                address: '0000000000000000000000000000000000000000',
                decimals: 6,
                logoUri: '',
                name: 'Aura',
                symbol: 'Aura'
              }
            })
          })
        }

        const { balances, ethBalance, tokens } = tokenCurrenciesBalances.items.reduce<ExtractedData>(
          extractDataFromResult,
          {
            balances: [],
            ethBalance: '0',
            tokens: [],
          },
        )

        dispatch(
          updateSafe({
            address: safeInfo.address,
            balances,
            ethBalance,
            totalFiatBalance: new BigNumber(tokenCurrenciesBalances.fiatTotal).toFixed(2),
          }),
        )
        dispatch(addTokens(tokens))
      }


      /* 
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

      const { balances, ethBalance, tokens } = tokenCurrenciesBalances.items.reduce<ExtractedData>(
        extractDataFromResult,
        {
          balances: [],
          ethBalance: '0',
          tokens: [],
        },
      )

      dispatch(
        updateSafe({
          address: safeAddress,
          balances,
          ethBalance,
          totalFiatBalance: new BigNumber(tokenCurrenciesBalances.fiatTotal).toFixed(2),
        }),
      )
      dispatch(addTokens(tokens)) 
      */
    }