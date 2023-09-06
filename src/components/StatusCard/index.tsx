import { ReactElement } from 'react'
import { ProposalStatus } from 'src/types/proposal'
import styled from 'styled-components'

const StatusStyled = styled.div<{ bg: string; color: string }>`
  padding: 8px 16px;
  background-color: ${({ bg }) => bg};
  border-radius: 4px;
  color: ${({ color }) => color};
  font-size: 12px;
  display: flex;
`
const DotStyle = styled.div<{ bg: string }>`
  background-color: ${({ bg }) => bg};
  width: 8px;
  height: 8px;
  border-radius: 50%;
  align-self: center;
  margin-right: 10px;
`

interface Props {
  status: ProposalStatus | string
  showDot?: boolean
}

function StatusCard({ status, showDot }: Props): ReactElement {
  const checkShowDot = (bg: string) => (showDot ? 'transparent' : bg)

  const returnStatus = () => {
    switch (status) {
      case ProposalStatus.DepositPeriod:
        return (
          <StatusStyled bg={checkShowDot('rgba(231, 187, 65, 0.2)')} color="#FFCD76">
            {showDot && <DotStyle bg="#FFCD76" />}
            Deposit Period
          </StatusStyled>
        )

      case ProposalStatus.Rejected:
        return (
          <StatusStyled bg={checkShowDot('rgba(220, 56, 63, 0.2);')} color="#FA8684">
            {showDot && <DotStyle bg="#FA8684" />}
            Rejected
          </StatusStyled>
        )
      case ProposalStatus.VotingPeriod:
        return (
          <StatusStyled bg={checkShowDot('rgba(91, 200, 255, 0.2);')} color="#7DC8FA">
            {showDot && <DotStyle bg="#7DC8FA" />}
            Voting Period
          </StatusStyled>
        )
      default:
        return (
          <StatusStyled bg={checkShowDot('rgba(84, 206, 140, 0.2);')} color="#67C091">
            {showDot && <DotStyle bg="#67C091" />}
            Passed
          </StatusStyled>
        )
    }
  }

  return <>{returnStatus()}</>
}

export default StatusCard
