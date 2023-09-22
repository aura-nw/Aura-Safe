import { Icon } from '@aura/safe-react-components'
import { coins } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AddressInfo from 'src/components/AddressInfo'
import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'
import Divider from 'src/components/Divider'
import FeeAndSequence from 'src/components/FeeAndSequence'
import Gap from 'src/components/Gap'
import Amount from 'src/components/TxComponents/Amount'
import { getChainDefaultGasPrice, getCoinDecimal, getCoinMinimalDenom } from 'src/config'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import calculateGasFee from 'src/logic/providers/utils/fee'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { Token } from 'src/logic/tokens/store/model/token'
import { extractSafeAddress } from 'src/routes/routes'
import { convertAmount, formatNativeCurrency, formatNumber } from 'src/utils'
import { signAndCreateTransaction } from 'src/utils/signer'
import { RecipientProps } from '.'
import { Popup } from '..'
import Header from '../Header'
import { Footer, Wrapper } from './styles'

export default function CreateTxPopup({
  open,
  handleClose,
  recipient,
  selectedToken,
  gasUsed,
}: {
  open: boolean
  handleClose: any
  recipient?: RecipientProps[]
  selectedToken?: Token
  gasUsed: string
}) {
  const safeAddress = extractSafeAddress()
  const { nativeBalance: balance, nextQueueSeq } = useSelector(currentSafeWithNames)
  const dispatch = useDispatch()
  const denom = getCoinMinimalDenom()
  const chainDefaultGasPrice = getChainDefaultGasPrice()
  const decimal = getCoinDecimal()
  const [isDisabled, setDisabled] = useState(false)
  const gasFee = chainDefaultGasPrice ? calculateGasFee(400000, +chainDefaultGasPrice, decimal) : chainDefaultGasPrice
  const [manualGasLimit, setManualGasLimit] = useState<string | undefined>('400000')
  const [gasPriceFormatted, setGasPriceFormatted] = useState(gasFee)
  const [openGasInput, setOpenGasInput] = useState<boolean>(false)
  const [totalAmount, setTotalAmount] = useState('0')
  const [sequence, setSequence] = useState(nextQueueSeq)

  useEffect(() => {
    if (gasUsed != '0') {
      setManualGasLimit(gasUsed)
    }
  }, [gasUsed])
  useEffect(() => {
    if (!recipient) return
    let newTotalAmount = new BigNumber(0)
    for (const recipientLine of recipient) {
      newTotalAmount = newTotalAmount.plus(+formatNumber(recipientLine.amount))
    }
    setTotalAmount(newTotalAmount.toString())
  }, [recipient])

  const signTransaction = async () => {
    const msgs: any = [
      {
        typeUrl: MsgTypeUrl.MultiSend,
        value: {
          inputs: [
            {
              address: safeAddress,
              coins: coins(convertAmount(totalAmount, true), denom),
            },
          ],
          outputs: recipient?.map((r) => ({
            address: r.address,
            coins: coins(convertAmount(+r.amount, true), denom),
          })),
        },
      },
    ]
    dispatch(
      signAndCreateTransaction(
        msgs,
        manualGasLimit || '250000',
        sequence,
        undefined,
        () => {
          setDisabled(true)
        },
        () => {
          setDisabled(false)
          handleClose()
        },
        () => {
          setDisabled(false)
        },
      ),
    )
  }

  return (
    <Popup open={open} title="">
      <Header
        subTitle="Step 2 of 2"
        title="Send funds"
        onClose={() => {
          setDisabled(false)
          handleClose()
        }}
      />
      <Wrapper>
        <AddressInfo address={safeAddress} />
        <div className="balance">
          Balance: <strong>{formatNativeCurrency(balance)}</strong>
        </div>
        <Divider withArrow />
        <p className="label">Recipients</p>
        <div className="recipients">
          {recipient?.map((recipient, index) => {
            return (
              <div className="recipient" key={index}>
                <div>{`${recipient.amount} ${selectedToken?.symbol}`}</div>
                <Icon type="arrowRight" size="sm" />
                <AddressInfo showName={false} showAvatar={false} address={recipient.address} />
              </div>
            )
          })}
        </div>
        <Gap height={24} />
        <Amount label="Total Amount" amount={formatNativeCurrency(totalAmount)} />
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

        <Amount
          label="Total Allocation Amount"
          amount={formatNativeCurrency(new BigNumber(+totalAmount).plus(+gasPriceFormatted).toString())}
        />
        <div className="notice">
          You’re about to create a transaction and will have to confirm it with your currently connected wallet.
        </div>
      </Wrapper>
      <Footer>
        <OutlinedNeutralButton
          onClick={() => {
            setDisabled(false)
            handleClose(true)
          }}
          disabled={isDisabled}
        >
          Back
        </OutlinedNeutralButton>
        <FilledButton onClick={signTransaction} disabled={isDisabled}>
          Submit
        </FilledButton>
      </Footer>
    </Popup>
  )
}
