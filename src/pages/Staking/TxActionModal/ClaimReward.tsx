import { Fragment, useState } from 'react'
import { useDispatch } from 'react-redux'
import AddressInfo from 'src/components/AddressInfo'
import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'
import FeeAndSequence from 'src/components/FeeAndSequence'
import Gap from 'src/components/Gap'
import Footer from 'src/components/Popup/Footer'
import Amount from 'src/components/TxComponents/Amount'
import { getChainDefaultGasPrice, getCoinDecimal } from 'src/config'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import calculateGasFee from 'src/logic/providers/utils/fee'
import { formatNativeCurrency } from 'src/utils'
import { signAndCreateTransaction } from 'src/utils/signer'
import { Wrapper } from './style'
import TxMemo from 'src/components/Input/TxMemo'

export default function ClaimReward({ listReward, onClose, gasUsed }) {
  const dispatch = useDispatch()
  const chainDefaultGasPrice = getChainDefaultGasPrice()
  const decimal = getCoinDecimal()
  const defaultGas = gasUsed || String(400000 * listReward.length)
  const gasFee =
    defaultGas && chainDefaultGasPrice
      ? calculateGasFee(+defaultGas, +chainDefaultGasPrice, decimal)
      : chainDefaultGasPrice
  const [manualGasLimit, setManualGasLimit] = useState<string | undefined>(defaultGas)
  const [gasPriceFormatted, setGasPriceFormatted] = useState(gasFee)
  const [openGasInput, setOpenGasInput] = useState<boolean>(false)
  const [isDisabled, setDisabled] = useState(false)
  const [sequence, setSequence] = useState('0')
  const [txMemo, setTxMemo] = useState<string>('')

  const signTransaction = async () => {
    const msgs: any[] = listReward.map((item) => ({
      typeUrl: MsgTypeUrl.GetReward,
      value: {
        delegatorAddress: item.delegatorAddress,
        validatorAddress: item.validatorAddress,
      },
    }))
    dispatch(
      signAndCreateTransaction(
        msgs,
        manualGasLimit || '250000',
        sequence,
        undefined,
        txMemo,
        () => {
          setDisabled(true)
        },
        () => {
          setDisabled(false)
        },
        () => {
          setDisabled(false)
        },
      ),
    )
  }

  return (
    <>
      <Wrapper>
        <p className="label">Claim from:</p>
        {listReward.map((item, index) => {
          return (
            <Fragment key={index}>
              {index != 0 && <Gap height={6} />}
              <AddressInfo address={item.validatorAddress} />
            </Fragment>
          )
        })}
        <Gap height={16} />
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
        <Gap height={16} />
        <TxMemo txMemo={txMemo} setTxMemo={setTxMemo} />
        <Gap height={16} />
        <Amount amount={formatNativeCurrency(+gasPriceFormatted)} label="Total Allocation Amount" />
        <div className="notice">
          You’re about to create a transaction and will have to confirm it with your currently connected wallet.
        </div>
      </Wrapper>
      <Footer>
        <OutlinedNeutralButton onClick={onClose} disabled={isDisabled}>
          Close
        </OutlinedNeutralButton>
        <FilledButton onClick={signTransaction} disabled={isDisabled || openGasInput}>
          Submit
        </FilledButton>
      </Footer>
    </>
  )
}
