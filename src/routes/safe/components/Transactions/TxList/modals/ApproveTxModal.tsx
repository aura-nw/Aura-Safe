import { List } from 'immutable'
import {
  Erc20Transfer,
  Erc721Transfer,
  MultisigExecutionDetails,
  MultisigExecutionInfo,
  Operation,
  TokenType,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useStyles } from './style'

import Modal, { ButtonStatus, Modal as GenericModal } from 'src/components/Modal'
import { ReviewInfoText } from 'src/components/ReviewInfoText'
import Block from 'src/components/layout/Block'
import Bold from 'src/components/layout/Bold'
import Hairline from 'src/components/layout/Hairline'
import Paragraph from 'src/components/layout/Paragraph'
import Row from 'src/components/layout/Row'
import { TX_NOTIFICATION_TYPES } from 'src/logic/safe/transactions'
import { processTransaction } from 'src/logic/safe/store/actions/processTransaction'
import { EstimationStatus, useEstimateTransactionGas } from 'src/logic/hooks/useEstimateTransactionGas'
import { useEstimationStatus } from 'src/logic/hooks/useEstimationStatus'
import { TxParameters } from 'src/routes/safe/container/hooks/useTransactionParameters'
import { TxParametersDetail } from 'src/routes/safe/components/Transactions/helpers/TxParametersDetail'
import { EditableTxParameters } from 'src/routes/safe/components/Transactions/helpers/EditableTxParameters'
import { EMPTY_DATA } from 'src/logic/wallets/ethTransactions'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import { isThresholdReached } from 'src/routes/safe/components/Transactions/TxList/hooks/useTransactionActions'
import { ModalHeader } from 'src/routes/safe/components/Balances/SendModal/screens/ModalHeader'
import { Overwrite } from 'src/types/helpers'
import { ZERO_ADDRESS } from 'src/logic/wallets/ethAddresses'
import { makeConfirmation } from 'src/logic/safe/store/models/confirmation'
import { enhanceSnackbarForAction, NOTIFICATIONS } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import { ExpandedTxDetails, isMultiSigExecutionDetails, Transaction } from 'src/logic/safe/store/models/types/gateway.d'
import {
  extractSafeAddress,
  SAFE_ROUTES,
  history,
  generateSafeRoute,
  SAFE_ADDRESS_SLUG,
  getPrefixedSafeAddressSlug,
  extractShortChainName,
  TRANSACTION_ID_NUMBER,
} from 'src/routes/routes'
import ExecuteCheckbox from 'src/components/ExecuteCheckbox'
import { calculateFee, coins, GasPrice, MsgSendEncodeObject, SignerData, SigningStargateClient } from '@cosmjs/stargate'
import { getChainInfo, getInternalChainId, getShortName } from 'src/config'
import { getChains } from 'src/config/cache/chains'
import { confirmSafeTransaction, getAccountOnChain, getMChainsConfig, sendSafeTransaction } from 'src/services'
import fetchTransactions from 'src/logic/safe/store/actions/transactions/fetchTransactions'
import { fetchSafe } from 'src/logic/safe/store/actions/fetchSafe'
import { generatePath } from 'react-router-dom'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'

export const APPROVE_TX_MODAL_SUBMIT_BTN_TEST_ID = 'approve-tx-modal-submit-btn'
export const REJECT_TX_MODAL_SUBMIT_BTN_TEST_ID = 'reject-tx-modal-submit-btn'

const getModalTitleAndDescription = (
  thresholdReached: boolean,
  isCancelTx: boolean,
): { title: string; description: string } => {
  const modalInfo = {
    title: 'Execute transaction rejection',
    description: 'This action will execute this transaction.',
  }

  if (isCancelTx) {
    return modalInfo
  }

  if (thresholdReached) {
    modalInfo.title = 'Execute transaction'
    modalInfo.description = 'This action will execute this transaction.'
  } else {
    modalInfo.title = 'Approve Transaction'
    modalInfo.description =
      'This action will approve this transaction. A separate Transaction will be performed to submit the approval.'
  }

  return modalInfo
}

const useTxInfo = (transaction: Props['transaction']) => {
  const t = useRef(transaction)
  const safeAddress = extractSafeAddress()

  const confirmations = useMemo(
    () =>
      t.current.txDetails.detailedExecutionInfo && isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? List(
            t.current.txDetails.detailedExecutionInfo.confirmations.map(({ signer, signature }) =>
              makeConfirmation({ owner: signer.value, signature }),
            ),
          )
        : List([]),
    [],
  )

  const data = useMemo(() => t.current.txDetails.txData?.hexData ?? EMPTY_DATA, [])

  const baseGas = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.baseGas
        : '0',
    [],
  )

  const gasPrice = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.gasPrice?.toString()
        : '0',
    [],
  )

  const safeTxGas = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.safeTxGas
        : '0',
    [],
  )

  const gasToken = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.gasToken
        : ZERO_ADDRESS,
    [],
  )

  const nonce = useMemo(() => (t.current.executionInfo as MultisigExecutionInfo)?.nonce ?? 0, [])

  const refundReceiver = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.refundReceiver.value
        : ZERO_ADDRESS,
    [],
  )

  const safeTxHash = useMemo(
    () =>
      isMultiSigExecutionDetails(t.current.txDetails.detailedExecutionInfo)
        ? t.current.txDetails.detailedExecutionInfo.safeTxHash
        : EMPTY_DATA,
    [],
  )

  const value = useMemo(() => {
    switch (t.current.txInfo.type) {
      case 'Transfer':
        if (t.current.txInfo.transferInfo.type === TokenType.NATIVE_COIN) {
          return t.current.txInfo.transferInfo.value
        } else {
          return t.current.txDetails.txData?.value ?? '0'
        }
      case 'Custom':
        return t.current.txInfo.value
      case 'Creation':
      case 'SettingsChange':
      default:
        return '0'
    }
  }, [])

  const to = useMemo(() => {
    switch (t.current.txInfo.type) {
      case 'Transfer':
        if (t.current.txInfo.transferInfo.type === TokenType.NATIVE_COIN) {
          return t.current.txInfo.recipient.value
        } else {
          return (t.current.txInfo.transferInfo as Erc20Transfer | Erc721Transfer).tokenAddress
        }
      case 'Custom':
        return t.current.txInfo.to.value
      case 'Creation':
      case 'SettingsChange':
      default:
        return safeAddress
    }
  }, [safeAddress])

  const operation = useMemo(() => t.current.txDetails.txData?.operation ?? Operation.CALL, [])

  const origin = useMemo(
    () =>
      t.current.safeAppInfo ? JSON.stringify({ name: t.current.safeAppInfo.name, url: t.current.safeAppInfo.url }) : '',
    [],
  )

  const id = useMemo(() => t.current.id, [])

  return {
    confirmations,
    data,
    baseGas,
    gasPrice,
    safeTxGas,
    gasToken,
    nonce,
    refundReceiver,
    safeTxHash,
    value,
    to,
    operation,
    origin,
    id,
  }
}

type Props = {
  onClose: () => void
  canExecute?: boolean
  isCancelTx?: boolean
  isOpen: boolean
  transaction: Overwrite<Transaction, { txDetails: ExpandedTxDetails }>
  txParameters: TxParameters
}

export const ApproveTxModal = ({
  onClose,
  canExecute = false,
  isCancelTx = false,
  isOpen,
  transaction,
}: Props): React.ReactElement => {
  const dispatch = useDispatch()
  const userAddress = useSelector(userAccountSelector)
  const classes = useStyles()
  const safeAddress = extractSafeAddress()
  const [approveAndExecute, setApproveAndExecute] = useState(canExecute)
  const executionInfo = transaction.executionInfo as MultisigExecutionInfo
  const thresholdReached = !!(
    transaction.executionInfo &&
    isThresholdReached(
      Number((transaction?.txDetails?.detailedExecutionInfo as MultisigExecutionDetails)?.confirmationsRequired),
      (transaction?.txDetails?.detailedExecutionInfo as MultisigExecutionDetails)?.confirmations.length,
    )
  )
  const _threshold = executionInfo?.confirmationsRequired ?? 0
  // const _countingCurrentConfirmation = (executionInfo?.confirmationsSubmitted ?? 0) + 1
  const _countingCurrentConfirmation =
    ((transaction?.txDetails?.detailedExecutionInfo as MultisigExecutionDetails)?.confirmations.length ?? 0) + 1
  const { description, title } = getModalTitleAndDescription(thresholdReached, isCancelTx)
  const oneConfirmationLeft = !thresholdReached && _countingCurrentConfirmation === _threshold
  const isTheTxReadyToBeExecuted = oneConfirmationLeft ? true : thresholdReached
  const [manualGasPrice, setManualGasPrice] = useState<string | undefined>()
  const [manualGasLimit, setManualGasLimit] = useState<string | undefined>()
  const [isDisabled, setDisabled] = useState(false)
  const userWalletAddress = useSelector(userAccountSelector)
  const {
    confirmations,
    data,
    baseGas,
    gasPrice,
    safeTxGas,
    gasToken,
    nonce,
    refundReceiver,
    safeTxHash,
    value,
    to,
    operation,
    origin,
    id,
  } = useTxInfo(transaction)
  const {
    gasLimit,
    gasPriceFormatted,
    gasCostFormatted,
    txEstimationExecutionStatus,
    isExecution,
    isOffChainSignature,
    isCreation,
  } = useEstimateTransactionGas({
    txRecipient: to,
    txData: data,
    txConfirmations: confirmations,
    txAmount: value,
    preApprovingOwner: approveAndExecute ? userAddress : undefined,
    safeTxGas,
    operation,
    manualGasPrice,
    manualGasLimit,
  })

  // const {
  //   gasCostFormatted,
  //   gasPriceFormatted,
  //   gasLimit,
  //   gasEstimation,
  //   txEstimationExecutionStatus,
  //   isExecution,
  //   isCreation,
  //   isOffChainSignature,
  // } = {
  //   gasCostFormatted: '',
  //   gasPriceFormatted: '1',
  //   gasLimit: '80000',
  //   gasEstimation: '0',
  //   txEstimationExecutionStatus: EstimationStatus.SUCCESS,
  //   isExecution: true,
  //   isCreation: true,
  //   isOffChainSignature: true,
  // }

  const doExecute = isExecution && approveAndExecute
  const [buttonStatus] = useEstimationStatus(txEstimationExecutionStatus)

  const approveTx = async (txParameters: TxParameters) => {
    if (thresholdReached && confirmations.size < _threshold) {
      dispatch(enqueueSnackbar(NOTIFICATIONS.TX_FETCH_SIGNATURES_ERROR_MSG))
    } else {

      // call api to broadcast tx
      setDisabled(true)
      try {
        if (thresholdReached) {
          // case when Execute Click
          const chainInfo = getChainInfo()
          const chainId = chainInfo.chainId
          const data = {
            transactionId: transaction.id,
            internalChainId: getInternalChainId(),
            owner: userWalletAddress,
          }
          const {
            ErrorCode,
            Data,
          } = await sendSafeTransaction(data)
          if (ErrorCode === 'SUCCESSFUL') {
            dispatch(enqueueSnackbar(NOTIFICATIONS.TX_EXECUTED_MSG))
            const TxHash = Data['TxHash']
            if (TxHash) {
              const prefixedSafeAddress = getPrefixedSafeAddressSlug({ shortName: extractShortChainName(), safeAddress })

              const txRoute = generatePath(SAFE_ROUTES.TRANSACTIONS_SINGULAR, {
                [SAFE_ADDRESS_SLUG]: prefixedSafeAddress,
                [TRANSACTION_ID_NUMBER]: TxHash,
              })

              history.replace(txRoute)
            }
          } else {
            dispatch(enqueueSnackbar(NOTIFICATIONS.TX_FAILED_MSG))
          }
          dispatch(fetchTransactions(chainId, safeAddress))
        } else {
          // case when Confirm Click
          signTransactionWithKeplr(safeAddress)
        }
      } catch (error) {
        if (thresholdReached) {
          dispatch(enqueueSnackbar(NOTIFICATIONS.TX_FAILED_MSG))
        }

        dispatch(enqueueSnackbar(NOTIFICATIONS.TX_CONFIRMATION_FAILED_MSG))
      }
    }
    onClose()
  }

  const getParametersStatus = () => {
    if (canExecute || approveAndExecute) {
      return 'SAFE_DISABLED'
    }

    return 'DISABLED'
  }

  const closeEditModalCallback = (txParameters: TxParameters) => {
    const oldGasPrice = gasPriceFormatted
    const newGasPrice = txParameters.ethGasPrice

    if (newGasPrice && oldGasPrice !== newGasPrice) {
      setManualGasPrice(txParameters.ethGasPrice)
    }

    if (txParameters.ethGasLimit && gasLimit !== txParameters.ethGasLimit) {
      setManualGasLimit(txParameters.ethGasLimit)
    }
  }

  const signTransactionWithKeplr = async (safeAddress: string) => {
    const chainInfo = getChainInfo()
    const chainId = chainInfo.chainId
    const listChain = await getMChainsConfig()
    const denom = listChain.find((x) => x.chainId === chainId)?.denom || ''
    if (window.keplr) {
      await window.keplr.enable(chainId)
      window.keplr.defaultOptions = {
        sign: {
          preferNoSetMemo: true,
          preferNoSetFee: true,
          disableBalanceCheck: true,
        },
      }
    }

    if (window.getOfflineSignerOnlyAmino) {
      const offlineSigner = window.getOfflineSignerOnlyAmino(chainId)
      const accounts = await offlineSigner.getAccounts()
      // const tendermintUrl = chainInfo?.rpcUri?.value
      const client = await SigningStargateClient.offline(offlineSigner)

      const amountFinal = value

      const signingInstruction = await (async () => {
        // const accountOnChain = await client.getAccount(safeAddress)

        const {
          ErrorCode,
          Data: accountOnChainResult,
          Message,
        } = await getAccountOnChain(safeAddress, getInternalChainId())

        return {
          accountNumber: accountOnChainResult?.accountNumber,
          sequence: accountOnChainResult?.sequence,
          memo: '',
        }
      })()

      const msgSend: MsgSend = {
        fromAddress: safeAddress,
        toAddress: to,
        amount: coins(amountFinal, denom),
      }
      const msg: MsgSendEncodeObject = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: msgSend,
      }

      // calculate fee
      const gasPriceFee = GasPrice.fromString(String(manualGasPrice || gasPrice).concat(denom))
      // const sendFee = calculateFee(Number(manualGasLimit) || Number(baseGas), gasPriceFee)
      const sendFee = {
        amount: coins(manualGasPrice || gasPriceFormatted, denom),
        gas: manualGasLimit || gasLimit,
      }
      
      const signerData: SignerData = {
        accountNumber: signingInstruction.accountNumber || 0,
        sequence: signingInstruction.sequence || 0,
        chainId: chainId,
      }

      try {
        // Sign On Wallet
        dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.SIGN_TX_MSG)))

        const signResult = await client.sign(accounts[0]?.address, [msg], sendFee, '', signerData)

        const signatures = toBase64(signResult.signatures[0])
        const bodyBytes = toBase64(signResult.bodyBytes)

        // call api to confirm transaction
        const data = {
          fromAddress: userWalletAddress,
          transactionId: transaction?.id,
          internalChainId: getInternalChainId(),
          bodyBytes: bodyBytes,
          signature: signatures,
        }

        const { ErrorCode } = await confirmSafeTransaction(data)
        if (ErrorCode === 'SUCCESSFUL') {
          history.push(
            generateSafeRoute(SAFE_ROUTES.TRANSACTIONS_QUEUE, {
              shortName: getShortName(),
              safeAddress,
            }),
          )

          dispatch(fetchTransactions(chainId, safeAddress, true))
          // window.location.reload()
        } else {
          dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.TX_FAILED_MSG)))
        }
      } catch (error) {
        console.log(error)
        dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.TX_REJECTED_MSG)))
      }
    }
  }

  return (
    <Modal description={description} handleClose={onClose} open={isOpen} title={title}>
      <EditableTxParameters
        isOffChainSignature={isOffChainSignature}
        isExecution={doExecute}
        parametersStatus={getParametersStatus()}
        ethGasLimit={baseGas}
        ethGasPrice={gasPrice}
        safeNonce={nonce.toString()}
        safeTxGas={safeTxGas}
        closeEditModalCallback={closeEditModalCallback}
      >
        {(txParameters, toggleEditMode) => {
          return (
            <>
              <ModalHeader onClose={onClose} title={title} />

              <Hairline />

              {/* Tx info */}
              <Block className={classes.container}>
                <Row style={{ flexDirection: 'column' }}>
                  <Paragraph>{description}</Paragraph>
                  {/* <Paragraph color="medium" size="sm">
                    Transaction nonce:
                    <br />
                    <Bold className={classes.nonceNumber}>{nonce}</Bold>
                  </Paragraph> */}

                  {oneConfirmationLeft && canExecute && !isCancelTx && (
                    <ExecuteCheckbox onChange={setApproveAndExecute} />
                  )}

                  {/* Tx Parameters */}
                  {(approveAndExecute || !isOffChainSignature) && (
                    <TxParametersDetail
                      txParameters={txParameters}
                      onEdit={toggleEditMode}
                      parametersStatus={getParametersStatus()}
                      isTransactionCreation={isCreation}
                      isTransactionExecution={doExecute}
                      isOffChainSignature={isOffChainSignature}
                    />
                  )}
                </Row>
              </Block>

              {txEstimationExecutionStatus === EstimationStatus.LOADING ? null : (
                <ReviewInfoText
                  gasCostFormatted={gasCostFormatted}
                  isCreation={isCreation}
                  isExecution={doExecute}
                  isOffChainSignature={isOffChainSignature}
                  safeNonce={txParameters.safeNonce}
                  txEstimationExecutionStatus={txEstimationExecutionStatus}
                />
              )}

              {/* Footer */}
              <GenericModal.Footer withoutBorder={buttonStatus !== ButtonStatus.LOADING}>
                <GenericModal.Footer.Buttons
                  cancelButtonProps={{ onClick: onClose, text: 'Close' }}
                  confirmButtonProps={{
                    onClick: () => approveTx(txParameters),
                    type: 'submit',
                    status: buttonStatus,
                    text: txEstimationExecutionStatus === EstimationStatus.LOADING ? 'Estimating' : undefined,
                    testId: isCancelTx ? REJECT_TX_MODAL_SUBMIT_BTN_TEST_ID : APPROVE_TX_MODAL_SUBMIT_BTN_TEST_ID,
                    disabled: isDisabled
                  }}
                />
              </GenericModal.Footer>
            </>
          )
        }}
      </EditableTxParameters>
    </Modal>
  )
}
