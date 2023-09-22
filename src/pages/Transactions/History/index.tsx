import { Loader, Title } from '@aura/safe-react-components'
import { Fragment, ReactElement, useEffect } from 'react'

import { useSelector } from 'react-redux'
import NoTransactionsImage from 'src/assets/icons/no-transactions.svg'
import Img from 'src/components/layout/Img'
import { useQuery } from 'src/utils'
import { formatWithSchema } from 'src/utils/date'
import { extendedSafeTokensSelector } from 'src/utils/safeUtils/selector'
import { usePagedHistoryTransactions } from '../../../utils/hooks/usePagedHistoryTransactions'
import {
  AccordionWrapper,
  Centered,
  HorizontallyCentered,
  NoTransactions,
  ScrollableTransactionsContainer,
  SubTitle,
} from '../styled'
import Transaction from './Transaction'
export default function HistoryTransactions(): ReactElement {
  const { count, isLoading, transactions: historyTx } = usePagedHistoryTransactions()
  const queryParams = useQuery()
  const transactionId = queryParams.get('transactionId')
  const listTokens: any = useSelector(extendedSafeTokensSelector)

  const expandTx = () => {
    const elem = document.getElementById(`tx-${transactionId}`) as any
    if (!elem) {
      setTimeout(() => expandTx(), 500)
    } else {
      if (elem?.childNodes.length == 1) {
        elem?.childNodes[0]?.click()
      }
      elem?.scrollIntoView(true)
    }
  }

  useEffect(() => {
    expandTx()
  }, [transactionId])

  useEffect(() => {
    if (transactionId) {
      const elem = document.getElementById(`tx-${transactionId}`) as any
      elem?.scrollIntoView(true)
    }
  })

  if (count === 0 && isLoading) {
    return (
      <Centered>
        <Loader size="md" />
      </Centered>
    )
  }
  if (count === 0 || !historyTx) {
    return (
      <NoTransactions>
        <Img alt="No Transactions yet" src={NoTransactionsImage} />
        <Title size="xs">Queue transactions will appear here </Title>
      </NoTransactions>
    )
  }

  return (
    <ScrollableTransactionsContainer>
      {historyTx &&
        count !== 0 &&
        historyTx.map(([nonce, txs], index) => {
          return (
            <Fragment key={nonce}>
              <SubTitle>{formatWithSchema(Number(nonce), 'MMM d, yyyy')}</SubTitle>
              {txs.map((tx, index, txs) => {
                return (
                  <AccordionWrapper
                    key={index}
                    hasSameSeqTxAfter={txs[index].txSequence == txs[index + 1]?.txSequence}
                    hasSameSeqTxBefore={txs[index].txSequence == txs[index - 1]?.txSequence}
                    className="history-tx"
                  >
                    <Transaction
                      listTokens={listTokens}
                      transaction={tx}
                      notFirstTx={index == 0 ? false : txs[index].txSequence == txs[index - 1].txSequence}
                    />
                  </AccordionWrapper>
                )
              })}
            </Fragment>
          )
        })}
      <HorizontallyCentered isVisible={isLoading}>
        <Loader size="md" />
      </HorizontallyCentered>
    </ScrollableTransactionsContainer>
  )
}
