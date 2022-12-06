import { ReactElement, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { getCoinMinimalDenom, getNativeCurrency } from 'src/config'
import { currentNetworkAddressBook } from 'src/logic/addressBook/store/selectors'
import { SpendingLimit } from 'src/logic/safe/store/models/safe'

import { extendedSafeTokensSelector } from 'src/routes/safe/container/selector'

import AddressInfo from 'src/components/AddressInfo'
import { LinkButton, OutlinedButton, TextButton } from 'src/components/Button'
import Divider from 'src/components/Divider'
import Gap from 'src/components/Gap'
import AddressInput from 'src/components/Input/Address'
import TextField from 'src/components/Input/TextField'
import TokenSelect from 'src/components/Input/Token'
import { AddressBookEntry } from 'src/logic/addressBook/model/addressBook'
import { currentChainId } from 'src/logic/config/store/selectors'
import { isValidAddress } from 'src/utils/isValidAddress'
import { Popup } from '..'
import Header from '../Header'
import CreateTxPopup from './CreateTxPopup'
import CurrentSafe from './CurrentSafe'
import { BodyWrapper, Footer, PopupWrapper } from './styles'
import { simulate } from 'src/services'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import { coin, coins } from '@cosmjs/stargate'
import { formatBigNumber } from 'src/utils'
import { extractPrefixedSafeAddress, extractSafeAddress } from 'src/routes/routes'
import { Loader } from '@aura/safe-react-components'

export type SendFundsTx = {
  amount?: string
  recipientAddress?: string
  name?: string
  token?: string
  txType?: string
  tokenSpendingLimit?: SpendingLimit
}

type SendFundsProps = {
  open: boolean
  onClose: () => void
  onOpen: () => void
  defaultToken?: string
}

const SendingPopup = ({ open, onClose, onOpen, defaultToken }: SendFundsProps): ReactElement => {
  const tokens = useSelector(extendedSafeTokensSelector)
  const safeAddress = extractSafeAddress()
  const denom = getCoinMinimalDenom()
  const { safeId } = extractPrefixedSafeAddress()
  const [simulateLoading, setSimulateLoading] = useState(false)
  const [gasUsed, setGasUsed] = useState(0)
  const chainId = useSelector(currentChainId)
  const [createTxPopupOpen, setCreateTxPopupOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState<AddressBookEntry | undefined>(undefined)
  const [recipientFocus, setRecipientFocus] = useState(false)
  const [addressValidateMsg, setAddressValidateMsg] = useState('')
  const [amountValidateMsg, setAmountValidateMsg] = useState('')
  const [selectedToken, setSelectedToken] = useState(defaultToken || '')
  useEffect(() => {
    if (defaultToken) {
      setSelectedToken(defaultToken)
    }
  })

  const handleClose = (isBack = false) => {
    if (isBack) {
      onOpen()
      setCreateTxPopupOpen(false)
      return
    }
    setRecipient(undefined)
    setAmount('')
    setSelectedToken('')
    setAddressValidateMsg('')
    setAmountValidateMsg('')
    setCreateTxPopupOpen(false)
  }

  useEffect(() => {
    setAmountValidateMsg('')
    if (selectedToken) {
      const tokenbalance = tokens.find((t) => t.address == selectedToken)?.balance?.tokenBalance
      if (tokenbalance && amount > tokenbalance) {
        setAmountValidateMsg('Given amount is greater than available balance.')
      }
    }
  }, [amount, selectedToken])

  const setMaxAmount = () => {
    if (selectedToken) {
      const token = tokens.find((t) => t.address == selectedToken)
      setAmount(token?.balance?.tokenBalance || '')
    }
  }

  const createTx = async () => {
    if (+amount == 0 || amount == '') {
      setAmountValidateMsg('Invalid amount. Please try again.')
      return
    }
    setSimulateLoading(true)
    try {
      const res = await simulate({
        encodedMsgs: Buffer.from(
          JSON.stringify([
            {
              typeUrl: MsgTypeUrl.Send,
              value: {
                amount: coins(formatBigNumber(amount, true), denom),
                fromAddress: safeAddress,
                toAddress: recipient?.address,
              },
            },
          ]),
          'binary',
        ).toString('base64'),
        safeId,
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
          <Header
            onClose={() => {
              onClose()
              handleClose()
            }}
            subTitle="Step 1 of 2"
            title="Send funds"
          />
          <BodyWrapper>
            <CurrentSafe />
            <Divider withArrow />
            {recipient?.address && !recipientFocus ? (
              <div
                onClick={() => {
                  setRecipientFocus(true)
                }}
              >
                <p className="label">Recipient</p>
                <AddressInfo address={recipient.address} />
              </div>
            ) : (
              <>
                <AddressInput
                  autoFocus
                  value={recipient}
                  onFocus={() => setAddressValidateMsg('')}
                  onChange={(recipient) => {
                    if (!isValidAddress(recipient.address)) {
                      setAddressValidateMsg('Invalid address input! Please check and try again.')
                      setRecipientFocus(true)

                      setRecipient({ address: recipient.address, chainId, name: '' })
                    } else {
                      setRecipientFocus(false)
                      setRecipient(recipient)
                    }
                  }}
                  onClose={(address, _, reason) => {
                    if (!address) {
                      return
                    }
                    if (reason == 'blur') {
                      if (!isValidAddress(address)) {
                        setAddressValidateMsg('Invalid address input! Please check and try again.')
                        setRecipientFocus(true)

                        setRecipient({ address: address, chainId, name: '' })
                      } else {
                        setRecipientFocus(false)
                        setRecipient({ address: address, chainId, name: '' })
                      }
                    }
                  }}
                />
                {addressValidateMsg && <p className="error-msg">{addressValidateMsg}</p>}
              </>
            )}
            <Gap height={16} />
            <TokenSelect selectedToken={selectedToken} setSelectedToken={setSelectedToken} disabled={!!defaultToken} />
            <Gap height={16} />
            <div className="amount-section">
              <TextField type="number" label="Amount" value={amount} onChange={(value) => setAmount(value)} />
              <LinkButton onClick={setMaxAmount}>Send max</LinkButton>
            </div>
            {amountValidateMsg && <div className="error-msg">{amountValidateMsg}</div>}
          </BodyWrapper>
          <Footer>
            <TextButton
              size="md"
              onClick={() => {
                onClose()
                handleClose()
              }}
            >
              Cancel
            </TextButton>
            <OutlinedButton
              disabled={
                !selectedToken ||
                !amount ||
                !recipient ||
                !!addressValidateMsg ||
                !!amountValidateMsg ||
                simulateLoading
              }
              size="md"
              onClick={createTx}
            >
              {simulateLoading ? <Loader size="xs" /> : 'Review'}
            </OutlinedButton>
          </Footer>
        </PopupWrapper>
      </Popup>
      <CreateTxPopup
        recipient={recipient}
        selectedToken={tokens.find((t) => t.address == selectedToken)}
        amount={amount}
        open={createTxPopupOpen}
        handleClose={handleClose}
        gasUsed={String(Math.round(gasUsed * 1.3))}
      />
    </>
  )
}

export default SendingPopup