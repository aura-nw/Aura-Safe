import { getTransactionHistory, getTransactionQueue, TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { _getChainId } from 'src/config'
import { HistoryGatewayResponse, QueuedGatewayResponse } from 'src/logic/safe/store/models/types/gateway.d'
import { checksumAddress } from 'src/utils/checksumAddress'
import { Errors, CodedException } from 'src/logic/exceptions/CodedException'
import { GATEWAY_URL } from 'src/utils/constants'
import { getAllTx } from 'src/services'
import {
  makeQueueTransactionsFromService,
  makeHistoryTransactionsFromService,
} from 'src/routes/safe/components/Transactions/TxList/utils'
import isEqual from 'lodash/isEqual'
import { DEFAULT_PAGE_FIRST, DEFAULT_PAGE_SIZE } from 'src/services/constant/common'
import { ITransactionListQuery } from 'src/types/transaction'
import { CloudCircleOutlined } from '@material-ui/icons'

/*************/
/*  HISTORY  */
/*************/
const historyPointers: { [chainId: string]: { [safeAddress: string]: { next?: string; previous?: string } } } = {}

/**
 * Fetch next page if there is a next pointer for the safeAddress.
 * If the fetch was success, updates the pointers.
 * @param {string} safeAddress
 */
export const loadPagedHistoryTransactions = async (
  safeAddress: string,
): Promise<{ values: HistoryGatewayResponse['results']; next?: string } | undefined> => {
  const chainId = _getChainId()
  // if `historyPointers[safeAddress] is `undefined` it means `loadHistoryTransactions` wasn't called
  // if `historyPointers[safeAddress].next is `null`, it means it reached the last page in gateway-client
  if (!historyPointers[chainId][safeAddress]?.next) {
    throw new CodedException(Errors._608)
  }

  try {
    const { results, next, previous } = await getTransactionHistory(
      GATEWAY_URL,
      chainId,
      checksumAddress(safeAddress),
      historyPointers[chainId][safeAddress].next,
    )

    historyPointers[chainId][safeAddress] = { next, previous }

    return { values: results, next: historyPointers[chainId][safeAddress].next }
  } catch (e) {
    throw new CodedException(Errors._602, e.message)
  }
}

export const loadHistoryTransactions = async (safeAddress: string): Promise<HistoryGatewayResponse['results']> => {
  const chainId = _getChainId()
  try {
    const { results, next, previous } = await getTransactionHistory(GATEWAY_URL, chainId, checksumAddress(safeAddress))

    if (!historyPointers[chainId]) {
      historyPointers[chainId] = {}
    }

    if (!historyPointers[chainId][safeAddress]) {
      historyPointers[chainId][safeAddress] = { next, previous }
    }

    return results
  } catch (e) {
    throw new CodedException(Errors._602, e.message)
  }
}

export const loadHistoryTransactionsFromAuraApi = async (
  safeAddress: string,
): Promise<HistoryGatewayResponse['results']> => {
  const chainId = _getChainId()
  try {
    const { Data: list } = await getAllTx({
      safeAddress,
      pageIndex: DEFAULT_PAGE_FIRST,
      pageSize: DEFAULT_PAGE_SIZE,
      isHistory: true,
    })
    const { results, next, previous } = makeHistoryTransactionsFromService(list)
    if (!historyPointers[chainId]) {
      historyPointers[chainId] = {}
    }

    if (!historyPointers[chainId][safeAddress]) {
      historyPointers[chainId][safeAddress] = { next, previous }
    }

    return results
  } catch (e) {
    throw new CodedException(Errors._602, e.message)
  }
}

export const loadPageHistoryTransactionsFromAuraApi = async (
  safeAddress: string,
): Promise<{ values: HistoryGatewayResponse['results']; next?: string } | undefined> => {
  const chainId = _getChainId()
  try {
    // const { results, next, previous } = await getTransactionHistory(GATEWAY_URL, chainId, checksumAddress(safeAddress))

    const history = historyPointers[chainId][safeAddress]
    if (!history?.next) {
      return
    }

    const _next = JSON.parse(history.next || '')

    if (!_next) {
      return
    }
    const pageNext = _next.pageIndex

    const payload: ITransactionListQuery = {
      safeAddress,
      pageIndex: pageNext,
      pageSize: DEFAULT_PAGE_SIZE,
      isHistory: true,
    }

    const { Data: list } = await getAllTx(payload)

    const { results, next, previous } = makeHistoryTransactionsFromService(list, payload)

    historyPointers[chainId][safeAddress] = { next, previous }

    return { values: results, next: historyPointers[chainId][safeAddress].next }
  } catch (e) {
    throw new CodedException(Errors._602, e.message)
  }
}
/************/
/*  QUEUED  */
/************/
const queuedPointers: {
  [chainId: string]: { [safeAddress: string]: { next?: string; previous?: string; current?: TransactionListItem[] } }
} = {}
const queuedTransactions: { [chainId: string]: { [safeAddress: string]: { txs?: TransactionListItem[] } } } = {}

/**
 * Fetch next page if there is a next pointer for the safeAddress.
 * If the fetch was success, updates the pointers.
 * @param {string} safeAddress
 */
export const loadPagedQueuedTransactions = async (
  safeAddress: string,
): Promise<{ values: QueuedGatewayResponse['results']; next?: string } | undefined> => {
  const chainId = _getChainId()
  // if `queuedPointers[safeAddress] is `undefined` it means `loadHistoryTransactions` wasn't called
  // if `queuedPointers[safeAddress].next is `null`, it means it reached the last page in gateway-client
  if (!queuedPointers[safeAddress]?.next) {
    throw new CodedException(Errors._608)
  }

  try {
    const { results, next, previous } = await getTransactionQueue(
      GATEWAY_URL,
      chainId,
      checksumAddress(safeAddress),
      queuedPointers[chainId][safeAddress].next,
    )

    queuedPointers[chainId][safeAddress] = { next, previous }

    return { values: results, next: queuedPointers[chainId][safeAddress].next }
  } catch (e) {
    throw new CodedException(Errors._603, e.message)
  }
}

export const loadQueuedTransactions = async (safeAddress: string): Promise<QueuedGatewayResponse['results']> => {
  const chainId = _getChainId()
  try {
    const { results, next, previous } = await getTransactionQueue(GATEWAY_URL, chainId, checksumAddress(safeAddress))

    if (!queuedPointers[chainId]) {
      queuedPointers[chainId] = {}
    }

    if (!queuedPointers[chainId][safeAddress] || queuedPointers[chainId][safeAddress].next === null) {
      queuedPointers[chainId][safeAddress] = { next, previous }
    }

    return results
  } catch (e) {
    throw new CodedException(Errors._603, e.message)
  }
}

export const loadQueuedTransactionsFromAuraApi = async (
  safeAddress: string,
  isNext = false,
): Promise<QueuedGatewayResponse['results'] | null> => {
  const chainId = _getChainId()

  try {
    const { Data: list } = await getAllTx({
      safeAddress,
      isHistory: false,
      pageIndex: DEFAULT_PAGE_FIRST,
      pageSize: DEFAULT_PAGE_SIZE,
    })
    let { results, next, previous } = makeQueueTransactionsFromService(list)

    let ret: QueuedGatewayResponse['results'] | null = results
    if (!queuedPointers[chainId]) {
      queuedPointers[chainId] = {}
    }

    if (!queuedPointers[chainId][safeAddress] || queuedPointers[chainId][safeAddress].next === null) {
      queuedPointers[chainId][safeAddress] = { next, previous }
    }

    if (!queuedTransactions[chainId]) {
      queuedTransactions[chainId] = {}
    }

    if (queuedTransactions[chainId][safeAddress]) {
      const queuedPointerValue = queuedTransactions[chainId][safeAddress]?.txs || []
      if (isEqual(results, queuedPointerValue)) {
        ret = null
      } else {
        queuedTransactions[chainId][safeAddress] = { txs: results }
      }
    } else {
      queuedTransactions[chainId][safeAddress] = { txs: results }
    }

    return ret
  } catch (e) {
    throw new CodedException(Errors._602, e.message)
  }
}

export const loadPageQueuedTransactionsFromAuraApi = async (
  safeAddress: string,
  isNext = false,
): Promise<{ values: HistoryGatewayResponse['results']; next?: string } | undefined> => {
  const chainId = _getChainId()

  try {
    const queued = queuedPointers[chainId][safeAddress]
    if (!queued?.next) {
      return
    }

    const parseNext = JSON.parse(queued.next || '')
    const pageNext = parseNext.pageIndex

    const payload: ITransactionListQuery = {
      safeAddress,
      pageIndex: pageNext,
      pageSize: DEFAULT_PAGE_SIZE,
      isHistory: false,
    }

    const { Data: list } = await getAllTx(payload)

    let { results, next, previous } = makeQueueTransactionsFromService(list, payload)

    queuedPointers[chainId][safeAddress] = { next, previous }

    return { values: results, next: queuedPointers[chainId][safeAddress].next }
  } catch (e) {
    throw new CodedException(Errors._602, e.message)
  }
}
