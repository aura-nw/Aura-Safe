import { Loader, Text } from '@aura/safe-react-components'
import { ReactElement, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BoxCard from 'src/components/BoxCard'
import Breadcrumb from 'src/components/Breadcrumb'
import { ConnectWalletModal } from 'src/components/ConnectWalletModal'
import Col from 'src/components/layout/Col'
import { LoadingContainer } from 'src/components/LoaderContainer'
import WarningPopup from 'src/components/Popup/WarningPopup'
import StatusCard from 'src/components/StatusCard'
import DenseTable, { StyledTableCell, StyledTableRow } from 'src/components/Table/DenseTable'
import { getChainInfo, getExplorerUriTemplate, getInternalChainId, _getChainId } from 'src/config'
import { evalTemplate } from 'src/config/utils'
import { allDelegation } from 'src/logic/delegation/store/selectors'
import useConnectWallet from 'src/logic/hooks/useConnectWallet'
import { NOTIFICATIONS } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import addProposals from 'src/logic/proposal/store/actions/addProposal'
import { loadedSelector } from 'src/logic/wallets/store/selectors'
import { extractSafeAddress } from 'src/routes/routes'
import { getProposals, MChainInfo } from 'src/services'
import { IProposal } from 'src/types/proposal'
import { calcBalance } from 'src/utils/calc'
import { formatDateTimeDivider } from 'src/utils/date'
import { usePagedQueuedTransactions } from '../../utils/hooks/usePagedQueuedTransactions'
import ProposalsCard from './ProposalsCard'
import { ProposalsSection, StyledBlock, StyledColumn, TitleNumberStyled } from './styledComponents'
import VotingModal from './VotingPopup'
import Icon from 'src/assets/icons/Stamp.svg'
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
  const chainInfo = getChainInfo() as MChainInfo
  const loaded = useSelector(loadedSelector)
  const { connectWalletState, onConnectWalletShow, onConnectWalletHide } = useConnectWallet()
  const { count, isLoading, hasMore, next, transactions } = usePagedQueuedTransactions()

  const safeAddress = extractSafeAddress()
  const [openVotingModal, setOpenVotingModal] = useState<boolean>(false)
  const [openWarningPopup, setOpenWarningPopup] = useState<boolean>(false)
  const chainId = _getChainId()

  const [proposals, setProposals] = useState<IProposal[]>([])
  const [selectedProposal, setSelectedProposal] = useState<IProposal | undefined>(undefined)

  useEffect(() => {
    getProposals(getInternalChainId()).then((response) => {
      const { Data } = response
      if (Data?.proposals) {
        setProposals(Data.proposals)
        dispatch(
          addProposals({
            chainId,
            safeAddress,
            proposals: Data.proposals,
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
                    <Text size="lg" color="linkAura">
                      {row.title}
                    </Text>
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    <StatusCard status={row.status} showDot />
                  </StyledTableCell>
                  <StyledTableCell align="left">{formatDateTimeDivider(row.votingStart)}</StyledTableCell>
                  <StyledTableCell align="left">{formatDateTimeDivider(row.votingEnd)}</StyledTableCell>
                  <StyledTableCell align="left">
                    <div style={{ display: 'flex' }}>
                      {parseBalance(row.totalDeposit, chainInfo).amount}&ensp;
                      <Text size="lg" color="linkAura">
                        {parseBalance(row.totalDeposit, chainInfo).symbol}
                      </Text>
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
        You don't have the right to vote on this proposal because the voting period of this proposal started before you
        staked Aura.
      </WarningPopup>
      <ConnectWalletModal isOpen={connectWalletState.showConnect} onClose={onConnectWalletHide}></ConnectWalletModal>
    </>
  )
}

export default Voting
