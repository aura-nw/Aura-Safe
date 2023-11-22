import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AddressInfo from 'src/components/AddressInfo'
import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'
import { Message } from 'src/components/CustomTransactionMessage/SmallMsg'
import Divider from 'src/components/Divider'
import FeeAndSequence from 'src/components/FeeAndSequence'
import { Popup } from 'src/components/Popup'
import Footer from 'src/components/Popup/Footer'
import Header from 'src/components/Popup/Header'
import Amount from 'src/components/TxComponents/Amount'
import { getChainDefaultGasPrice, getChainInfo, getCoinDecimal, getNativeCurrency } from 'src/config'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import calculateGasFee from 'src/logic/providers/utils/fee'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import { extractSafeAddress } from 'src/routes/routes'
import { formatNativeCurrency, formatNumber } from 'src/utils'
import { signAndCreateTransaction } from 'src/utils/signer'
import { Wrap } from './styles'
import AlertIcon from 'src/assets/icons/alert.svg'
export default function ReviewPopup({ open, setOpen, gasUsed, msg }) {
  const safeAddress = extractSafeAddress()
  const dispatch = useDispatch()
  const { nativeBalance: balance } = useSelector(currentSafeWithNames)
  const chainDefaultGasPrice = getChainDefaultGasPrice()
  const decimal = getCoinDecimal()
  const nativeCurrency = getNativeCurrency()
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
  const [amount, setAmount] = useState('0')
  const userWalletAddress = useSelector(userAccountSelector)
  const chainInfo = getChainInfo()

  useEffect(() => {
    if (gasUsed) {
      setManualGasLimit(gasUsed)
      const gasFee = calculateGasFee(+gasUsed, +chainDefaultGasPrice, decimal)
      setGasPriceFormatted(gasFee)
    }
  }, [gasUsed])

  useEffect(() => {
    let newTotalAmount = new BigNumber(0)

    msg.map((message: any) => {
      if ('/cosmos.bank.v1beta1.MsgSend' == message.typeUrl) {
        newTotalAmount = newTotalAmount.plus(+formatNumber(message?.value?.amount[0]?.amount || 0))
      }
      if (MsgTypeUrl.MultiSend == message.typeUrl) {
        message.value?.outputs?.map((re) => {
          newTotalAmount = newTotalAmount.plus(+formatNumber(re?.coins[0]?.amount || 0))
        })
      }
    })
    const gasUsed = (250000 * msg.length).toString()
    setManualGasLimit(gasUsed)
    const gasFee = calculateGasFee(+gasUsed, +chainDefaultGasPrice, decimal)
    setGasPriceFormatted(gasFee)
    setAmount(newTotalAmount.toString())
  }, [msg.length])

  const signTransaction = async () => {
    dispatch(
      signAndCreateTransaction(
        msg,
        manualGasLimit || '250000',
        sequence,
        undefined,
        undefined,
        () => {
          setDisabled(true)
        },
        () => {
          setOpen(false)
          setDisabled(false)
        },
        () => {
          setDisabled(false)
        },
      ),
    )
  }

  return (
    <Popup title="" open={open} handleClose={() => setOpen(false)}>
      <Header onClose={() => setOpen(false)} title={'Custom Transaction'} />
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
        <div className="gas-warning">
          <div>
            <img src={AlertIcon} alt="" />
          </div>
          <div>Failed to estimate gas. Default value applied.</div>
        </div>
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
          amount={formatNativeCurrency(
            new BigNumber(+amount)
              .div(new BigNumber(10).pow(nativeCurrency.decimals))
              .plus(+gasPriceFormatted)
              .toString(),
          )}
          label="Total Allocation Amount"
        />
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
