import { Loader, Title } from '@gnosis.pm/safe-react-components'
import { ReactElement, useEffect, useState } from 'react'

import { usePagedHistoryTransactions } from './hooks/usePagedHistoryTransactions'
import { Centered, NoTransactions } from './styled'
import { HistoryTxList } from './HistoryTxList'
import { TxsInfiniteScroll } from './TxsInfiniteScroll'
import Img from 'src/components/layout/Img'
import NoTransactionsImage from './assets/no-transactions.svg'
import { ITransactionListItem, ITransactionListQuery } from 'src/types/transaction'
import { getAllTx } from 'src/services'
import { HistoryPayload } from 'src/logic/safe/store/reducer/gatewayTransactions'
import { useSelector } from 'react-redux'
import { currentChainId } from 'src/logic/config/store/selectors'
import { extractSafeAddress } from 'src/routes/routes'

export const HistoryTransactions = (): ReactElement => {
  const { count, hasMore, next, transactions, isLoading } = usePagedHistoryTransactions()

  const [historyList, setHistoryList] = useState<ITransactionListItem[]>([])

  const chainId = useSelector(currentChainId)
  const safeAddress = extractSafeAddress()

  useEffect(() => {
    const payload: ITransactionListQuery = {
      safeAddress,
      pageIndex: 1,
      pageSize: 50,
      isHistory: false
    }

    const getTx = async (payload) => {
      const res = await getAllTx(payload)

      //   const payload2: HistoryPayload = {
      //     chainId,
      //     safeAddress,
      //     values: [
      //       {
      //         transaction: listItemTx,
      //         type: 'TRANSACTION', // Other types are discarded in reducer
      //         conflictType: 'None', // Not used in reducer
      //       },
      //     ],
      //   }
    }

    getTx(payload)
  }, [historyList])

  if (count === 0 && isLoading) {
    return (
      <Centered>
        <Loader size="md" />
      </Centered>
    )
  }

  if (count === 0 || !transactions.length) {
    return (
      <NoTransactions>
        <Img alt="No Transactions yet" src={NoTransactionsImage} />
        <Title size="xs">History transactions will appear here </Title>
      </NoTransactions>
    )
  }

  return (
    <TxsInfiniteScroll next={next} hasMore={hasMore} isLoading={isLoading}>
      <HistoryTxList transactions={transactions} />
    </TxsInfiniteScroll>
  )
}
