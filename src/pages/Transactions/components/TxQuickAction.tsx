import { coins } from '@cosmjs/stargate'
import { Tooltip } from '@material-ui/core'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Check from 'src/assets/icons/GradientCheck.svg'
import PaperPlaneTiltIcon from 'src/assets/icons/PaperPlaneTilt.svg'
import X from 'src/assets/icons/X.svg'
import { getChainInfo, getCoinMinimalDenom, getInternalChainId } from 'src/config'
import { NOTIFICATIONS, enhanceSnackbarForAction } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import { AppReduxState } from 'src/logic/safe/store'
import { fetchTransactionDetailsById } from 'src/logic/safe/store/actions/fetchTransactionDetails'
import fetchTransactions from 'src/logic/safe/store/actions/transactions/fetchTransactions'
import { getTransactionByAttribute } from 'src/logic/safe/store/selectors/gatewayTransactions'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import { extractSafeAddress } from 'src/routes/routes'
import { rejectTransactionById, sendSafeTransaction } from 'src/services'
import { grantedSelector } from 'src/utils/safeUtils/selector'
import { signAndConfirmTransaction } from 'src/utils/signer'
import styled from 'styled-components'

const Wrap = styled.div`
  display: flex;
  flex: unset !important;
  width: 40px;
  > .action {
    margin: 0px 4px;
  }
`

export default function TxQuickAction({ transaction, curSeq }) {
  const userWalletAddress = useSelector(userAccountSelector)

  const chainInfo = getChainInfo()
  const safeAddress = extractSafeAddress()
  const granted = useSelector(grantedSelector)
  const [loading, setLoading] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const data = useSelector((state: AppReduxState) =>
    getTransactionByAttribute(state, {
      attributeValue: transaction.id ? transaction.id : transaction.auraTxId,
      attributeName: transaction.id ? 'id' : 'auraTxId',
    }),
  )
  const dispatch = useDispatch()

  useEffect(() => {
    if (isWaiting && data?.txDetails) {
      confirmHandler(null)
    }
  }, [data?.txDetails, isWaiting])

  const confirmHandler = async (event) => {
    event?.stopPropagation()
    if (event && loading) return
    try {
      setLoading(true)
      event && dispatch(enqueueSnackbar(NOTIFICATIONS.TX_CREATE_MSG))
      if (!data?.txDetails) {
        dispatch(fetchTransactionDetailsById({ transactionId: transaction.id }))
        setIsWaiting(true)
        return
      }
      setIsWaiting(false)
      dispatch(
        signAndConfirmTransaction(
          data?.id,
          JSON.parse(data?.txDetails?.rawMessage),
          {
            amount: coins(data?.txDetails?.fee, getCoinMinimalDenom()),
            gas: data?.txDetails?.gas.toString(),
          },
          data?.txSequence as string,
          undefined,
          () => {},
          () => {
            setLoading(false)
          },
          () => {
            setLoading(false)
          },
        ),
      )
    } catch (error) {
      dispatch(
        enqueueSnackbar(
          enhanceSnackbarForAction(
            error?.message
              ? {
                  message: error?.message,
                  options: { variant: 'error', persist: false, autoHideDuration: 5000, preventDuplicate: true },
                }
              : NOTIFICATIONS.TX_REJECTED_MSG,
          ),
        ),
      )
    }
  }

  const rejectHandler = async (event) => {
    event?.stopPropagation()
    if (loading) return
    try {
      dispatch(enqueueSnackbar(NOTIFICATIONS.TX_CREATE_MSG))
      setLoading(true)
      const payload = {
        transactionId: transaction.id,
        internalChainId: getInternalChainId(),
      }
      const result = await rejectTransactionById(payload)
      const { ErrorCode } = result

      if (ErrorCode === 'SUCCESSFUL') {
        dispatch(enqueueSnackbar(NOTIFICATIONS.TX_REJECTED_MSG_SUCCESS))
      } else {
        dispatch(
          enqueueSnackbar(
            result?.Message
              ? {
                  message: result?.Message,
                  options: { variant: 'error', persist: false, autoHideDuration: 5000, preventDuplicate: true },
                }
              : NOTIFICATIONS.TX_FAILED_MSG,
          ),
        )
      }
      setLoading(false)
      const chainInfo = getChainInfo()
      const chainId = chainInfo.chainId
      dispatch(fetchTransactions(chainId, safeAddress))
    } catch (error) {
      setLoading(false)
      dispatch(
        enqueueSnackbar(
          error?.message
            ? {
                message: error?.message,
                options: { variant: 'error', persist: false, autoHideDuration: 5000, preventDuplicate: true },
              }
            : NOTIFICATIONS.TX_FAILED_MSG,
        ),
      )
    }
  }

  const executeHandler = async (event) => {
    event?.stopPropagation()
    if (loading) return
    try {
      dispatch(enqueueSnackbar(NOTIFICATIONS.TX_CREATE_MSG))
      setLoading(true)
      const payload = {
        transactionId: transaction.id,
        internalChainId: getInternalChainId(),
        owner: userWalletAddress,
      }
      const result = await sendSafeTransaction(payload)
      const { ErrorCode } = result

      if (ErrorCode === 'SUCCESSFUL') {
        dispatch(enqueueSnackbar(NOTIFICATIONS.TX_EXECUTED_MSG))
      } else {
        dispatch(
          enqueueSnackbar(
            result?.Message
              ? {
                  message: result?.Message,
                  options: { variant: 'error', persist: false, autoHideDuration: 5000, preventDuplicate: true },
                }
              : NOTIFICATIONS.TX_FAILED_MSG,
          ),
        )
      }
      setLoading(false)
      const chainInfo = getChainInfo()
      const chainId = chainInfo.chainId
      dispatch(fetchTransactions(chainId, safeAddress))
    } catch (error) {
      setLoading(false)
      dispatch(
        enqueueSnackbar(
          error?.message
            ? {
                message: error?.message,
                options: { variant: 'error', persist: false, autoHideDuration: 5000, preventDuplicate: true },
              }
            : NOTIFICATIONS.TX_FAILED_MSG,
        ),
      )
    }
  }

  if (!granted) return <Wrap></Wrap>

  if (transaction?.executionInfo?.confirmationsRequired <= transaction?.executionInfo?.confirmationsSubmitted.length) {
    if (+curSeq != +transaction.txSequence || transaction.txStatus == 'PENDING') {
      return <Wrap></Wrap>
    }
    return (
      <Wrap>
        <div className="action" onClick={executeHandler}>
          <Tooltip arrow placement="top" title="Execute">
            <img src={PaperPlaneTiltIcon} alt="" />
          </Tooltip>
        </div>
      </Wrap>
    )
  }

  if (
    transaction?.executionInfo?.confirmationsSubmitted?.includes(userWalletAddress) ||
    transaction?.executionInfo?.rejections?.includes(userWalletAddress)
  ) {
    return <Wrap></Wrap>
  }

  return (
    <Wrap>
      <div className="action" onClick={confirmHandler}>
        <Tooltip arrow placement="top" title="Confirm">
          <img src={Check} alt="" />
        </Tooltip>
      </div>
      <div className="action" onClick={rejectHandler}>
        <Tooltip arrow placement="top" title="Reject">
          <img src={X} alt="" />
        </Tooltip>
      </div>
    </Wrap>
  )
}
