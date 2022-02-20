import { ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'

import {
  addHistoryTransactions,
  addQueuedTransactions,
} from 'src/logic/safe/store/actions/transactions/gatewayTransactions'
import { loadHistoryTransactions, loadHistoryTransactions2, loadQueuedTransactions, loadQueuedTransactionsFromAuraApi } from './loadGatewayTransactions'
import { AppReduxState } from 'src/store'

export default (chainId: string, safeAddress: string) =>
  async (dispatch: ThunkDispatch<AppReduxState, undefined, AnyAction>): Promise<void> => {
    const loadTxs = async (
      loadFn: typeof loadHistoryTransactions | typeof loadQueuedTransactions,
      actionFn: typeof addHistoryTransactions | typeof addQueuedTransactions,
    ) => {
      try {
        const values = (await loadFn(safeAddress)) as any[]
        dispatch(actionFn({ chainId, safeAddress, values }))
      } catch (e) {
        e.log()
      }
    }

    await Promise.all([
      loadTxs(loadHistoryTransactions2, addHistoryTransactions),
      loadTxs(loadQueuedTransactionsFromAuraApi, addQueuedTransactions),
    ])
  }
