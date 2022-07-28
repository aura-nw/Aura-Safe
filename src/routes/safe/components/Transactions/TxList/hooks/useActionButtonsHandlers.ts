import { MultisigExecutionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { MouseEvent as ReactMouseEvent, useCallback, useContext, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import useLocalTxStatus from 'src/logic/hooks/useLocalTxStatus'
import { NOTIFICATIONS } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import {
  isMultiSigExecutionDetails,
  LocalTransactionStatus,
  Transaction,
} from 'src/logic/safe/store/models/types/gateway.d'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import { TransactionActionStateContext } from 'src/routes/safe/components/Transactions/TxList/TxActionProvider'
import { TxHoverContext } from 'src/routes/safe/components/Transactions/TxList/TxHoverProvider'
import { useTransactionActions } from './useTransactionActions'

type ActionButtonsHandlers = {
  canCancel: boolean
  handleConfirmButtonClick: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void
  handleCancelButtonClick: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void
  handleOnMouseEnter: () => void
  handleOnMouseLeave: () => void
  isPending: boolean
  isRejected: boolean
  disabledActions: boolean
}

export const useActionButtonsHandlers = (transaction: Transaction): ActionButtonsHandlers => {
  const currentUser = useSelector(userAccountSelector)
  const actionContext = useRef(useContext(TransactionActionStateContext))
  const hoverContext = useRef(useContext(TxHoverContext))
  // const locationContext = useContext(TxLocationContext)
  const dispatch = useDispatch()
  const { canCancel, canConfirmThenExecute, canExecute } = useTransactionActions(transaction) // check this
  const txStatus = useLocalTxStatus(transaction)
  const isPending = txStatus === LocalTransactionStatus.PENDING

  const handleConfirmButtonClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation()

      if (transaction.txDetails && isMultiSigExecutionDetails(transaction.txDetails.detailedExecutionInfo)) {
        const details = transaction.txDetails.detailedExecutionInfo
        if (
          (canExecute && details.confirmationsRequired > details.confirmations.length) ||
          (canConfirmThenExecute && details.confirmationsRequired - 1 > details.confirmations.length)
        ) {
          dispatch(enqueueSnackbar(NOTIFICATIONS.TX_FETCH_SIGNATURES_ERROR_MSG))
          return
        }
      }
      actionContext.current.selectAction({
        actionSelected: canExecute || canConfirmThenExecute ? 'execute' : 'confirm',
        transactionId: transaction.id,
      })
    },
    [canConfirmThenExecute, canExecute, dispatch, transaction.id, transaction.txDetails],
  )

  const handleCancelButtonClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation()
      actionContext.current.selectAction({
        actionSelected: 'cancel',
        transactionId: transaction.id,
      })
    },
    [transaction.id],
  )

  const handleOnMouseEnter = useCallback(() => {
    if (canExecute) {
      hoverContext.current.setActiveHover(transaction.id)
    }
  }, [canExecute, transaction.id])

  const handleOnMouseLeave = useCallback(() => {
    hoverContext.current.setActiveHover()
  }, [])

  // const signaturePending = addressInList(
  //   (transaction.executionInfo as MultisigExecutionInfo)?.missingSigners ?? undefined,
  // )

  const isPendingCurrentUserSignature = (currentUser: string): boolean => {
    if ((transaction?.txDetails?.detailedExecutionInfo as MultisigExecutionDetails)?.confirmations?.length > 0) {
      const signedCurrentUser = (
        transaction?.txDetails?.detailedExecutionInfo as MultisigExecutionDetails
      )?.confirmations.find((x) => x.signer?.value === currentUser)
      if (signedCurrentUser) {
        return false
      }
    }

    if ((transaction?.txDetails?.detailedExecutionInfo as MultisigExecutionDetails)?.signers?.length > 0) {
      const t = (transaction?.txDetails?.detailedExecutionInfo as MultisigExecutionDetails)?.signers?.find(
        (x) => x.value === currentUser,
      )
      return t ? true : false
    }

    return false
  }

  const isRejectedUser = (currentUser: string): boolean => {
    const rejectors = (transaction?.txDetails?.detailedExecutionInfo as MultisigExecutionDetails)?.rejectors
    if (rejectors && rejectors?.length > 0) {
      return !!rejectors.find((rejector) => rejector.value === currentUser)
    }
    return false
  }

  const disabledActions =
    !currentUser ||
    isPending ||
    // (txStatus === LocalTransactionStatus.AWAITING_EXECUTION && locationContext.txLocation === 'queued.queued') ||
    (txStatus === LocalTransactionStatus.AWAITING_CONFIRMATIONS && !isPendingCurrentUserSignature(currentUser))

  const isRejected = isRejectedUser(currentUser)

  return {
    canCancel,
    handleConfirmButtonClick,
    handleCancelButtonClick,
    handleOnMouseEnter,
    handleOnMouseLeave,
    isPending,
    isRejected,
    disabledActions,
  }
}
