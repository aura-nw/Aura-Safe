import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AddressInfo from 'src/components/AddressInfo'
import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'
import Divider from 'src/components/Divider'
import FeeAndSequence from 'src/components/FeeAndSequence'
import { Popup } from 'src/components/Popup'
import Footer from 'src/components/Popup/Footer'
import Header from 'src/components/Popup/Header'
import Amount from 'src/components/TxComponents/Amount'
import { getChainDefaultGasPrice, getCoinDecimal } from 'src/config'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import calculateGasFee from 'src/logic/providers/utils/fee'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { extractSafeAddress } from 'src/routes/routes'
import { convertAmount, formatNativeCurrency } from 'src/utils'
import { signAndCreateTransaction } from 'src/utils/signer'
import { Wrap } from './styles'
import { IFund } from 'src/components/JsonschemaForm/FundForm'

export default function ReviewPopup({ open, setOpen, gasUsed, data, contractData }) {
  const safeAddress = extractSafeAddress()
  const dispatch = useDispatch()
  const { nativeBalance: balance } = useSelector(currentSafeWithNames)
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

  useEffect(() => {
    if (gasUsed) {
      setManualGasLimit(gasUsed)
      const gasFee = calculateGasFee(+gasUsed, +chainDefaultGasPrice, decimal)
      setGasPriceFormatted(gasFee)
    }
  }, [gasUsed])

  const signTransaction = async () => {
    const updatedFunds = contractData.funds.map((fund: IFund) => {
      const { logoUri, type, symbol, ...rest } = fund
      const updatedAmount = convertAmount(+fund.amount, true, +fund.tokenDecimal)
      return {
        ...rest,
        amount: updatedAmount,
      }
    })
    const msgs: any = [
      {
        typeUrl: MsgTypeUrl.ExecuteContract,
        value: {
          contract: contractData.contractAddress,
          sender: safeAddress,
          funds: updatedFunds ?? [],
          msg: {
            [contractData.selectedFunction]: data,
          },
        },
      },
    ]
    dispatch(
      signAndCreateTransaction(
        msgs,
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
      <Header onClose={() => setOpen(false)} title={'Contract Interaction'} />
      <Wrap>
        <AddressInfo address={safeAddress} />
        <div className="balance">
          Balance: <strong>{formatNativeCurrency(balance)}</strong>
        </div>
        <Divider withArrow />
        <AddressInfo address={contractData.contractAddress} showAvatar={false} showName={false} />
        <div className="function-name">{contractData.selectedFunction}</div>
        <div className="fields">
          {Object.keys(data)?.map((key, index) => (
            <div className="field" key={index}>
              <div className="field__label">{key}:</div>
              <div className="field__data">{typeof data[key] == 'object' ? JSON.stringify(data[key]) : data[key]}</div>
            </div>
          ))}
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
        <Amount
          listTokens={contractData.funds}
          amount={formatNativeCurrency(+gasPriceFormatted)}
          label="Total Allocation Amount"
          nativeFee={+gasPriceFormatted}
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
