import { Loader } from '@aura/safe-react-components'
import { ReactElement, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Icon from 'src/assets/icons/Stamp.svg'
import BoxCard from 'src/components/BoxCard'
import Breadcrumb from 'src/components/Breadcrumb'
import { ConnectWalletModal } from 'src/components/ConnectWalletModal'
import { LoadingContainer } from 'src/components/LoaderContainer'
import WarningPopup from 'src/components/Popup/WarningPopup'
import StatusCard from 'src/components/StatusCard'
import DenseTable, { StyledTableCell, StyledTableRow } from 'src/components/Table/DenseTable'
import Col from 'src/components/layout/Col'
import { _getChainId, getChainInfo, getExplorerUriTemplate } from 'src/config'
import { evalTemplate } from 'src/config/utils'
import useConnectWallet from 'src/logic/hooks/useConnectWallet'
import addProposals from 'src/logic/proposal/store/actions/addProposal'
import { loadedSelector } from 'src/logic/wallets/store/selectors'
import { extractSafeAddress } from 'src/routes/routes'
import { MChainInfo, getProposals } from 'src/services'
import { IProposal } from 'src/types/proposal'
import { calcBalance } from 'src/utils/calc'
import { formatDateTimeDivider } from 'src/utils/date'
import ProposalsCard from './ProposalsCard'
import VotingModal from './VotingPopup'
import { GreenText, ProposalsSection, StyledBlock, StyledColumn, TitleNumberStyled } from './styles'
const parseBalance = (balance: IProposal['totalDeposit'], chainInfo: MChainInfo) => {
  const symbol = chainInfo.nativeCurrency.symbol
  const amount = calcBalance(balance[0].amount, chainInfo.nativeCurrency.decimals)

  return {
    amount: Number(amount)?.toFixed(6) || '-',
    symbol: Number(amount)?.toFixed(6) ? symbol : '',
  }
}

function Voting(): ReactElement {
  const dispatch = useDispatch()
  const chainInfo = getChainInfo() as any
  const loaded = useSelector(loadedSelector)
  const { connectWalletState, onConnectWalletShow, onConnectWalletHide } = useConnectWallet()

  const safeAddress = extractSafeAddress()
  const [openVotingModal, setOpenVotingModal] = useState<boolean>(false)
  const [openWarningPopup, setOpenWarningPopup] = useState<boolean>(false)
  const chainId = _getChainId()

  const [proposals, setProposals] = useState<IProposal[]>([])
  const [selectedProposal, setSelectedProposal] = useState<IProposal | undefined>(undefined)

  const getMostVote = (tally) => {
    // default mostVoted to yes
    let mostVotedOptionKey = Object.keys(tally)[3]
    // calculate sum to determine percentage
    let sum = 0

    for (const key in tally) {
      if (Object.prototype.hasOwnProperty.call(tally, key)) {
        if (+tally[key] > +tally[mostVotedOptionKey]) {
          mostVotedOptionKey = key
        }
        sum += +tally[key]
      }
    }
    return { mostVotedOptionKey, sum }
  }

  const getPercentage = (value: number | string, total: number | string): string => {
    const convertedValue = Number(value)
    const convertedTotal = Number(total)
    if (convertedValue === 0) {
      return '0'
    }
    return ((+convertedValue * 100) / convertedTotal).toFixed(2)
  }

  useEffect(() => {
    getProposals().then((res) => {
      if (res.data?.[chainInfo.environment].proposal) {
        const proposalsData: IProposal[] = res.data[chainInfo.environment].proposal.map((proposal) => {
          const { mostVotedOptionKey, sum } = getMostVote(proposal.tally)
          const tally = {
            abstain: { number: proposal.tally.abstain, percent: getPercentage(proposal.tally.abstain, sum) },
            no: { number: proposal.tally.no, percent: getPercentage(proposal.tally.no, sum) },
            noWithVeto: {
              number: proposal.tally['no_with_veto'],
              percent: getPercentage(proposal.tally['no_with_veto'], sum),
            },
            yes: { number: proposal.tally.yes, percent: getPercentage(proposal.tally.yes, sum) },
            mostVotedOn: {
              name: mostVotedOptionKey,
              percent: getPercentage(proposal.tally[mostVotedOptionKey], sum),
            },
          }
          return {
            id: proposal.proposal_id,
            title: proposal.content.title,
            proposer: proposal.proposer_address,
            status: proposal.status,
            votingStart: proposal.voting_start_time,
            votingEnd: proposal.voting_end_time,
            submitTime: proposal.submit_time,
            totalDeposit: proposal.total_deposit,
            tally: tally,
          }
        })
        setProposals(proposalsData)
        dispatch(
          addProposals({
            chainId,
            safeAddress,
            proposals: proposalsData,
          }),
        )
      }
    })
  }, [chainId, dispatch, safeAddress])

  if (proposals.length <= 0) {
    return (
      <LoadingContainer>
        <Loader size="md" />
      </LoadingContainer>
    )
  }

  const onVoteButtonClick = async (proposal) => {
    if (!loaded) {
      onConnectWalletShow()
      return
    }

    setSelectedProposal(proposal)
    setOpenVotingModal(true)
  }

  const handleDetail = (proposalId) => {
    const uri = getExplorerUriTemplate()['proposals']
    window.open(evalTemplate(uri, { ['proposalsId']: proposalId }))
  }

  return (
    <>
      <Breadcrumb title="Voting" subtitleIcon={Icon} subtitle="Voting" />
      <StyledBlock>
        <StyledColumn sm={12} xs={12}>
          {proposals.slice(0, 4).map((proposal) => (
            <Col sm={6} xs={12} key={proposal.id}>
              <ProposalsCard proposal={proposal} handleVote={() => onVoteButtonClick(proposal)} />
            </Col>
          ))}
        </StyledColumn>
      </StyledBlock>
      <ProposalsSection>
        <Col start="sm" sm={12} xs={12}>
          <BoxCard justify="flex-start" column>
            <TitleNumberStyled>Proposals</TitleNumberStyled>
            <DenseTable headers={['#ID', 'TITLE', 'STATUS', 'VOTING START', 'SUBMIT TIME', 'TOTAL DEPOSIT']}>
              {proposals.map((row) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell component="th" scope="row">
                    {row.id}
                  </StyledTableCell>
                  <StyledTableCell align="left" onClick={() => handleDetail(row.id)}>
                    <GreenText>{row.title}</GreenText>
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    <StatusCard status={row.status} showDot />
                  </StyledTableCell>
                  <StyledTableCell align="left">{formatDateTimeDivider(row.votingStart)}</StyledTableCell>
                  <StyledTableCell align="left">{formatDateTimeDivider(row.votingEnd)}</StyledTableCell>
                  <StyledTableCell align="left">
                    <div style={{ display: 'flex' }}>
                      {parseFloat(parseBalance(row.totalDeposit, chainInfo).amount)}&ensp;
                      <GreenText>{parseBalance(row.totalDeposit, chainInfo).symbol}</GreenText>
                    </div>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </DenseTable>
          </BoxCard>
        </Col>
      </ProposalsSection>

      <VotingModal
        proposal={selectedProposal}
        openVotingModal={openVotingModal}
        setOpenVotingModal={setOpenVotingModal}
      />

      <WarningPopup open={openWarningPopup} onClose={() => setOpenWarningPopup(false)}>
        You don&apos;t have the right to vote on this proposal because the voting period of this proposal started before
        you staked Aura.
      </WarningPopup>
      <ConnectWalletModal isOpen={connectWalletState.showConnect} onClose={onConnectWalletHide}></ConnectWalletModal>
    </>
  )
}

export default Voting
