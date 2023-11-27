import { coins } from '@cosmjs/stargate'
import { useContext, useEffect, useState } from 'react'
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
import { extractSafeAddress } from 'src/routes/routes'
import { formatNativeCurrency, formatNativeToken, formatNumber } from 'src/utils'
import { TxSignModalContext } from '../../Queue'
import { ReviewTxPopupWrapper } from '../../styled'

import BigNumber from 'bignumber.js'
import { Message } from 'src/components/CustomTransactionMessage/SmallMsg'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import { signAndChangeTransactionSequence, signAndConfirmTransaction } from 'src/utils/signer'
import { getNotice, getTitle } from '..'
import EditSequence from '../EditSequence'
import { DeleteButton, TxContent } from '../styles'
import TxMemo from 'src/components/Input/TxMemo'

export default function Execute({ open, onClose, data, sendTx, rejectTx, disabled, setDisabled, deleteTx }) {
  const { nativeBalance: balance, sequence: currentSequence } = useSelector(currentSafeWithNames)
  const { action } = useContext(TxSignModalContext)
  const [sequence, setSequence] = useState(data?.txSequence)
  const safeAddress = extractSafeAddress()
  const dispatch = useDispatch()
  const [amount, setAmount] = useState('0')
  const [txMemo, setTxMemo] = useState(data?.txDetails?.txMemo)

  useEffect(() => {
    let newTotalAmount = new BigNumber(0)

    JSON.parse(data.txDetails?.rawMessage).map((message: any) => {
      if ('/cosmos.bank.v1beta1.MsgSend' == message.typeUrl) {
        newTotalAmount = newTotalAmount.plus(+formatNumber(message?.value?.amount[0]?.amount || 0))
      }
      if (MsgTypeUrl.MultiSend == message.typeUrl) {
        message.value?.outputs?.map((re) => {
          newTotalAmount = newTotalAmount.plus(+formatNumber(re?.coins[0]?.amount || 0))
        })
      }
    })
    setAmount(newTotalAmount.toString())
  }, [])

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
          <AddressInfo address={safeAddress} />
          <div className="balance">
            Balance: <strong>{formatNativeCurrency(balance)}</strong>
          </div>
          <Divider />
          <div className="msgs">
            {JSON.parse(data.txDetails?.rawMessage).map((message, index) => {
              return <Message key={index} index={index} msgData={message} />
            })}
          </div>
          <Gap height={16} />
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
                <div className="value">
                  {formatNativeToken(new BigNumber(+amount).plus(+data.txDetails?.fee || 0).toString())}
                </div>
              </div>
            </TxContent>
          ) : (
            <>
              {+amount > 0 ? (
                <>
                  <Amount amount={formatNativeToken(new BigNumber(+amount).toString())} />
                  <Gap height={16} />
                </>
              ) : null}
              {action == 'change-sequence' && (
                <>
                  <EditSequence defaultSequence={data?.txSequence} sequence={sequence} setSequence={setSequence} />
                  <Gap height={16} />
                </>
              )}
              <TxMemo txMemo={txMemo} setTxMemo={setTxMemo} />
              <Gap height={16} />
              <Divider />
              <Amount
                label="Total Allocation Amount"
                amount={formatNativeToken(new BigNumber(+amount).plus(+data.txDetails?.fee || 0).toString())}
              />
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
