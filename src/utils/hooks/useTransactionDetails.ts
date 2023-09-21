import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTransactionDetailsById } from 'src/logic/safe/store/actions/fetchTransactionDetails'
import { getTransactionByAttribute } from 'src/logic/safe/store/selectors/gatewayTransactions'
import { AppReduxState } from 'src/logic/safe/store'

type LoadTransactionDetails = {
  data?: any
  loading: boolean
}

export const useTransactionDetails = (
  transactionId?: string,
  txHash?: string,
  auraTxId?: string,
): LoadTransactionDetails => {
  const dispatch = useRef(useDispatch())
  const [txDetails, setTxDetails] = useState<LoadTransactionDetails>({
    loading: true,
    data: undefined,
  })
  const data = useSelector((state: AppReduxState) =>
    getTransactionByAttribute(state, {
      attributeValue: transactionId ? transactionId : auraTxId,
      attributeName: transactionId ? 'id' : 'auraTxId',
    }),
  )
  useEffect(() => {
    const dataTemp = {
      ...data?.txDetails,
    }

    if (data?.txDetails) {
      setTxDetails({ loading: false, data: dataTemp })
    } else {
      dispatch.current(fetchTransactionDetailsById({ transactionId, auraTxId }))
    }
  }, [data?.txDetails, transactionId, txHash, auraTxId])

  return txDetails
}
