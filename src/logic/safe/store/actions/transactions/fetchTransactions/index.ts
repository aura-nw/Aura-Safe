import { ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'

import {
  addHistoryTransactions,
  addQueuedTransactions,
} from 'src/logic/safe/store/actions/transactions/gatewayTransactions'
import { loadHistoryTransactionsFromAuraApi, loadQueuedTransactionsFromAuraApi } from './loadGatewayTransactions'
import { AppReduxState } from 'src/store'

export default (chainId: string, safeAddress: string, loadQueued = false) =>
  async (dispatch: ThunkDispatch<AppReduxState, undefined, AnyAction>): Promise<void> => {
    const loadTxs = async (
      loadFn: typeof loadHistoryTransactionsFromAuraApi | typeof loadQueuedTransactionsFromAuraApi,
      actionFn: typeof addHistoryTransactions | typeof addQueuedTransactions,
    ) => {
      try {
        const values = (await loadFn(safeAddress))

        if (!values) {
          return
        }

        dispatch(actionFn({ chainId, safeAddress, values }))
      } catch (e) {
        e.log()
      }
    }

    loadQueued ? await Promise.all([
      loadTxs(loadQueuedTransactionsFromAuraApi, addQueuedTransactions),
    ]) : await Promise.all([
      loadTxs(loadQueuedTransactionsFromAuraApi, addQueuedTransactions),
      loadTxs(loadHistoryTransactionsFromAuraApi, addHistoryTransactions),
    ])
  }
