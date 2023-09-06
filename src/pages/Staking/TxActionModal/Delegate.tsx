import { coin } from '@cosmjs/stargate'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AddressInfo from 'src/components/AddressInfo'
import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'
import Divider from 'src/components/Divider'
import FeeAndSequence from 'src/components/FeeAndSequence'
import Gap from 'src/components/Gap'
import Footer from 'src/components/Popup/Footer'
import Amount from 'src/components/TxComponents/Amount'
import { getChainDefaultGasPrice, getCoinDecimal, getCoinMinimalDenom } from 'src/config'
import { allDelegation } from 'src/logic/delegation/store/selectors'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import calculateGasFee from 'src/logic/providers/utils/fee'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { extractSafeAddress } from 'src/routes/routes'
import { convertAmount, formatNativeCurrency, formatNativeToken } from 'src/utils'
import { signAndCreateTransaction } from 'src/utils/signer'
import { Wrapper } from './style'
import { DEFAULT_GAS_LIMIT } from 'src/services/constant/common'

export default function Delegate({ validator, amount, onClose, gasUsed }) {
  const safeAddress = extractSafeAddress()
  const dispatch = useDispatch()
  const { nativeBalance: balance } = useSelector(currentSafeWithNames)
  const delegations = useSelector(allDelegation)
  const stakedAmount = delegations?.find(
    (delegation: any) => delegation.operatorAddress == validator.safeStaking,
  )?.staked
  const denom = getCoinMinimalDenom()
  const chainDefaultGasPrice = getChainDefaultGasPrice()
  const decimal = getCoinDecimal()
  const defaultGas = gasUsed || DEFAULT_GAS_LIMIT.toString()
  const gasFee =
    defaultGas && chainDefaultGasPrice
      ? calculateGasFee(+defaultGas, +chainDefaultGasPrice, decimal)
      : chainDefaultGasPrice

  const [manualGasLimit, setManualGasLimit] = useState<string | undefined>(defaultGas)
  const [gasPriceFormatted, setGasPriceFormatted] = useState(gasFee)
  const [openGasInput, setOpenGasInput] = useState<boolean>(false)
  const [isDisabled, setDisabled] = useState(false)
  const [sequence, setSequence] = useState('0')

  const signTransaction = async () => {
    const msgs = [
      {
        typeUrl: MsgTypeUrl.Delegate,
        value: {
          amount: coin(convertAmount(amount, true), denom),
          delegatorAddress: safeAddress,
          validatorAddress: validator.safeStaking,
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
        <AddressInfo address={safeAddress} />
        <div className="balance">
          Balance: <strong>{formatNativeCurrency(balance)}</strong>
        </div>
        <Divider withArrow />
        <p className="label">Validator</p>
        <AddressInfo address={validator.safeStaking} name={validator.name} avatarUrl={validator.avatar} />
        {stakedAmount && (
          <div className="balance">
            Staked Amount: <strong>{formatNativeToken(stakedAmount)}</strong>
          </div>
        )}
        <Gap height={24} />
        <Amount amount={formatNativeCurrency(amount)} />
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
      </Wrapper>
      <Footer>
        <OutlinedNeutralButton onClick={onClose} disabled={isDisabled}>
          Close
        </OutlinedNeutralButton>
        <FilledButton onClick={signTransaction} disabled={isDisabled}>
          Submit
        </FilledButton>
      </Footer>
    </>
  )
}
