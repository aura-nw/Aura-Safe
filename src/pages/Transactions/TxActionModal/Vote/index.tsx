import { toBase64 } from '@cosmjs/encoding'
import { MsgVoteEncodeObject } from '@cosmjs/stargate'
import { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { OutlinedButton, OutlinedNeutralButton } from 'src/components/Button'
import { Popup } from 'src/components/Popup'
import Footer from 'src/components/Popup/Footer'
import Header from 'src/components/Popup/Header'
import { getChainInfo, getInternalChainId } from 'src/config'
import { enhanceSnackbarForAction, NOTIFICATIONS } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import { createMessage } from 'src/logic/providers/signing'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import { extractSafeAddress } from 'src/routes/routes'
import { DEFAULT_GAS_LIMIT } from 'src/services/constant/common'
import { ICreateSafeTransaction } from 'src/types/transaction'
import { calcFee } from 'src/utils'

import { TxSignModalContext } from '../../Queue'
import { ReviewTxPopupWrapper } from '../../styled'
import TotalAllocationAmount from '../TotalAllocationAmount'

export default function Execute({ open, onClose, data, sendTx, rejectTx, disabled, setDisabled, confirmTxFromApi }) {
  const { action } = useContext(TxSignModalContext)

  const title =
    action == 'confirm' ? 'Confirm transaction' : action == 'reject' ? 'Reject transaction' : 'Execute transaction'
  const noti =
    action == 'confirm'
      ? 'You’re about to confirm a transaction and will have to sign it using your currently connected wallet.'
      : action == 'reject'
      ? 'You’re about to reject a transaction. This action cannot be undone. Please make sure before proceeding.'
      : 'You’re about to execute a transaction and will have to confirm it with your currently connected wallet. Make sure you have enough funds in thís safe to fund the associated transaction amount and fee.'
  const userWalletAddress = useSelector(userAccountSelector)
  const dispatch = useDispatch()

  const confirmTx = async () => {
    setDisabled(true)
    const chainInfo = getChainInfo()
    const safeAddress = extractSafeAddress()
    const chainId = chainInfo.chainId
    const _sendFee = calcFee(DEFAULT_GAS_LIMIT)
    const votingTxParam = {
      option: 1,
      proposalId: 23,
    }
    const voteData: MsgVoteEncodeObject['value'] = {
      option: votingTxParam?.option,
      proposalId: votingTxParam?.proposalId as any,
      voter: safeAddress,
    }
    try {
      const signResult = await createMessage(chainId, safeAddress, MsgTypeUrl.Vote, voteData, _sendFee)
      if (!signResult) throw new Error()
      const signatures = toBase64(signResult.signatures[0])
      const bodyBytes = toBase64(signResult.bodyBytes)
      const authInfoBytes = toBase64(signResult.authInfoBytes)
      const data: ICreateSafeTransaction = {
        internalChainId: getInternalChainId(),
        creatorAddress: userWalletAddress,
        signature: signatures,
        bodyBytes: bodyBytes,
        authInfoBytes: authInfoBytes,
        from: safeAddress,
        accountNumber: signResult.accountNumber,
        sequence: signResult.sequence,
      }
      confirmTxFromApi(data, chainId, safeAddress)
    } catch (error) {
      setDisabled(false)
      console.error(error)
      dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.TX_REJECTED_MSG)))
      onClose()
    }
  }
  return (
    <>
      <Popup open={open} handleClose={onClose} title="">
        <Header onClose={onClose} title={title} />
        <ReviewTxPopupWrapper>
          <TotalAllocationAmount amount={0} />
          <div className="notice">{noti}</div>
        </ReviewTxPopupWrapper>
        <Footer>
          <OutlinedNeutralButton size="md" onClick={onClose}>
            Back
          </OutlinedNeutralButton>
          <OutlinedButton
            size="md"
            onClick={() => {
              action == 'confirm' ? confirmTx() : action == 'reject' ? rejectTx() : sendTx()
            }}
            disabled={disabled}
          >
            Submit
          </OutlinedButton>
        </Footer>
      </Popup>
    </>
  )
}
