import { coins } from '@cosmjs/stargate'
import { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'
import Divider from 'src/components/Divider'
import Gap from 'src/components/Gap'
import { Popup } from 'src/components/Popup'
import Footer from 'src/components/Popup/Footer'
import Header from 'src/components/Popup/Header'
import { getCoinMinimalDenom } from 'src/config'
import { allDelegation } from 'src/logic/delegation/store/selectors'
import { formatNativeToken } from 'src/utils'

import AddressInfo from 'src/components/AddressInfo'
import Amount from 'src/components/TxComponents/Amount'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { signAndChangeTransactionSequence, signAndConfirmTransaction } from 'src/utils/signer'
import { getNotice, getTitle } from '..'
import { TxSignModalContext } from '../../Queue'
import { ReviewTxPopupWrapper } from '../../styled'
import EditSequence from '../EditSequence'
import { DeleteButton, TxContent } from '../styles'
import TxMemo from 'src/components/Input/TxMemo'

export default function Execute({ open, onClose, data, sendTx, rejectTx, disabled, setDisabled, deleteTx }) {
  const { action } = useContext(TxSignModalContext)
  const delegations = useSelector(allDelegation)
  const { sequence: currentSequence } = useSelector(currentSafeWithNames)
  const srcValidatorStakedAmount = delegations?.find(
    (delegation: any) => delegation.operatorAddress == data?.txDetails?.txMessage[0]?.validatorSrcAddress,
  )?.staked
  const dstValidatorStakedAmount = delegations?.find(
    (delegation: any) => delegation.operatorAddress == data?.txDetails?.txMessage[0]?.validatorDstAddress,
  )?.staked
  const dispatch = useDispatch()
  const [sequence, setSequence] = useState(data?.txSequence)
  const [txMemo, setTxMemo] = useState(data?.txDetails?.txMemo)

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
  const totalAllocationAmount = formatNativeToken(+data.txDetails?.fee || 0)

  return (
    <>
      <Popup open={open} handleClose={onClose} title="">
        <Header onClose={onClose} title={getTitle(action)} />
        <ReviewTxPopupWrapper>
          <AddressInfo address={data?.txDetails?.txMessage[0]?.validatorSrcAddress} />
          {srcValidatorStakedAmount && (
            <div className="balance">
              Amount Staked: <strong>{formatNativeToken(srcValidatorStakedAmount)}</strong>
            </div>
          )}
          <Divider withArrow />
          <p className="label">Validator</p>
          <AddressInfo address={data?.txDetails?.txMessage[0]?.validatorDstAddress} />
          {dstValidatorStakedAmount && (
            <div className="balance">
              Amount Staked: <strong>{formatNativeToken(dstValidatorStakedAmount)}</strong>
            </div>
          )}
          <Gap height={24} />
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
              {action == 'change-sequence' && (
                <>
                  <EditSequence defaultSequence={data?.txSequence} sequence={sequence} setSequence={setSequence} />
                  <Gap height={24} />
                </>
              )}
              <TxMemo txMemo={txMemo} setTxMemo={setTxMemo} />
              <Gap height={24} />
              <Amount amount={formatNativeToken(data?.txDetails?.txMessage[0]?.amount)} />
              <Divider />
              <Amount label="Total Allocation Amount" amount={totalAllocationAmount} />
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
