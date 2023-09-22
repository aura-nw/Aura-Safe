import { ReactElement, useContext } from 'react'
import { useSelector } from 'react-redux'
import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'

import { Tooltip } from '@material-ui/core'
import ArrowUpDownIcon from 'src/assets/icons/ArrowsDownUp.png'
import TrashIcon from 'src/assets/icons/TrashSimple.svg'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import styled from 'styled-components'
import { TxSignModalContext } from '../../Queue'
type TxActionsProps = {
  transaction: any
}

const StyledLabel = styled.span`
  color: #5ee6d0;
`
const RedStyledLabel = styled.span`
  color: #e65e5e; ;
`
const YellowStyledLabel = styled.span`
  color: rgb(255, 186, 105); ;
`

export const TxActions = ({ transaction }: TxActionsProps): ReactElement => {
  const currentUser = useSelector(userAccountSelector)

  const { setOpen, setTxId, setAction } = useContext(TxSignModalContext)
  const { sequence: currentSequence } = useSelector(currentSafeWithNames)
  const isRejected = transaction.rejectors?.find((rejector) => rejector.value === currentUser)
  const isConfirmed = transaction.confirmations?.find((confirmation) => confirmation.signer.value === currentUser)
  if (
    typeof transaction?.confirmationsRequired == 'undefined' ||
    typeof transaction?.confirmations?.length == 'undefined'
  ) {
    return <></>
  }

  const confirmationNeeded = transaction?.confirmationsRequired - transaction?.confirmations?.length

  if (confirmationNeeded <= 0) {
    if (+currentSequence != +transaction.sequence) {
      return (
        <>
          <YellowStyledLabel>
            Transaction with sequence <strong>{currentSequence}</strong> needs to be executed first
          </YellowStyledLabel>
        </>
      )
    }
    return (
      <div className="buttons">
        <FilledButton
          onClick={() => {
            setTxId(transaction.txId)
            setAction('execute')
            setOpen(true)
          }}
        >
          Execute
        </FilledButton>
      </div>
    )
  }

  if (isRejected) {
    return (
      <>
        <div className="tx-sequence">
          <Tooltip title="Delete transaction" placement="top" arrow>
            <div
              onClick={() => {
                setTxId(transaction.txId)
                setAction('delete')
                setOpen(true)
              }}
            >
              <img src={TrashIcon} alt="icon" />
            </div>
          </Tooltip>
          <Tooltip title="Change transaction sequence" placement="top" arrow>
            <div
              onClick={() => {
                setTxId(transaction.txId)
                setAction('change-sequence')
                setOpen(true)
              }}
            >
              <img src={ArrowUpDownIcon} alt="icon" />
            </div>
          </Tooltip>
        </div>
        <RedStyledLabel>You have rejected this transaction</RedStyledLabel>
      </>
    )
  }

  if (isConfirmed) {
    return (
      <>
        <StyledLabel>You have confirmed this transaction</StyledLabel>
        <div className="tx-sequence">
          <Tooltip title="Delete transaction" placement="top" arrow>
            <div
              onClick={() => {
                setTxId(transaction.txId)
                setAction('delete')
                setOpen(true)
              }}
            >
              <img src={TrashIcon} alt="icon" />
            </div>
          </Tooltip>
          <Tooltip title="Change transaction sequence" placement="top" arrow>
            <div
              onClick={() => {
                setTxId(transaction.txId)
                setAction('change-sequence')
                setOpen(true)
              }}
            >
              <img src={ArrowUpDownIcon} alt="icon" />
            </div>
          </Tooltip>
        </div>
      </>
    )
  }

  return (
    <div className="buttons">
      <OutlinedNeutralButton
        color="#D5625E"
        onClick={() => {
          setTxId(transaction.txId)
          setAction('reject')
          setOpen(true)
        }}
      >
        Reject
      </OutlinedNeutralButton>
      <FilledButton
        style={{ marginLeft: 16 }}
        onClick={() => {
          setTxId(transaction.txId)
          setAction('confirm')
          setOpen(true)
        }}
      >
        Confirm
      </FilledButton>
      <div className="tx-sequence">
        <Tooltip title="Delete transaction" placement="top" arrow>
          <div
            onClick={() => {
              setTxId(transaction.txId)
              setAction('delete')
              setOpen(true)
            }}
          >
            <img src={TrashIcon} alt="icon" />
          </div>
        </Tooltip>
        <Tooltip title="Change transaction sequence" placement="top" arrow>
          <div
            onClick={() => {
              setTxId(transaction.txId)
              setAction('change-sequence')
              setOpen(true)
            }}
          >
            <img src={ArrowUpDownIcon} alt="icon" />
          </div>
        </Tooltip>
      </div>
    </div>
  )
}
