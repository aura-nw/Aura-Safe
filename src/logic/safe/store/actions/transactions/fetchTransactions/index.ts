import { ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'

import {
  addHistoryTransactions,
  addQueuedTransactions,
} from 'src/logic/safe/store/actions/transactions/gatewayTransactions'
import { loadHistoryTransactions, loadHistoryTransactionsFromAuraApi, loadQueuedTransactions, loadQueuedTransactionsFromAuraApi } from './loadGatewayTransactions'
import { AppReduxState } from 'src/store'

export default (chainId: string, safeAddress: string) =>
  async (dispatch: ThunkDispatch<AppReduxState, undefined, AnyAction>): Promise<void> => {
    const loadTxs = async (
      loadFn: typeof loadHistoryTransactions | typeof loadQueuedTransactions,
      actionFn: typeof addHistoryTransactions | typeof addQueuedTransactions,
    ) => {
      try {
        const values = (await loadFn(safeAddress)) as any[]

        const historys = values.filter(item => item.transaction.Status)
        dispatch(actionFn({ chainId, safeAddress, values }))
      } catch (e) {
        e.log()
      }
    }

    await Promise.all([
      loadTxs(loadQueuedTransactionsFromAuraApi, addQueuedTransactions),
      loadTxs(loadHistoryTransactionsFromAuraApi, addHistoryTransactions),
    ])

    // try {
    //   const response = await getAllTx({
    //     safeAddress,
    //     pageIndex: 1,
    //     pageSize: 10
    //   })

    //   const { Data: list } = response
    //   const historyPayload = (await loadHistoryTransactionsFromAuraApi(safeAddress, list)) as any[]
    //   const queuedPayload = (await loadQueuedTransactionsFromAuraApi(safeAddress, list)) as any[]


    //   dispatch(addHistoryTransactions({ chainId, safeAddress, values: historyPayload }))
    //   dispatch(addQueuedTransactions({ chainId, safeAddress, values: queuedPayload }))

    // } catch (e) {
    //   throw new CodedException(Errors._602, e.message)
    // }
  }
