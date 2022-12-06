import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  loadPagedQueuedTransactions,
  loadPageQueuedTransactionsFromAuraApi,
} from 'src/logic/safe/store/actions/transactions/fetchTransactions/loadGatewayTransactions'
import { addQueuedTransactions } from 'src/logic/safe/store/actions/transactions/gatewayTransactions'
import { currentChainId } from 'src/logic/config/store/selectors'
import { QueueTransactionsInfo, useQueueTransactions } from './useQueueTransactions'
import { Errors } from 'src/logic/exceptions/CodedException'
import { Await } from 'src/types/helpers'
import { extractSafeAddress } from 'src/routes/routes'
import { isEqual } from 'lodash'

type PagedQueuedTransactions = {
  count: number
  isLoading: boolean
  transactions?: QueueTransactionsInfo
  hasMore: boolean
  next: () => Promise<void>
}

export const usePagedQueuedTransactions = (): PagedQueuedTransactions => {
  const transactions = useQueueTransactions()

  const chainId = useSelector(currentChainId)

  const dispatch = useDispatch()
  const safeAddress = extractSafeAddress()
  const [hasMore, setHasMore] = useState(true)

  const nextPage = async () => {
    let results: Await<ReturnType<typeof loadPageQueuedTransactionsFromAuraApi>>
    try {
      // results = await loadPagedQueuedTransactions(safeAddress)
      results = await loadPageQueuedTransactionsFromAuraApi(safeAddress)
    } catch (e) {
      // No next page
      if (e.content !== Errors._608) {
        e.log()
      }
    }

    if (!results) {
      setHasMore(false)
      return
    }

    const { values, next } = results

    if (next === null) {
      setHasMore(false)
    }

    if (values) {
      dispatch(addQueuedTransactions({ chainId, safeAddress, values }))
    } else {
      setHasMore(false)
    }
  }

  let count
  if (transactions) {
    // count = transactions.next.count + transactions.queue.count
    count = transactions.txs?.count || 0
  }

  const isLoading = typeof transactions === 'undefined' || typeof count === 'undefined'

  return { count, isLoading, transactions, hasMore, next: nextPage }
}