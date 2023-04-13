import { toBase64, toUtf8 } from '@cosmjs/encoding'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { generatePath } from 'react-router-dom'
import AddressInfo from 'src/components/AddressInfo'
import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'
import Divider from 'src/components/Divider'
import FeeAndSequence from 'src/components/FeeAndSequence'
import { Popup } from 'src/components/Popup'
import Footer from 'src/components/Popup/Footer'
import Header from 'src/components/Popup/Header'
import Amount from 'src/components/TxComponents/Amount'
import { getChainDefaultGasPrice, getChainInfo, getCoinDecimal, getInternalChainId } from 'src/config'
import { enhanceSnackbarForAction, ERROR, NOTIFICATIONS } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import { signCosWasmMessage, signMessage } from 'src/logic/providers/signing'
import calculateGasFee from 'src/logic/providers/utils/fee'
import fetchTransactions from 'src/logic/safe/store/actions/transactions/fetchTransactions'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import {
  extractSafeAddress,
  extractShortChainName,
  getPrefixedSafeAddressSlug,
  history,
  SAFE_ADDRESS_SLUG,
  SAFE_ROUTES,
} from 'src/routes/routes'
import { createSafeTransaction } from 'src/services'
import { MESSAGES_CODE } from 'src/services/constant/message'
import { ICreateSafeTransaction } from 'src/types/transaction'
import { calcFee, formatNativeCurrency } from 'src/utils'
import styled from 'styled-components'
import { Wrap } from './styles'
import { Accordion, AccordionSummary, AccordionDetails } from '@aura/safe-react-components'

export default function ReviewPopup({ open, setOpen, gasUsed, msg }) {
  const safeAddress = extractSafeAddress()
  const dispatch = useDispatch()
  const { ethBalance: balance } = useSelector(currentSafeWithNames)
  const chainDefaultGasPrice = getChainDefaultGasPrice()
  const decimal = getCoinDecimal()
  const defaultGas = '250000'
  const gasFee =
    defaultGas && chainDefaultGasPrice
      ? calculateGasFee(+defaultGas, +chainDefaultGasPrice, decimal)
      : chainDefaultGasPrice

  const [manualGasLimit, setManualGasLimit] = useState<string | undefined>(defaultGas)
  const [gasPriceFormatted, setGasPriceFormatted] = useState(gasFee)
  const [openGasInput, setOpenGasInput] = useState<boolean>(false)
  const [sequence, setSequence] = useState('0')
  const [isDisabled, setDisabled] = useState(false)
  const userWalletAddress = useSelector(userAccountSelector)
  const chainInfo = getChainInfo()

  useEffect(() => {
    setManualGasLimit(gasUsed)
    const gasFee = calculateGasFee(+gasUsed, +chainDefaultGasPrice, decimal)
    setGasPriceFormatted(gasFee)
  }, [gasUsed])

  const signTransaction = async () => {
    setDisabled(true)
    const chainId = chainInfo.chainId
    const _sendFee = calcFee(manualGasLimit)
    const Msg = msg.map((message: any) => {
      if (
        [
          '/cosmwasm.wasm.v1.MsgInstantiateContract',
          '/cosmwasm.wasm.v1.MsgExecuteContract',
          '/cosmwasm.wasm.v1.MsgMigrateContract',
        ].includes(message.typeUrl as never)
      ) {
        return {
          ...message,
          value: {
            ...message.value,
            msg: toUtf8(JSON.stringify(message.value.msg)),
          },
        }
      }

      return message
    })
    try {
      dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.SIGN_TX_MSG)))
      const signResult = await signMessage(chainId, safeAddress, MsgTypeUrl.ExecuteContract, Msg, _sendFee, sequence)
      if (!signResult) throw new Error()
      const signatures = toBase64(signResult.signatures[0])
      const bodyBytes = toBase64(signResult.bodyBytes)
      const authInfoBytes = toBase64(signResult.authInfoBytes)
      const data: ICreateSafeTransaction = {
        internalChainId: getInternalChainId(),
        creatorAddress: userWalletAddress,
        signature: signatures,
        bodyBytes: bodyBytes,
        authInfoBytes: authInfoBytes,
        from: safeAddress,
        accountNumber: signResult.accountNumber,
        sequence: signResult.sequence,
      }
      createTxFromApi(data)
    } catch (error) {
      setDisabled(false)
      console.error(error)
      dispatch(
        enqueueSnackbar(
          enhanceSnackbarForAction({
            message: error.message || 'Transaction request failed',
            options: { variant: ERROR, persist: false, autoHideDuration: 5000, preventDuplicate: true },
          }),
        ),
      )
      setOpen(false)
    }
  }

  const createTxFromApi = async (data: any) => {
    try {
      const result = await createSafeTransaction(data)
      const { ErrorCode } = result
      if (ErrorCode === MESSAGES_CODE.SUCCESSFUL.ErrorCode) {
        const chainId = chainInfo.chainId
        dispatch(fetchTransactions(chainId, safeAddress))
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
                  result?.Message
                    ? {
                        message: result?.Message,
                        options: { variant: 'error', persist: false, autoHideDuration: 5000, preventDuplicate: true },
                      }
                    : NOTIFICATIONS.TX_FAILED_MSG,
                ),
              ),
            )
            break
        }
      }
      setOpen(false)
      setDisabled(false)
    } catch (error) {
      console.error(error)
      setDisabled(false)
      setOpen(false)
      dispatch(
        enqueueSnackbar(
          enhanceSnackbarForAction({
            message: error.message,
            options: { variant: ERROR, persist: false, preventDuplicate: true, autoHideDuration: 5000 },
          }),
        ),
      )
    }
  }

  return (
    <Popup title="" open={open} handleClose={() => setOpen(false)}>
      <Header onClose={() => setOpen(false)} title={'Contract Interaction'} />
      <Wrap>
        <AddressInfo address={safeAddress} />
        <div className="balance">
          Balance: <strong>{formatNativeCurrency(balance)}</strong>
        </div>
        <Divider />
        <div className="msgs">
          {msg.map((message, index) => {
            return <Message key={index} index={index} msgData={message} />
          })}
        </div>
        <Divider />
        <FeeAndSequence
          open={openGasInput}
          setOpen={setOpenGasInput}
          manualGasLimit={manualGasLimit}
          setManualGasLimit={setManualGasLimit}
          gasPriceFormatted={gasPriceFormatted}
          setGasPriceFormatted={setGasPriceFormatted}
          sequence={sequence}
          setSequence={setSequence}
        />
        <Divider />
        <Amount amount={formatNativeCurrency(+gasPriceFormatted)} label="Total Allocation Amount" />
        <div className="notice">
          You’re about to create a transaction and will have to confirm it with your currently connected wallet.
        </div>
      </Wrap>
      <Footer>
        <OutlinedNeutralButton onClick={() => setOpen(false)} disabled={isDisabled}>
          Close
        </OutlinedNeutralButton>
        <FilledButton onClick={signTransaction} disabled={isDisabled}>
          Submit
        </FilledButton>
      </Footer>
    </Popup>
  )
}

export const NoPaddingAccordion = styled(Accordion)`
  margin-bottom: 8px !important;
  border-radius: 8px !important;
  &.MuiAccordion-root {
    border: none !important;
    .MuiAccordionDetails-root {
      padding: 0;
    }
  }
`

export const StyledAccordionSummary = styled(AccordionSummary)`
  background-color: #363843 !important;
  border: none !important;
  min-height: 24px !important;
  font-size: 12px;
  &.Mui-expanded {
    background-color: #363843 !important;
  }
  .tx-nonce {
    margin: 0 16px 0 8px;
    min-width: 80px;
  }
  > div {
    padding: 0px !important;
    margin: 0px !important;
  }
`
export const StyledAccordionDetails = styled(AccordionDetails)`
  padding: 8px !important;
  background: #34353a !important;
  font-size: 12px !important;
`

export const Message = ({ msgData, index }) => {
  const Wrap = styled.div`
    white-space: pre-wrap;
    .string {
      color: #ce9178;
    }
    .number {
      color: #aac19e;
    }
    .boolean {
      color: #266781;
    }
    .null {
      color: #d33a3a;
    }
    .key {
      color: #569cd6;
    }
  `
  const beutifyJson = () => {
    const prettyJson = JSON.stringify(msgData?.value, undefined, 4)
    const json = prettyJson.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const formattedJson = json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        var cls = 'number'
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key'
          } else {
            cls = 'string'
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean'
        } else if (/null/.test(match)) {
          cls = 'null'
        }
        return '<span class="' + cls + '">' + match + '</span>'
      },
    )
    return formattedJson
  }
  return (
    <NoPaddingAccordion>
      <StyledAccordionSummary>
        {index + 1}. {msgData?.typeUrl.split('Msg').at(-1)}
      </StyledAccordionSummary>
      <StyledAccordionDetails>
        <Wrap dangerouslySetInnerHTML={{ __html: beutifyJson() }} />
      </StyledAccordionDetails>
    </NoPaddingAccordion>
  )
}
