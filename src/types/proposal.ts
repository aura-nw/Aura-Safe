export enum ProposalStatus {
  Rejected = 'PROPOSAL_STATUS_REJECTED',
  Passed = 'PROPOSAL_STATUS_PASSED',
  VotingPeriod = 'PROPOSAL_STATUS_VOTING_PERIOD',
  DepositPeriod = 'PROPOSAL_STATUS_DEPOSIT_PERIOD',
  Failed = 'PROPOSAL_STATUS_FAILED',
}

export enum VoteMapping {
  'yes' = 'Yes',
  'abstain' = 'Abstain',
  'no' = 'No',
  'no_with_veto' = 'NoWithVeto',
}

interface VoteResult {
  number?: string
  name?: string
  percent: string
}

interface Tally {
  yes: VoteResult
  abstain: VoteResult
  no: VoteResult
  noWithVeto: VoteResult
  mostVotedOn: VoteResult
}

interface Amount {
  denom: string
  amount: string
  _id: string
}

interface Turnout {
  voted: VoteResult
  votedAbstain: VoteResult
  didNotVote: VoteResult
}

export interface IProposal {
  id: number
  title: string
  proposer: string
  status: ProposalStatus
  votingStart: Date
  votingEnd: Date
  submitTime: Date
  totalDeposit: Amount[]
  tally: Tally
  description: string
  type: string
  depositEndTime: Date
  turnout: Turnout
  requestAmount: Amount
}
export interface IProposalRes {
  proposals: IProposal[]
}
