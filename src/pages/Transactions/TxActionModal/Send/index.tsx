import { coins } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'
import { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AddressInfo from 'src/components/AddressInfo'
import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'
import Divider from 'src/components/Divider'
import Gap from 'src/components/Gap'
import { Popup } from 'src/components/Popup'
import Footer from 'src/components/Popup/Footer'
import Header from 'src/components/Popup/Header'
import Amount from 'src/components/TxComponents/Amount'
import { getCoinMinimalDenom } from 'src/config'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { formatNativeCurrency, formatNativeToken } from 'src/utils'
import { signAndChangeTransactionSequence, signAndConfirmTransaction } from 'src/utils/signer'
import { getNotice, getTitle } from '..'
import { TxSignModalContext } from '../../Queue'
import { ReviewTxPopupWrapper } from '../../styled'
import EditSequence from '../EditSequence'
import TxMemo from 'src/components/Input/TxMemo'
import { DeleteButton, TxContent } from '../styles'

export default function Execute({ open, onClose, data, sendTx, rejectTx, disabled, setDisabled, deleteTx }) {
  const { action } = useContext(TxSignModalContext)
  const { nativeBalance: balance, nextQueueSeq, sequence: currentSequence } = useSelector(currentSafeWithNames)
  const dispatch = useDispatch()
  const [sequence, setSequence] = useState(data?.txSequence)
  const [txMemo, setTxMemo] = useState(data?.txDetails?.txMemo)

  const totalAllocationAmount = formatNativeToken(
    new BigNumber(+data?.txDetails?.txMessage[0]?.amount || 0).plus(+data.txDetails?.fee || 0).toString(),
  )
  const txHandler = async (type) => {
    if (type == 'confirm') {
      dispatch(
        signAndConfirmTransaction(
          data?.id,
          JSON.parse(data?.txDetails?.rawMessage),
          {
            amount: coins(data?.txDetails?.fee, getCoinMinimalDenom()),
            gas: data?.txDetails?.gas.toString(),
          },
          sequence,
          txMemo,
          () => {
            setDisabled(true)
          },
          () => {
            setDisabled(false)
            onClose()
          },
          () => {
            setDisabled(false)
          },
        ),
      )
    } else {
      dispatch(
        signAndChangeTransactionSequence(
          data?.id,
          JSON.parse(data?.txDetails?.rawMessage),
          {
            amount: coins(data?.txDetails?.fee, getCoinMinimalDenom()),
            gas: data?.txDetails?.gas.toString(),
          },
          sequence,
          txMemo,
          () => {
            setDisabled(true)
          },
          () => {
            setDisabled(false)
            onClose()
          },
          () => {
            setDisabled(false)
          },
        ),
      )
    }
  }
  return (
    <>
      <Popup open={open} handleClose={onClose} title="">
        <Header onClose={onClose} title={getTitle(action)} />
        <ReviewTxPopupWrapper>
          <AddressInfo address={data?.txDetails?.txMessage[0]?.fromAddress} />
          <div className="balance">
            Balance: <strong>{formatNativeCurrency(balance)}</strong>
          </div>
          <Divider withArrow />
          <p className="label">Recipient</p>
          <AddressInfo address={data?.txDetails?.txMessage[0]?.toAddress} />
          <Gap height={16} />
          {action == 'delete' ? (
            <TxContent>
              <div>
                <div className="label">Amount</div>
                <div className="value">{formatNativeToken(data?.txDetails?.txMessage[0]?.amount)}</div>
              </div>
              <div>
                <div className="label">Transaction fee</div>
                <div className="value">{formatNativeToken(+data.txDetails?.fee)}</div>
              </div>
              <div>
                <div className="label">Transaction sequence</div>
                <div className="value">{data?.txSequence}</div>
              </div>
              <div className="divider"></div>
              <div>
                <div className="label">Total Allocation Amount</div>
                <div className="value">{totalAllocationAmount}</div>
              </div>
            </TxContent>
          ) : (
            <>
              <Amount amount={formatNativeToken(data?.txDetails?.txMessage[0]?.amount)} />
              {action == 'change-sequence' && (
                <>
                  <Gap height={16} />
                  <EditSequence defaultSequence={data?.txSequence} sequence={sequence} setSequence={setSequence} />
                </>
              )}
              <Gap height={16} />
              <TxMemo txMemo={txMemo} setTxMemo={setTxMemo} />
              <Divider />
              <Amount label="Total Allocation Amount" amount={totalAllocationAmount} />
              <Divider />
            </>
          )}
          <div className="notice">{getNotice(action)}</div>
        </ReviewTxPopupWrapper>
        <Footer>
          <OutlinedNeutralButton onClick={onClose}>Back</OutlinedNeutralButton>
          {action == 'delete' ? (
            <DeleteButton onClick={deleteTx}>Delete</DeleteButton>
          ) : (
            <FilledButton
              onClick={() => {
                action == 'confirm'
                  ? txHandler('confirm')
                  : action == 'reject'
                  ? rejectTx()
                  : action == 'change-sequence'
                  ? txHandler('change-sequence')
                  : sendTx()
              }}
              disabled={disabled || +sequence < +currentSequence}
            >
              Submit
            </FilledButton>
          )}
        </Footer>
      </Popup>
    </>
  )
}
