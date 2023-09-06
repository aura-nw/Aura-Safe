import { Dispatch } from 'redux';
import { Action } from 'redux-actions';

import { SequenceResponse } from '@cosmjs/stargate';
import { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk';
import { _getChainId, getCoinDecimal, getCoinMinimalDenom } from 'src/config';
import { fetchCollectibles } from 'src/logic/collectibles/store/actions/fetchCollectibles';
import { currentChainId } from 'src/logic/config/store/selectors';
import { Errors, logError } from 'src/logic/exceptions/CodedException';
import { AppReduxState, store } from 'src/logic/safe/store';
import { updateSafe } from 'src/logic/safe/store/actions/updateSafe';
import { SafeRecordProps } from 'src/logic/safe/store/models/safe';
import { getLocalSafe } from 'src/logic/safe/utils';
import { getSafeInfo } from 'src/logic/safe/utils/safeInformation';
import { fetchMSafeTokens } from 'src/logic/tokens/store/actions/fetchSafeTokens';
import { fetchAccountInfo, getAccountAsset, getMSafeInfo } from 'src/services';
import { IMSafeInfo } from 'src/types/safe';
import { humanReadableValue } from 'src/utils';
import { checksumAddress } from 'src/utils/checksumAddress';
import { currentSafeWithNames } from '../selectors';
import fetchTransactions from './transactions/fetchTransactions';
import { buildSafeOwners, extractRemoteSafeInfo } from './utils';

/**
 * Builds a Safe Record that will be added to the app's store
 * It recovers, and merges information from client-gateway and localStore
 *
 * @note It's being used by "Load Existing Safe" and "Create New Safe" flows
 *
 * @param {string} safeAddress
 * @returns Promise<SafeRecordProps>
 */
export const buildSafe = async (safeAddress: string): Promise<SafeRecordProps> => {
  const address = checksumAddress(safeAddress)
  // setting `loadedViaUrl` to false, as `buildSafe` is called on safe Load or Open flows
  const safeInfo: Partial<SafeRecordProps> = { address, loadedViaUrl: false }

  const local = getLocalSafe(safeAddress)
  const remote = await getSafeInfo(safeAddress).catch((err) => {
    err.log()
    return null
  })

  // remote (client-gateway)
  const remoteSafeInfo = remote ? await extractRemoteSafeInfo(remote) : {}
  // local
  const localSafeInfo = local || ({} as Partial<SafeRecordProps>)

  // update owner's information
  const owners = buildSafeOwners(remote?.owners, localSafeInfo.owners)

  return { ...localSafeInfo, ...safeInfo, ...remoteSafeInfo, owners } as SafeRecordProps
}

/**
 * Updates the app's store with Safe Record built from data provided by client-gateway
 *
 * @note It's being used by the app when it loads for the first time and for the Safe's data polling
 *
 * @param {string} safeAddress
 */
export const fetchSafe =
  (safeAddress: string, isInitialLoad = false) =>
    async (dispatch: Dispatch<any>): Promise<Action<Partial<SafeRecordProps>> | void> => {
      let address = ''
      try {
        address = checksumAddress(safeAddress)
      } catch (err) {
        logError(Errors._102, safeAddress)
        return
      }

      let safeInfo: Partial<SafeRecordProps> = {}
      let remoteSafeInfo: SafeInfo | null = null

      try {
        remoteSafeInfo = await getSafeInfo(address)
      } catch (err) {
        err.log()
      }

      const state = store.getState()
      const chainId = currentChainId(state)

      // If the network has changed while the safe was being loaded,
      // ignore the result
      if (remoteSafeInfo?.chainId !== chainId) {
        return
      }

      // remote (client-gateway)
      if (remoteSafeInfo) {
        safeInfo = await extractRemoteSafeInfo(remoteSafeInfo)

        // If these polling timestamps have changed, fetch again
        const { collectiblesTag, txQueuedTag, txHistoryTag } = currentSafeWithNames(state)

        const shouldUpdateCollectibles = collectiblesTag !== safeInfo.collectiblesTag
        const shouldUpdateTxHistory = txHistoryTag !== safeInfo.txHistoryTag
        const shouldUpdateTxQueued = txQueuedTag !== safeInfo.txQueuedTag

        if (shouldUpdateCollectibles || isInitialLoad) {
          dispatch(fetchCollectibles(safeAddress))
        }

        if (shouldUpdateTxHistory || shouldUpdateTxQueued || isInitialLoad) {
          dispatch(fetchTransactions(chainId, safeAddress))
        }
      }

      const owners = buildSafeOwners(remoteSafeInfo?.owners)

      return dispatch(updateSafe({ address, ...safeInfo, owners }))
    }

export const buildMSafe = async (safeAddress: string, safeId: number): Promise<SafeRecordProps> => {
  // setting `loadedViaUrl` to false, as `buildSafe` is called on safe Load or Open flows
  const safeInfo: Partial<SafeRecordProps> = { address: safeAddress, loadedViaUrl: false }

  const local = getLocalSafe(safeAddress)

  const [, safeInfoDta] = await _getSafeInfo(safeAddress, safeId)

  // remote (client-gateway)
  const remoteSafeInfo = safeInfoDta ? await extractRemoteSafeInfo(safeInfoDta) : {}
  // local
  const localSafeInfo = local || ({} as Partial<SafeRecordProps>)

  // update owner's information
  const owners = buildSafeOwners(safeInfoDta?.owners, localSafeInfo.owners)

  return { ...localSafeInfo, ...safeInfo, ...remoteSafeInfo, owners, safeId: Number(safeId) } as SafeRecordProps
}

export const fetchMSafe =
  (safeAddress: string, safeId: number, isInitialLoad = false) =>
    async (dispatch: Dispatch<any>): Promise<Action<Partial<SafeRecordProps>> | void> => {
      const dispatchPromises: ((dispatch: Dispatch, getState: () => AppReduxState) => Promise<void> | void)[] = []
      const address = safeAddress

      let safeInfo: Partial<SafeRecordProps> = {}
      let remoteSafeInfo: SafeInfo | null = null
      let mSafeInfo: IMSafeInfo | null = null
      let accountInfo: SequenceResponse | null = null
      let isSafeLoaded: boolean = false

      try {
        ;[mSafeInfo, remoteSafeInfo, accountInfo, isSafeLoaded] = await _getSafeInfo(safeAddress, safeId)
      } catch (err) {
        console.error(err)
      }

      const state = store.getState()
      const chainId = currentChainId(state)

      // If the network has changed while the safe was being loaded,
      // ignore the result
      if (remoteSafeInfo?.chainId !== chainId && remoteSafeInfo?.address?.value !== safeAddress) {
        return
      }

      // remote (client-gateway)
      if (remoteSafeInfo) {
        safeInfo = await extractRemoteSafeInfo(remoteSafeInfo)
        const onlineData: SequenceResponse | null = accountInfo

        safeInfo.nextQueueSeq = mSafeInfo?.nextQueueSeq || onlineData?.sequence?.toString()
        safeInfo.sequence = mSafeInfo?.sequence || onlineData?.sequence?.toString()
        const coinDecimal = getCoinDecimal()
        const { txQueuedTag, txHistoryTag, balances } = currentSafeWithNames(state)
        let isBalanceUpdated = false

        if ((mSafeInfo?.balance?.length || 0) + (mSafeInfo?.assets.CW20.asset?.length || 0) != balances?.length)
          isBalanceUpdated = true

        if (!isBalanceUpdated) {
          mSafeInfo?.balance?.some((balance: any) => {
            const decimal = balance?.decimal || coinDecimal
            const remoteBalance = humanReadableValue(balance.amount, decimal)
            const currentBalance = balances.find((b: any) => b.denom == balance.denom)
            if (currentBalance?.tokenBalance != remoteBalance) isBalanceUpdated = true
            return isBalanceUpdated
          })
        }

        if (!isBalanceUpdated && mSafeInfo?.assets.CW20.asset?.length > 0) {
          mSafeInfo?.assets.CW20.asset.some((balance: any) => {
            const decimal = balance?.asset_info.data.decimals || coinDecimal
            const remoteBalance = humanReadableValue(balance.balance, decimal)
            const currentBalance = balances.find((b: any) => b.denom == balance.asset_info.data.symbol)
            if (currentBalance?.tokenBalance != remoteBalance) isBalanceUpdated = true
            return isBalanceUpdated
          })
        }

        const shouldUpdateTxHistory = txHistoryTag !== safeInfo.txHistoryTag
        const shouldUpdateTxQueued = txQueuedTag !== safeInfo.txQueuedTag

        if (shouldUpdateTxHistory || isInitialLoad) {
          dispatchPromises.push(dispatch(fetchTransactions(chainId, safeAddress)))
        } else if (shouldUpdateTxQueued) {
          dispatchPromises.push(dispatch(fetchTransactions(chainId, safeAddress, true)))
        }

        if ((isBalanceUpdated || isInitialLoad) && mSafeInfo) {
          dispatchPromises.push(dispatch(fetchMSafeTokens(mSafeInfo)))
        }
      }

      const owners = buildSafeOwners(remoteSafeInfo?.owners)

      await Promise.all(dispatchPromises)

      return dispatch(updateSafe({ address, ...safeInfo, owners, safeId: safeId, isSafeLoaded }))
    }

async function _getSafeInfo(safeAddress: string, safeId: number): Promise<[IMSafeInfo, SafeInfo, SequenceResponse, boolean]> {
  const getAccountAssetPromise = getAccountAsset(safeAddress)
  const getMSafeInfoPromise = getMSafeInfo(safeId)
  const getAccountInfoPromise = fetchAccountInfo(safeAddress)

  const results = await Promise.allSettled([getAccountAssetPromise, getMSafeInfoPromise, getAccountInfoPromise]);

  const [accountAssetDataResult, mSafeInfotDataResult, accountInfoDataResult] = results;

  const accountAssetData = accountAssetDataResult.status === "fulfilled" ? accountAssetDataResult.value : null;
  const mSafeInfotData = mSafeInfotDataResult.status === "fulfilled" ? mSafeInfotDataResult.value : null;
  const accountInfoData = accountInfoDataResult.status === "fulfilled" ? accountInfoDataResult.value : null;

  if (!mSafeInfotData) {
    throw new Error("Get Safe Info failed");
  }

  const isSafeLoaded = accountAssetData && mSafeInfotData && accountInfoData
  const formatMSafeInfotData: IMSafeInfo = {
    ...mSafeInfotData,
    accountNumber: String(accountInfoData?.account_number),
    assets: {
      CW20: {
        asset: accountAssetData?.cw20_holder?.map((cw20) => ({
          asset_info: {
            data: {
              decimals: +cw20.cw20_contract.decimal,
              name: cw20.cw20_contract.name,
              symbol: cw20.cw20_contract.symbol
            }
          },
          balance: cw20.amount,
          contract_address: cw20.cw20_contract.smart_contract.address
        }))
      },
      CW721: {
        asset: accountAssetData?.cw721_token?.map((cw721) => ({
          contract_address: cw721.cw721_contract.smart_contract.address
        }))
      }
    },
    balance: accountInfoData?.balances?.map((balance) => {
      if (balance.denom === getCoinMinimalDenom()) {
        return {
          amount: balance.amount,
          denom: balance.base_denom ?? balance.denom,
        }
      }
      return {
        amount: balance.amount,
        denom: balance.base_denom ?? balance.denom,
        minimal_denom: balance.denom
      }

    }),
    sequence: String(accountInfoData?.sequence)
  }

  const safeInfoData: SafeInfo = {
    address: {
      value: mSafeInfotData.address,
      logoUri: null,
      name: null,
    },
    chainId: _getChainId(),
    nonce: 0,
    threshold: mSafeInfotData.threshold,
    owners: mSafeInfotData.owners?.map((owners) => ({
      value: owners,
      logoUri: null,
      name: null,
    })),
    implementation: {
      value: '',
      logoUri: null,
      name: null,
    },
    modules: [
      {
        value: '',
        logoUri: null,
        name: null,
      },
    ],
    guard: {
      value: '',
      logoUri: null,
      name: null,
    },
    fallbackHandler: {
      value: '',
      logoUri: null,
      name: null,
    },
    version: '',
    collectiblesTag: '',
    txQueuedTag: mSafeInfotData.txQueuedTag,
    txHistoryTag: mSafeInfotData.txHistoryTag,
  }

  return [formatMSafeInfotData, safeInfoData, accountInfoData, isSafeLoaded]



}
