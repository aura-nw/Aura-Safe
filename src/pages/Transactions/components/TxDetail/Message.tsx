import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import { formatNativeToken } from 'src/utils'
import AddressInfo from 'src/components/AddressInfo'
import { Fragment } from 'react'
import { formatDateTime, formatWithSchema } from 'src/utils/date'
import StatusCard from 'src/components/StatusCard'
import styled from 'styled-components'

const voteMapping = {
  1: 'Yes',
  2: 'Abstain',
  3: 'No',
  4: 'Nowithveto',
}

const StyledStatus = styled.div`
  > div {
    background: transparent;
    font-size: 14px;
    padding: 0;
  }
`
export default function TxMsg({ tx, txDetail }) {
  const type = tx.txInfo.typeUrl
  const amount = formatNativeToken(txDetail.txMessage[0]?.amount || 0)
  if (!txDetail) return null
  if (type == MsgTypeUrl.ExecuteContract) {
    return (
      <div className="tx-msg">
        <div>
          <span className="contentTertiary">Interact with contract: </span>
          <span style={{ display: 'inline-block' }}>
            <AddressInfo address={txDetail?.txMessage[0]?.contractAddress} showAvatar={false} showName={false} />
          </span>
        </div>

        <div className="function-name">{txDetail?.txMessage[0].contractFunction}</div>
        {Object.keys(JSON.parse(txDetail?.txMessage[0].contractArgs))?.map((key, index) => (
          <div className="field" key={index}>
            <div className="field__label">{key}:</div>
            <div className="field__data">{JSON.parse(txDetail?.txMessage[0].contractArgs)[key]}</div>
          </div>
        ))}
      </div>
    )
  }
  if (type == MsgTypeUrl.Delegate) {
    return (
      <div className="tx-msg">
        <strong>
          Delegate <span className="token">{amount}</span> to:
        </strong>
        <AddressInfo address={txDetail?.txMessage[0]?.validatorAddress} />
      </div>
    )
  }
  if (type == MsgTypeUrl.Undelegate) {
    return (
      <div className="tx-msg">
        <strong>
          Undelegate <span className="token">{amount}</span> from:
        </strong>
        <AddressInfo address={txDetail?.txMessage[0]?.validatorAddress} />
        {txDetail.autoClaimAmount ? (
          <strong>
            Auto Claim Reward: <span className="token">{formatNativeToken(txDetail.autoClaimAmount)}</span>
          </strong>
        ) : null}
      </div>
    )
  }
  if (type == MsgTypeUrl.Send) {
    return (
      <div className="tx-msg">
        <strong>
          Send <span className="token">{amount}</span> to:
        </strong>
        <AddressInfo address={txDetail?.txMessage[0]?.toAddress} />
      </div>
    )
  }
  if (type == MsgTypeUrl.MultiSend) {
    const totalAmount = txDetail?.txMessage?.[0]?.outputs?.reduce((total, recipient) => {
      return total + +recipient?.coins[0]?.amount
    }, 0)
    return (
      <div className="tx-msg">
        <strong>
          Send total of <span className="token">{formatNativeToken(totalAmount)}</span> to:
        </strong>
        {txDetail?.txMessage[0].outputs.map((recipient, index) => (
          <div className="recipient" key={index}>
            <p>
              <span className="token">{formatNativeToken(recipient?.coins[0]?.amount)}</span> to
            </p>
            <AddressInfo showAvatar={false} showName={false} address={recipient.address} />
          </div>
        ))}
      </div>
    )
  }
  if (type == MsgTypeUrl.Redelegate) {
    return (
      <div className="tx-msg">
        <strong>
          Redelegate <span className="token">{amount}</span> from:
        </strong>
        <AddressInfo address={txDetail?.txMessage[0]?.validatorSrcAddress} />
        <strong>To:</strong>
        <AddressInfo address={txDetail?.txMessage[0]?.validatorDstAddress} />
        {txDetail.autoClaimAmount ? (
          <strong>
            Auto Claim Reward: <span className="token">{txDetail.autoClaimAmount}</span>
          </strong>
        ) : null}
      </div>
    )
  }
  if (type == MsgTypeUrl.Vote) {
    return (
      <div className="tx-msg">
        <strong>
          Vote <span>{voteMapping[txDetail?.txMessage[0]?.voteOption]}</span> on Proposal{' '}
          <span className="token">{`#${txDetail?.txMessage[0]?.proposalId}`}</span>:
        </strong>
        <p>{txDetail?.extraDetails?.proposalDetail?.title}</p>
        <strong>Voting end date:</strong>
        <p>{formatWithSchema(new Date(txDetail?.extraDetails?.proposalDetail?.votingEnd).getTime(), 'dd/MM/yyyy')}</p>
        <strong>Proposal result:</strong>
        <StyledStatus>
          <StatusCard status={txDetail?.extraDetails?.proposalDetail?.status} />
        </StyledStatus>
      </div>
    )
  }
  if (type == MsgTypeUrl.GetReward) {
    return (
      <div className="tx-msg">
        <strong>Claim reward from:</strong>
        {txDetail?.txMessage &&
          txDetail?.txMessage?.map((msg, index) => {
            return (
              <Fragment key={index}>
                <AddressInfo address={msg?.validatorAddress} />
                {msg?.amount && (
                  <strong>
                    Amount: <span className="token">{formatNativeToken(msg?.amount || 0)}</span>
                  </strong>
                )}
              </Fragment>
            )
          })}
      </div>
    )
  }
  return <div></div>
}
