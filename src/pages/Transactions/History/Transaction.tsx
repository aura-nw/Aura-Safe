import { AccordionDetails } from '@aura/safe-react-components'
import { fromBech32 } from '@cosmjs/encoding'
import { useEffect, useState } from 'react'
import { getDetailToken } from 'src/services'
import { formatTimeInWords } from 'src/utils/date'
import TxAmount from '../components/TxAmount'
import TxDetail from '../components/TxDetail'
import TxSequence from '../components/TxSequence'
import TxStatus from '../components/TxStatus'
import TxTime from '../components/TxTime'
import TxType from '../components/TxType'
import { NoPaddingAccordion, StyledAccordionSummary, StyledTransaction } from '../styled'

export default function Transaction({ transaction, notFirstTx, listTokens }) {
  let defToken
  const [isAddress, setIsAddress] = useState<boolean>(false)
  const [txDetailLoaded, setTxDetailLoaded] = useState(false)
  if (transaction.txInfo.contractAddress && isAddress) {
    defToken = listTokens.find((t) => t.address === transaction.txInfo.contractAddress)
  } else {
    defToken = listTokens.find(
      (t) =>
        t.denom === transaction.txInfo.denom ||
        t.symbol === transaction.txInfo.denom ||
        t.cosmosDenom === transaction.txInfo.denom,
    )
  }
  const [token, setToken] = useState(defToken)

  useEffect(() => {
    setToken(defToken)
  }, [listTokens])

  useEffect(() => {
    if (transaction.txInfo.contractAddress) {
      try {
        const data = fromBech32(transaction.txInfo.contractAddress)
        if (data) {
          setIsAddress(true)
        }
      } catch (e) {
        setIsAddress(false)
      }
    }
  }, [transaction.txInfo.contractAddress])

  useEffect(() => {
    if (!token && isAddress && transaction.txInfo.amount) {
      getContractDetail()
    }
  }, [token, isAddress])

  if (!transaction) {
    return null
  }

  const getContractDetail = async () => {
    try {
      const { data } = await getDetailToken(transaction?.txInfo?.contractAddress)
      setToken({ ...data, isNotExist: true, address: transaction.txInfo.contractAddress })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <NoPaddingAccordion
      id={`tx-${transaction.id}`}
      onChange={() => setTxDetailLoaded(true)}
      TransitionProps={{
        mountOnEnter: false,
        unmountOnExit: true,
        appear: true,
      }}
    >
      <StyledAccordionSummary>
        <StyledTransaction shouldBlur={transaction.txStatus == 'REPLACED'}>
          {notFirstTx ? (
            <TxSequence style={{ visibility: 'hidden' }} sequence={transaction.txSequence} />
          ) : (
            <TxSequence sequence={transaction.txSequence} />
          )}
          <TxType type={transaction.txInfo.displayType ?? transaction.txInfo.typeUrl} />
          <TxAmount amount={transaction.txInfo.amount} token={token} />
          <TxTime time={transaction.timestamp ? formatTimeInWords(transaction.timestamp) : 'Unknown'} />
          <TxStatus transaction={transaction} />
        </StyledTransaction>
      </StyledAccordionSummary>
      <AccordionDetails>
        {txDetailLoaded && <TxDetail transaction={transaction} isHistoryTx token={token} />}
      </AccordionDetails>
    </NoPaddingAccordion>
  )
}
