import { ReactElement, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { extendedSafeTokensSelector } from 'src/utils/safeUtils/selector'

import { AminoMsgMultiSend, coins } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'
import { OutlinedButton, OutlinedNeutralButton } from 'src/components/Button'
import Gap from 'src/components/Gap'
import TextArea from 'src/components/Input/TextArea'
import TokenSelect from 'src/components/Input/Token'
import DenseTable, { StyledTableCell, StyledTableRow } from 'src/components/Table/DenseTable'
import { getCoinMinimalDenom } from 'src/config'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import { extractPrefixedSafeAddress, extractSafeAddress } from 'src/routes/routes'
import { simulate } from 'src/services'
import { convertAmount, formatNativeCurrency, formatNumber } from 'src/utils'
import { isValidAddress } from 'src/utils/isValidAddress'
import { Popup } from '..'
import Header from '../Header'
import CreateTxPopup from './CreateTxPopup'
import { BodyWrapper, Footer, PopupWrapper } from './styles'
import Loader from 'src/components/Loader'
import { Token } from 'src/logic/tokens/store/model/token'

export type RecipientProps = {
  amount: string
  address: string
}

type SendFundsProps = {
  open: boolean
  onClose: () => void
  onOpen: () => void
}

const MultiSendPopup = ({ open, onClose, onOpen }: SendFundsProps): ReactElement => {
  const tokens = useSelector(extendedSafeTokensSelector)
  const [createTxPopupOpen, setCreateTxPopupOpen] = useState(false)
  const safeAddress = extractSafeAddress()
  const denom = getCoinMinimalDenom()
  const { safeId } = extractPrefixedSafeAddress()
  const [simulateLoading, setSimulateLoading] = useState(false)
  const [gasUsed, setGasUsed] = useState(0)
  const [recipient, setRecipient] = useState<RecipientProps[]>([])
  const [errorLine, setErrorLine] = useState<number[]>([])
  const [addressValidateErrorMsg, setAddressValidateErrorMsg] = useState('')
  const [addressValidateSuccessMsg, setAddressValidateSuccessMsg] = useState('')
  const [amountValidateMsg, setAmountValidateMsg] = useState('')
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(undefined)
  const [rawRecipient, setRawRecipient] = useState('')
  const [totalAmount, setTotalAmount] = useState('0')
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const bl = tokens.find((token) => token.address == selectedToken?.address)?.balance?.tokenBalance || 0
    setBalance(+bl)
  }, [selectedToken])

  const clearData = () => {
    setRecipient([])
    setErrorLine([])
    setAddressValidateErrorMsg('')
    setAddressValidateSuccessMsg('')
    setRawRecipient('')
    setAmountValidateMsg('')
    setCreateTxPopupOpen(false)
    setTotalAmount('0')
    setBalance(0)
  }
  const handleClose = (isBack = false) => {
    if (isBack) {
      onOpen()
      setCreateTxPopupOpen(false)
      return
    }
    onClose()
    setSelectedToken(undefined)
    clearData()
  }

  const validateRecipient = () => {
    if (!rawRecipient) {
      clearData()
      return
    }
    const newRecipient: RecipientProps[] = []
    const newErrorLine: number[] = []
    let newTotalAmount = new BigNumber(0)
    const rawRecipientLine = rawRecipient.split('\n')
    for (let i = 0; i < rawRecipientLine.length; i++) {
      const recipientLine = rawRecipientLine[i]
      const [addr, am] = recipientLine.split(',')
      const address = addr?.trim()
      const amount = am?.trim()
      // const alreadyAdd = newRecipient.find((r) => r.address == address)
      if (isValidAddress(address) && !isNaN(+amount) && amount != '' && +amount > 0) {
        newRecipient.push({ address: address, amount: formatNumber(amount) })
        newTotalAmount = newTotalAmount.plus(new BigNumber(amount))
      } else {
        newRecipient.push({ address: address || '', amount: formatNumber(amount) || '' })
        newErrorLine.push(i)
      }
    }
    if (newErrorLine.length > 0) {
      setAddressValidateErrorMsg(
        `Errors found on line ${newErrorLine.map((e) => e + 1).join(', ')}. Please check and try again.`,
      )
      setAddressValidateSuccessMsg('')
    } else {
      setAddressValidateErrorMsg('')
      setAddressValidateSuccessMsg('All recipients Validated successfully')
    }
    setErrorLine(newErrorLine)
    setRecipient(newRecipient)
    setTotalAmount(newTotalAmount.toString())
  }

  useEffect(() => {
    if (balance && totalAmount && +totalAmount > +balance) {
      setAmountValidateMsg('Total amount is greater than available balance. Please check and try agian.')
    } else {
      setAmountValidateMsg('')
    }
  }, [totalAmount])

  useEffect(() => {
    if (addressValidateSuccessMsg) {
      setAddressValidateSuccessMsg('')
    }
    if (addressValidateErrorMsg) {
      setAddressValidateErrorMsg('')
    }
  }, [rawRecipient])

  const createTx = async () => {
    setSimulateLoading(true)
    const Outputs: AminoMsgMultiSend['value']['outputs'] = recipient.map((r) => ({
      address: r.address,
      coins: coins(convertAmount(+r.amount, true), denom),
    }))
    const Msg: any = [
      {
        typeUrl: MsgTypeUrl.MultiSend,
        value: {
          inputs: [
            {
              address: safeAddress,
              coins: coins(convertAmount(totalAmount, true), denom),
            },
          ],
          outputs: Outputs,
        },
      },
    ]
    try {
      const res = await simulate({
        encodedMsgs: Buffer.from(JSON.stringify(Msg), 'binary').toString('base64'),
        safeId: safeId?.toString(),
      })
      if (res?.Data?.gasUsed) {
        setGasUsed(res?.Data?.gasUsed)
      }
    } catch (error) {
      setSimulateLoading(false)
      setGasUsed(0)
    }
    setSimulateLoading(false)
    onClose()
    setCreateTxPopupOpen(true)
  }
  return (
    <>
      <Popup open={open} title="Send Popup">
        <PopupWrapper>
          <Header onClose={() => handleClose()} subTitle="Step 1 of 2" title="Multi-send" />
          <BodyWrapper>
            <div className="token-selection">
              <TokenSelect selectedToken={selectedToken?.address} setSelectedToken={setSelectedToken} onlyNativeToken />
            </div>
            <Gap height={16} />
            <div className="label">Add recipients & amounts</div>
            <div className="recipient-input">
              <TextArea placeholder="Address, amount" value={rawRecipient} onChange={setRawRecipient} />
              <div>
                <OutlinedButton onClick={validateRecipient}>Validate</OutlinedButton>
                {addressValidateErrorMsg && <p className="error-msg">{addressValidateErrorMsg}</p>}
                {addressValidateSuccessMsg && <p className="success-msg">{addressValidateSuccessMsg}</p>}
              </div>
            </div>
            <Gap height={16} />
            {recipient.length ? (
              <>
                <div className="label">Recipients list</div>
                <DenseTable stickyHeader maxHeight="30vh" headers={['No.', 'Address', 'Amount']}>
                  {recipient.map((row, index) => {
                    return (
                      <StyledTableRow key={index} className={errorLine.includes(index) ? 'error' : ''}>
                        <StyledTableCell component="th" scope="row">
                          {index + 1}
                        </StyledTableCell>
                        <StyledTableCell align="left">{row.address}</StyledTableCell>
                        <StyledTableCell align="left">{row.amount}</StyledTableCell>
                      </StyledTableRow>
                    )
                  })}
                </DenseTable>
              </>
            ) : null}
            {totalAmount && balance ? (
              <>
                <div className="balance-amount">
                  <p>
                    Total: <span className="value">{formatNativeCurrency(totalAmount)}</span>
                  </p>
                  <p>
                    Balance: <span className="value">{formatNativeCurrency(balance)}</span>
                  </p>
                  {amountValidateMsg && <p className="error-msg">{amountValidateMsg}</p>}
                </div>
              </>
            ) : null}
          </BodyWrapper>
          <Footer>
            <OutlinedNeutralButton onClick={() => handleClose()}>Cancel</OutlinedNeutralButton>
            <OutlinedButton
              disabled={
                !selectedToken ||
                !recipient ||
                !!addressValidateErrorMsg ||
                !!amountValidateMsg ||
                !addressValidateSuccessMsg ||
                simulateLoading
              }
              onClick={createTx}
            >
              {simulateLoading ? <Loader content="Review" /> : 'Review'}
            </OutlinedButton>
          </Footer>
        </PopupWrapper>
      </Popup>
      <CreateTxPopup
        recipient={recipient}
        selectedToken={tokens.find((t) => t.address == selectedToken?.address)}
        open={createTxPopupOpen}
        handleClose={handleClose}
        gasUsed={String(Math.round(gasUsed * 2))}
      />
    </>
  )
}

export default MultiSendPopup
