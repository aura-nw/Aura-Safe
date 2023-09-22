import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import ReloadIcon from 'src/assets/icons/reload.svg'
import TextField from 'src/components/Input/TextField'
import { getChainDefaultGasPrice, getCoinDecimal, getNativeCurrency } from 'src/config'
import calculateGasFee from 'src/logic/providers/utils/fee'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { formatNativeCurrency } from 'src/utils'
import { usePagedQueuedTransactions } from 'src/utils/hooks/usePagedQueuedTransactions'
import { FilledButton, LinkButton } from '../Button'
import Gap from '../Gap'
import { Info, Wrap } from './styles'

export default function FeeAndSequence({
  open,
  setOpen,
  manualGasLimit,
  setManualGasLimit,
  gasPriceFormatted,
  setGasPriceFormatted,
  sequence,
  setSequence,
}) {
  const { nextQueueSeq, sequence: currentSequence } = useSelector(currentSafeWithNames)
  const { transactions } = usePagedQueuedTransactions()

  const nativeCurrency = getNativeCurrency()
  const chainDefaultGasPrice = getChainDefaultGasPrice()
  const decimal = getCoinDecimal()

  useEffect(() => {
    setSequence(nextQueueSeq)
  }, [nextQueueSeq])
  useEffect(() => {
    recalculateFee()
  }, [manualGasLimit])

  const recalculateFee = () => {
    if (!manualGasLimit) {
      setGasPriceFormatted(0)
      return
    }
    const gasFee =
      manualGasLimit && chainDefaultGasPrice
        ? calculateGasFee(+manualGasLimit, +chainDefaultGasPrice, decimal)
        : +chainDefaultGasPrice
    setGasPriceFormatted(gasFee)
  }
  if (open) {
    return (
      <Wrap>
        <div className="gas-fee">
          <TextField type="number" label="Gas Amount" value={manualGasLimit} onChange={setManualGasLimit} />
          <div className="tx-fee">
            <p className="title">Transaction fee</p>
            <div className="fee">
              <div className="fee-amount">
                <img alt={'nativeCurrencyLogoUri'} height={25} src={nativeCurrency.logoUri} />
                <p>{`${formatNativeCurrency(+gasPriceFormatted)}`}</p>
              </div>
            </div>
          </div>
        </div>
        <TextField
          endIcon={<img src={ReloadIcon} onClick={() => setSequence(nextQueueSeq)} alt="icon" />}
          type="number"
          label="Transaction sequence"
          value={sequence}
          onChange={(s) => (+s < 0 ? '' : setSequence(s))}
        />
        <Gap height={16} />
        <div>
          {!sequence || sequence.trim().length == 0 ? (
            <div className="noti">Please enter a sequence number.</div>
          ) : +sequence < +currentSequence ? (
            <div className="noti">The chosen Tx sequence has already been executed.</div>
          ) : transactions.some(([nonce, txs]) => +nonce == +sequence) ? (
            <div className="noti">
              There are other pending transactions with this sequence. Be aware that only one can be executed.
            </div>
          ) : +sequence > +nextQueueSeq ? (
            <div className="noti">
              Be aware that a transaction can only be executed after the execution of all other transactions with lower
              sequences.
            </div>
          ) : (
            <div></div>
          )}

          <FilledButton
            disabled={!manualGasLimit || +manualGasLimit < 1 || +sequence < +currentSequence}
            onClick={() => setOpen(false)}
          >
            Apply
          </FilledButton>
        </div>
      </Wrap>
    )
  } else {
    return (
      <Info>
        <div>
          <div className="tx-fee">
            <p className="title">Transaction fee</p>
            <div className="fee">
              <div className="fee-amount">
                <img alt={'nativeCurrencyLogoUri'} height={25} src={nativeCurrency.logoUri} />
                <p>{`${formatNativeCurrency(+gasPriceFormatted)}`}</p>
              </div>
            </div>
          </div>
          <div className="tx-sequence">
            <p className="title">Transaction sequence</p>
            <div className="sequence">{sequence}</div>
          </div>
        </div>
        <LinkButton onClick={() => setOpen(true)}>Advanced</LinkButton>
      </Info>
    )
  }
}
