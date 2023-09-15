import { makeStyles } from '@material-ui/core/styles'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Divider from 'src/components/Divider'
import Block from 'src/components/layout/Block'
import Col from 'src/components/layout/Col'
import Hairline from 'src/components/layout/Hairline'
import Img from 'src/components/layout/Img'
import Paragraph from 'src/components/layout/Paragraph'
import Row from 'src/components/layout/Row'
import { Modal } from 'src/components/Modal'
import { ButtonStatus } from 'src/components/Modal/type'
import PrefixedEthHashInfo from 'src/components/PrefixedEthHashInfo'
import { ReviewInfoText } from 'src/components/ReviewInfoText'
import {
  getChainDefaultGas,
  getChainDefaultGasPrice,
  getChainInfo,
  getCoinDecimal,
  getCoinMinimalDenom,
  getExplorerInfo,
  getInternalChainId,
} from 'src/config'
import { EstimationStatus } from 'src/logic/hooks/useEstimateTransactionGas'
import { useEstimationStatus } from 'src/logic/hooks/useEstimationStatus'
import { SpendingLimit } from 'src/logic/safe/store/models/safe'
import { sameAddress } from 'src/logic/wallets/ethAddresses'
import SafeInfo from 'src/routes/safe/components/Balances/SendModal/SafeInfo'
import { setImageToPlaceholder } from 'src/routes/safe/components/Balances/utils'
import { extendedSafeTokensSelector } from 'src/utils/safeUtils/selector'
import { sameString } from 'src/utils/strings'

import { toBase64 } from '@cosmjs/encoding'
import { calculateFee, coins, GasPrice, MsgSendEncodeObject, SignerData, SigningStargateClient } from '@cosmjs/stargate'
import { generatePath } from 'react-router-dom'
import ButtonLink from 'src/components/layout/ButtonLink'
import { enhanceSnackbarForAction, ERROR, NOTIFICATIONS } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import fetchTransactions from 'src/logic/safe/store/actions/transactions/fetchTransactions'
import { currentSafeOwners } from 'src/logic/safe/store/selectors'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import {
  extractSafeAddress,
  extractShortChainName,
  getPrefixedSafeAddressSlug,
  history,
  SAFE_ADDRESS_SLUG,
  SAFE_ROUTES,
} from 'src/routes/routes'
import { TxParameters } from 'src/routes/safe/container/hooks/useTransactionParameters'
import { createSafeTransaction } from 'src/services'
import { DEFAULT_GAS_LIMIT } from 'src/services/constant/common'
import { MESSAGES_CODE } from 'src/services/constant/message'
import { ICreateSafeTransaction } from 'src/types/transaction'
import { EditableTxParameters } from 'src/utils/transactionHelpers/EditableTxParameters'
import { ModalHeader } from '../ModalHeader'
import { styles } from './style'

const useStyles = makeStyles(styles)

export type ReviewTxProp = {
  recipientAddress: string
  recipientName?: string
  amount: string
  txRecipient: string
  token: string
  txType?: string
  tokenSpendingLimit?: SpendingLimit
}

type ReviewTxProps = {
  onClose: () => void
  onPrev: () => void
  tx: ReviewTxProp
}

const ReviewSendFundsTx = ({ onClose, onPrev, tx }: ReviewTxProps): React.ReactElement => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const safeAddress = extractSafeAddress()

  const tokens: any = useSelector(extendedSafeTokensSelector)
  const owners = useSelector(currentSafeOwners)
  const userWalletAddress = useSelector(userAccountSelector)

  const txToken = useMemo(() => tokens.find((token) => sameAddress(token.address, tx.token)), [tokens, tx.token])
  // const txRecipient = isSendingNativeToken ? tx.recipientAddress : txToken?.address || ''
  const txRecipient = tx.recipientAddress || ''

  const chainDefaultGas = getChainDefaultGas()
  const denom = getCoinMinimalDenom()

  const chainDefaultGasPrice = getChainDefaultGasPrice()
  const decimal = getCoinDecimal()
  const msgSendGas = chainDefaultGas?.find((chain) => chain.typeUrl === '/cosmos.bank.v1beta1.MsgSend')

  const { multiplier, gasAmount } = msgSendGas || { multiplier: 0, gasAmount: 0 }

  const defaultGas = (Number(gasAmount) * (1 + Number(multiplier) * (owners.length - 1))).toFixed(0)

  const gasFee = getGasFee(defaultGas, chainDefaultGasPrice, decimal)

  const [manualGasLimit, setManualGasLimit] = useState<string | undefined>(defaultGas)
  const [isDisabled, setDisabled] = useState(false)
  const [gasPriceFormatted, setGasPriceFormatted] = useState<string | number>(gasFee)
  const chainInfo = getChainInfo()

  // let lastUsedProvider = ''

  // loadLastUsedProvider().then((result) => {
  //   lastUsedProvider = result || ''
  //   if (result?.toLowerCase() !== 'keplr') setGasPriceFormatted(15000)
  // })

  const { gasCostFormatted, txEstimationExecutionStatus, isExecution, isOffChainSignature } = {
    gasCostFormatted: '',
    txEstimationExecutionStatus: EstimationStatus.SUCCESS,
    isExecution: false,
    isOffChainSignature: true,
  }

  const [buttonStatus, setButtonStatus] = useEstimationStatus()

  const isSpendingLimit = sameString(tx.txType, 'spendingLimit')
  // const [executionApproved, setExecutionApproved] = useState<boolean>(true)
  const doExecute = isExecution // && executionApproved
  const [openGas, setOpenGas] = useState<boolean>(false)

  const submitTx = async (txParameters: TxParameters) => {
    setDisabled(true)
    signTransactionWithKeplr(safeAddress)
  }

  const signTransactionWithKeplr = async (safeAddress: string) => {
    const chainId = chainInfo.chainId

    // const listChain = await getMChainsConfig()
    // const chainInfo = listChain.find((x) => x.chainId === chainId)

    // const denom = chainInfo?.denom || ''
    // const denom = listChain.find((x) => x.chainId === chainId)?.denom || ''
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

      const client = await SigningStargateClient.offline(offlineSigner)
      const onlineClient = await SigningStargateClient.connectWithSigner(chainInfo.rpcUri.value, offlineSigner)
      const onlineData = await onlineClient.getSequence(safeAddress)
      const amountFinal =
        chainInfo.shortName === 'evmos'
          ? Math.floor(Number(tx?.amount) * Math.pow(10, 18)).toString() || ''
          : Math.floor(Number(tx?.amount) * Math.pow(10, 6)).toString() || ''

      const msgSend: any = {
        fromAddress: safeAddress,
        toAddress: txRecipient,
        amount: coins(amountFinal, denom),
      }

      const msg: MsgSendEncodeObject = {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: msgSend,
      }

      const gasPrice = GasPrice.fromString(String(chainDefaultGasPrice || gasPriceFormatted).concat(denom))

      const sendFee = calculateFee(Number(manualGasLimit || defaultGas || DEFAULT_GAS_LIMIT), gasPrice)

      const signerData: SignerData = {
        accountNumber: onlineData.accountNumber,
        sequence: onlineData?.sequence,
        chainId: chainId,
      }

      try {
        // Sign On Wallet
        dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.SIGN_TX_MSG)))

        // if (!gasPrice || !gasEstimation) {
        //   return
        // }

        const signResult = await client.sign(accounts[0]?.address, [msg], sendFee, '', signerData)

        console.log(signResult)

        const signatures = toBase64(signResult.signatures[0])
        const bodyBytes = toBase64(signResult.bodyBytes)
        const authInfoBytes = toBase64(signResult.authInfoBytes)

        // call api to create transaction
        const data: ICreateSafeTransaction = {
          from: safeAddress,
          to: txRecipient,
          amount: amountFinal,
          internalChainId: getInternalChainId(),
          creatorAddress: userWalletAddress,
          signature: signatures,
          bodyBytes: bodyBytes,
          authInfoBytes: authInfoBytes,
          accountNumber: onlineData.accountNumber,
          sequence: onlineData?.sequence,
        }

        createTxFromApi(data)
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
        onClose()
      }
    }
  }

  const createTxFromApi = async (data: any) => {
    createSafeTransaction(data)
      .then((e) => {
        const { ErrorCode } = e
        if (ErrorCode === MESSAGES_CODE.SUCCESSFUL.ErrorCode) {
          setButtonStatus(ButtonStatus.READY)

          const chainId = chainInfo.chainId
          dispatch(fetchTransactions(chainId, safeAddress))

          // navigate to tx details
          const prefixedSafeAddress = getPrefixedSafeAddressSlug({ shortName: extractShortChainName(), safeAddress })
          const txRoute = generatePath(SAFE_ROUTES.TRANSACTIONS_QUEUE, {
            [SAFE_ADDRESS_SLUG]: prefixedSafeAddress,
          })
          history.push(txRoute)
        } else {
          switch (ErrorCode) {
            case MESSAGES_CODE.E029.ErrorCode:
              dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.CREATE_SAFE_PENDING_EXECUTE_MSG)))
              break
            default:
              dispatch(
                enqueueSnackbar(
                  enhanceSnackbarForAction(
                    e?.Message
                      ? {
                          message: e?.Message,
                          options: { variant: 'error', persist: false, autoHideDuration: 5000, preventDuplicate: true },
                        }
                      : NOTIFICATIONS.TX_FAILED_MSG,
                  ),
                ),
              )
              break
          }
        }

        onClose()
      })
      .catch((err) => {
        onClose()
        dispatch(
          enqueueSnackbar(
            enhanceSnackbarForAction({
              message: err.message,
              options: { variant: ERROR, persist: false, preventDuplicate: true, autoHideDuration: 5000 },
            }),
          ),
        )
      })
  }

  const closeEditModalCallback = (_) => {}

  const ShowGasFrom = () => {
    setOpenGas(!openGas)
  }

  const recalculateFee = () => {
    const gasFee = getGasFee(manualGasLimit, chainDefaultGasPrice, decimal)

    if (gasFee) {
      setGasPriceFormatted(gasFee)
    }
    setOpenGas(!openGas)
  }

  const handleManualSafeTxGasChange = (e) => {
    // setManualSafeTxGas(e.target.value)
    setManualGasLimit(e.target.value)
  }

  return (
    <EditableTxParameters
      isOffChainSignature={isOffChainSignature}
      isExecution={doExecute}
      ethGasLimit={defaultGas || '100000'}
      ethGasPrice={chainDefaultGasPrice.toString()}
      safeTxGas={defaultGas}
      closeEditModalCallback={closeEditModalCallback}
    >
      {(txParameters, _) => (
        <>
          {/* Header */}
          <ModalHeader onClose={onClose} subTitle="Step 2 of 2" title="Send funds" />

          <Hairline />

          <Block className={classes.container}>
            {/* SafeInfo */}
            <SafeInfo />
            <Divider withArrow />

            {/* Recipient */}
            <Row margin="xs">
              <Paragraph color="disabled" noMargin size="md" style={{ letterSpacing: '-0.5px' }}>
                Recipient
              </Paragraph>
            </Row>
            <Row align="center" margin="md" data-testid="recipient-review-step">
              <Col xs={12}>
                <PrefixedEthHashInfo
                  hash={tx.recipientAddress}
                  name={tx.recipientName}
                  showCopyBtn
                  showAvatar
                  explorerUrl={getExplorerInfo(tx.recipientAddress)}
                />
              </Col>
            </Row>

            <Row margin="xs">
              <Paragraph color="white" noMargin size="md" weight="regular" style={{ letterSpacing: '-0.5px' }}>
                Transaction fee
              </Paragraph>
            </Row>
            <Row align="center" margin="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex' }}>
                  <Img
                    alt={txToken?.name as string}
                    height={28}
                    onError={setImageToPlaceholder}
                    src={txToken?.logoUri}
                  />
                  <Paragraph
                    className={classes.amount}
                    noMargin
                    size="md"
                    data-testid={`amount-${txToken?.symbol as string}-review-step`}
                  >
                    {gasPriceFormatted} {txToken?.symbol}
                    {/* {manualGasLimit || defaultGas} */}
                  </Paragraph>
                </div>
                <div style={{ alignSelf: 'center' }}>
                  <ButtonLink onClick={ShowGasFrom} weight="regular" color="green" testId="send-max-btn">
                    Edit gas
                  </ButtonLink>
                </div>
              </div>
            </Row>
            {openGas && (
              <Row margin="md" xs={12}>
                <Col xs={9}>
                  <div className={classes.gasInput}>
                    <div className={classes.titleGasInput}>Gas Amount</div>
                    <input value={manualGasLimit} onChange={handleManualSafeTxGasChange} className={classes.inputGas} />
                  </div>
                </Col>
                <Col center="xs" middle="xs" xs={3}>
                  <div className={classes.gasButton} onClick={recalculateFee}>
                    Apply
                  </div>
                </Col>
              </Row>
            )}
            {/* <Row margin="xs">
              <Paragraph color="white" noMargin size="md" weight="regular" style={{ letterSpacing: '-0.5px' }}>
                Total Allocation Amount
              </Paragraph>
            </Row>

            <Row align="center" margin="md">
              <Img alt={txToken?.name as string} height={28} onError={setImageToPlaceholder} src={txToken?.logoUri} />
              <Paragraph
                className={classes.amount}
                noMargin
                size="md"
                data-testid={`amount-${txToken?.symbol as string}-review-step`}
              >
                {tx.amount} {txToken?.symbol}
              </Paragraph>
            </Row> */}
          </Block>

          {/* Disclaimer */}
          {/* FIXME Estimation should be fixed to be used with spending limits */}
          {!isSpendingLimit && txEstimationExecutionStatus !== EstimationStatus.LOADING && (
            <ReviewInfoText
              gasCostFormatted={gasCostFormatted}
              isCreation={true}
              isExecution={true}
              isOffChainSignature={true}
              safeNonce={txParameters.safeNonce}
              txEstimationExecutionStatus={txEstimationExecutionStatus}
            />
          )}

          {/* Footer */}
          <Modal.Footer
            withoutBorder={!isSpendingLimit && buttonStatus !== ButtonStatus.LOADING}
            justifyContent="flex-end"
          >
            <Modal.Footer.Buttons
              cancelButtonProps={{ onClick: onPrev, text: 'Back' }}
              confirmButtonProps={{
                onClick: () => submitTx(txParameters),
                status: buttonStatus,
                text: txEstimationExecutionStatus === EstimationStatus.LOADING ? 'Estimating' : undefined,
                testId: 'submit-tx-btn',
                disabled: isDisabled,
              }}
            />
          </Modal.Footer>
        </>
      )}
    </EditableTxParameters>
  )
}

function calculateGasFee(gas: number, gasPrice: number, decimal: number): number {
  return (+gas * +gasPrice) / Math.pow(10, decimal)
}

function getGasFee(defaultGas, chainDefaultGasPrice, decimal) {
  return (
    Math.ceil(
      +(defaultGas && chainDefaultGasPrice
        ? calculateGasFee(+defaultGas, +chainDefaultGasPrice, decimal)
        : chainDefaultGasPrice) * Math.pow(10, decimal),
    ) / Math.pow(10, decimal)
  )
}

export default ReviewSendFundsTx
