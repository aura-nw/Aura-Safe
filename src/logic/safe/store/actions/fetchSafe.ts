import { Dispatch } from 'redux'
import { Action } from 'redux-actions'

import { updateSafe } from 'src/logic/safe/store/actions/updateSafe'
import { SafeRecordProps } from 'src/logic/safe/store/models/safe'
import { getLocalSafe } from 'src/logic/safe/utils'
import { getSafeInfo } from 'src/logic/safe/utils/safeInformation'
import { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { checksumAddress } from 'src/utils/checksumAddress'
import { buildSafeOwners, extractRemoteSafeInfo } from './utils'
import { Errors, logError } from 'src/logic/exceptions/CodedException'
import { store } from 'src/store'
import { currentSafeWithNames } from '../selectors'
import fetchTransactions from './transactions/fetchTransactions'
import { fetchCollectibles } from 'src/logic/collectibles/store/actions/fetchCollectibles'
import { currentChainId } from 'src/logic/config/store/selectors'
import { getMSafeInfo } from 'src/services'
import { IMSafeInfo } from 'src/types/safe'
import { _getChainId } from 'src/config'
import { fetchMSafeTokens } from 'src/logic/tokens/store/actions/fetchSafeTokens'

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

  const safeInfoDta: SafeInfo = await _getSafeInfo(safeAddress, safeId);

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
      let address = safeAddress

      let safeInfo: Partial<SafeRecordProps> = {}
      let remoteSafeInfo: SafeInfo | null = null

      try {
        remoteSafeInfo = await _getSafeInfo(safeAddress, safeId, dispatch);
      } catch (err) {
        console.error(err)
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

        if (isInitialLoad) {
          dispatch(fetchTransactions(chainId, safeAddress))
        }
      }

      const owners = buildSafeOwners(remoteSafeInfo?.owners)

      return dispatch(updateSafe({ address, ...safeInfo, owners, safeId: safeId }))
    }



async function _getSafeInfo(safeAddress: string, safeId: number, dispatch?: Dispatch<any>): Promise<SafeInfo> {
  const info: IMSafeInfo = await getMSafeInfo(safeId);
  if (dispatch) await dispatch(fetchMSafeTokens(info))
  return {
    address: {
      value: safeAddress,
      logoUri: null,
      name: null
    },
    chainId: _getChainId(),
    nonce: 0,
    threshold: info.threshold,
    owners: info.owners?.map(owners => ({
      value: owners,
      logoUri: null,
      name: null
    })),
    implementation: {
      value: '',
      logoUri: null,
      name: null
    },
    modules: [{
      value: '',
      logoUri: null,
      name: null
    }],
    guard: {
      value: '',
      logoUri: null,
      name: null
    },
    fallbackHandler: {
      value: '',
      logoUri: null,
      name: null
    },
    version: '',
    collectiblesTag: '',
    txQueuedTag: '',
    txHistoryTag: '',
  }

}