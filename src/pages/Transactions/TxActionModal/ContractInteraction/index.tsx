import { coins } from '@cosmjs/stargate'
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
import { TxSignModalContext } from '../../Queue'
import { ReviewTxPopupWrapper } from '../../styled'

import { signAndChangeTransactionSequence, signAndConfirmTransaction } from 'src/utils/signer'
import { getNotice, getTitle } from '..'
import EditSequence from '../EditSequence'
import { DeleteButton, TxContent } from '../styles'
export default function Execute({ open, onClose, data, sendTx, rejectTx, disabled, setDisabled, deleteTx }) {
  const { nativeBalance: balance, nextQueueSeq, sequence: currentSequence } = useSelector(currentSafeWithNames)
  const { action } = useContext(TxSignModalContext)
  const dispatch = useDispatch()
  const [sequence, setSequence] = useState(data?.txSequence)

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
          undefined,
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
          undefined,
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
          <AddressInfo address={data?.txDetails?.txMessage[0]?.contractSender} />
          <div className="balance">
            Balance: <strong>{formatNativeCurrency(balance)}</strong>
          </div>
          <Divider withArrow />
          <AddressInfo address={data?.txDetails?.txMessage[0].contractAddress} showAvatar={false} showName={false} />
          <div className="function-name">{data?.txDetails?.txMessage[0].contractFunction}</div>
          {data?.txDetails?.txMessage[0].contractArgs &&
            Object.keys(JSON.parse(data?.txDetails?.txMessage[0].contractArgs))?.map((key, index) => (
              <div className="field" key={index}>
                <div className="field__label">{key}:</div>
                <div className="field__data">
                  {typeof JSON.parse(data?.txDetails?.txMessage[0].contractArgs)[key] == 'object'
                    ? JSON.stringify(JSON.parse(data?.txDetails?.txMessage[0].contractArgs)[key])
                    : JSON.parse(data?.txDetails?.txMessage[0].contractArgs)[key]}
                </div>
              </div>
            ))}
          <Gap height={24} />
          {action == 'delete' ? (
            <TxContent>
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
                <div className="value">{formatNativeToken(+data.txDetails?.fee || 0)}</div>
              </div>
            </TxContent>
          ) : (
            <>
              {action == 'change-sequence' && (
                <>
                  <EditSequence defaultSequence={data?.txSequence} sequence={sequence} setSequence={setSequence} />
                  <Gap height={24} />
                </>
              )}
              <Divider />
              <Amount label="Total Allocation Amount" amount={formatNativeToken(+data.txDetails?.fee || 0)} />
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
