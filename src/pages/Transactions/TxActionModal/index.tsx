import { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getChainInfo, getInternalChainId } from 'src/config'
import { NOTIFICATIONS } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import fetchTransactions from 'src/logic/safe/store/actions/transactions/fetchTransactions'
import { txTransactions } from 'src/logic/safe/store/selectors/gatewayTransactions'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import { extractSafeAddress } from 'src/routes/routes'
import { deleteTransactionById, rejectTransactionById, sendSafeTransaction } from 'src/services'
import { TxSignModalContext } from '../Queue'
import ClaimRewardPopup from './ClaimReward'
import ContractInteractionPopup from './ContractInteraction'
import CustomTransactionPopup from './CustomTransaction'
import DelegatePopup from './Delegate'
import MultiSendPopup from './MultiSend'
import RedelegatePopup from './Redelegate'
import SendPopup from './Send'
import UndelegatePopup from './Undelegate'
import VotePopup from './Vote'

export default function TxActionModal() {
  const { open, txId, setOpen, action } = useContext(TxSignModalContext)
  const allTxs = useSelector(txTransactions) || {}
  let txData: any = null
  for (const sequence of Object.keys(allTxs)) {
    txData = allTxs[sequence].find((tx) => tx.id == txId)
    if (txData) {
      break
    }
  }

  const type = txData?.txInfo?.typeUrl
  const [isDisabled, setIsDisabled] = useState(false)
  const userWalletAddress = useSelector(userAccountSelector)
  const dispatch = useDispatch()
  const safeAddress = extractSafeAddress()

  const sendTx = async () => {
    try {
      setIsDisabled(true)
      const payload = {
        transactionId: txData.txDetails.txId,
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
      setIsDisabled(false)
      const chainInfo = getChainInfo()
      const chainId = chainInfo.chainId
      dispatch(fetchTransactions(chainId, safeAddress))
      setOpen(false)
    } catch (error) {
      setIsDisabled(false)
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

  const rejectTx = async () => {
    try {
      setIsDisabled(true)
      const payload = {
        transactionId: txData.txDetails.txId,
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
      setIsDisabled(false)
      const chainInfo = getChainInfo()
      const chainId = chainInfo.chainId
      dispatch(fetchTransactions(chainId, safeAddress))
      setOpen(false)
    } catch (error) {
      setIsDisabled(false)
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
  const deleteTx = async () => {
    try {
      setIsDisabled(true)
      const payload = {
        id: txData.txDetails.txId,
      }
      const result = await deleteTransactionById(payload)
      const { ErrorCode } = result

      if (ErrorCode === 'SUCCESSFUL') {
        dispatch(enqueueSnackbar(NOTIFICATIONS.TX_DELETED_MSG_SUCCESS))
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
      setIsDisabled(false)
      const chainInfo = getChainInfo()
      const chainId = chainInfo.chainId
      dispatch(fetchTransactions(chainId, safeAddress))
      setOpen(false)
    } catch (error) {
      setIsDisabled(false)
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
  if (!txData || !open || !txId) return <></>
  if (type == MsgTypeUrl.ExecuteContract) {
    return (
      <ContractInteractionPopup
        open={open}
        onClose={() => setOpen(false)}
        data={txData}
        sendTx={sendTx}
        rejectTx={rejectTx}
        deleteTx={deleteTx}
        disabled={isDisabled}
        setDisabled={setIsDisabled}
      />
    )
  }
  if (type == MsgTypeUrl.Delegate) {
    return (
      <DelegatePopup
        open={open}
        onClose={() => setOpen(false)}
        data={txData}
        sendTx={sendTx}
        rejectTx={rejectTx}
        deleteTx={deleteTx}
        disabled={isDisabled}
        setDisabled={setIsDisabled}
      />
    )
  }
  if (type == MsgTypeUrl.Undelegate) {
    return (
      <UndelegatePopup
        open={open}
        onClose={() => setOpen(false)}
        data={txData}
        sendTx={sendTx}
        rejectTx={rejectTx}
        deleteTx={deleteTx}
        disabled={isDisabled}
        setDisabled={setIsDisabled}
      />
    )
  }
  if (type == MsgTypeUrl.Send) {
    return (
      <SendPopup
        open={open}
        onClose={() => setOpen(false)}
        data={txData}
        sendTx={sendTx}
        rejectTx={rejectTx}
        deleteTx={deleteTx}
        disabled={isDisabled}
        setDisabled={setIsDisabled}
      />
    )
  }
  if (type == MsgTypeUrl.MultiSend) {
    return (
      <MultiSendPopup
        open={open}
        onClose={() => setOpen(false)}
        data={txData}
        sendTx={sendTx}
        rejectTx={rejectTx}
        deleteTx={deleteTx}
        disabled={isDisabled}
        setDisabled={setIsDisabled}
      />
    )
  }
  if (type == MsgTypeUrl.Redelegate) {
    return (
      <RedelegatePopup
        open={open}
        onClose={() => setOpen(false)}
        data={txData}
        sendTx={sendTx}
        rejectTx={rejectTx}
        deleteTx={deleteTx}
        disabled={isDisabled}
        setDisabled={setIsDisabled}
      />
    )
  }
  if (type == MsgTypeUrl.Vote) {
    return (
      <VotePopup
        open={open}
        onClose={() => setOpen(false)}
        data={txData}
        sendTx={sendTx}
        rejectTx={rejectTx}
        deleteTx={deleteTx}
        disabled={isDisabled}
        setDisabled={setIsDisabled}
      />
    )
  }
  if (type == MsgTypeUrl.GetReward) {
    return (
      <ClaimRewardPopup
        open={open}
        onClose={() => setOpen(false)}
        data={txData}
        sendTx={sendTx}
        rejectTx={rejectTx}
        deleteTx={deleteTx}
        disabled={isDisabled}
        setDisabled={setIsDisabled}
      />
    )
  }
  return (
    <CustomTransactionPopup
      open={open}
      onClose={() => setOpen(false)}
      data={txData}
      sendTx={sendTx}
      rejectTx={rejectTx}
      deleteTx={deleteTx}
      disabled={isDisabled}
      setDisabled={setIsDisabled}
    />
  )
}

export const getTitle = (action) => {
  switch (action) {
    case 'confirm':
      return 'Confirm transaction'
    case 'reject':
      return 'Reject transaction'
    case 'change-sequence':
      return 'Reprioritize transaction'
    case 'delete':
      return 'Delete transaction'

    default:
      return 'Execute transaction'
  }
}
export const getNotice = (action) => {
  switch (action) {
    case 'confirm':
      return 'You’re about to confirm a transaction and will have to sign it using your currently connected wallet.'
    case 'reject':
      return 'You’re about to reject a transaction. This action cannot be undone. Please make sure before proceeding.'
    case 'change-sequence':
      return 'Reprioritizing a transaction will delete the transaction itself and create another one with the same data so that you can modify the sequence. You and other owner(s) will have to resign the newly-created transaction.'
    case 'delete':
      return 'Deleting a transaction will mark the transaction as deleted and move it to transaction history. Other owner will see that you were the one who deleted the transaction.'
    default:
      return 'You’re about to execute a transaction and will have to confirm it with your currently connected wallet. Make sure you have enough funds in thís safe to fund the associated transaction amount and fee.'
  }
}
