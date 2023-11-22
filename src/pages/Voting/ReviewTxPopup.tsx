import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'
import FeeAndSequence from 'src/components/FeeAndSequence'
import Gap from 'src/components/Gap'
import { Popup } from 'src/components/Popup'
import Footer from 'src/components/Popup/Footer'
import Header from 'src/components/Popup/Header'
import { getChainDefaultGas, getChainDefaultGasPrice, getCoinDecimal, getNativeCurrency } from 'src/config'
import { MsgTypeUrl } from 'src/logic/providers/constants/constant'
import calculateGasFee from 'src/logic/providers/utils/fee'
import { extractSafeAddress } from 'src/routes/routes'
import { DEFAULT_GAS_LIMIT } from 'src/services/constant/common'
import { IProposal } from 'src/types/proposal'
import { formatWithSchema } from 'src/utils/date'
import { signAndCreateTransaction } from 'src/utils/signer'
import { ReviewTxPopupWrapper } from './styles'

const voteMapping = {
  ['YES']: 1,
  ['ABSTAIN']: 2,
  ['NO']: 3,
  ['NOWITHVETO']: 4,
}

type ReviewVotingTxProps = {
  open: boolean
  onClose: () => void
  onBack: () => void
  proposal?: IProposal
  vote: string
  gasUsed: string
}

const ReviewTxPopup = ({ open, onClose, proposal, vote, onBack, gasUsed }: ReviewVotingTxProps): React.ReactElement => {
  const dispatch = useDispatch()
  const safeAddress = extractSafeAddress()
  const nativeCurrency = getNativeCurrency()
  const chainDefaultGas = getChainDefaultGas()
  const chainDefaultGasPrice = getChainDefaultGasPrice()
  const decimal = getCoinDecimal()
  const [defaultGas, setDefaultGas] = useState(
    chainDefaultGas?.find((chain) => chain.typeUrl === MsgTypeUrl.Vote)?.gasAmount || DEFAULT_GAS_LIMIT.toString(),
  )
  const gasFee =
    defaultGas && chainDefaultGasPrice
      ? calculateGasFee(+defaultGas, +chainDefaultGasPrice, decimal)
      : chainDefaultGasPrice
  const [manualGasLimit, setManualGasLimit] = useState<string | undefined>(defaultGas)
  const [isDisabled, setDisabled] = useState(false)
  const [gasPriceFormatted, setGasPriceFormatted] = useState(gasFee)
  const [openGasInput, setOpenGasInput] = useState<boolean>(false)
  const [sequence, setSequence] = useState('0')
  useEffect(() => {
    if (gasUsed != '0') {
      setDefaultGas(gasUsed)
      setManualGasLimit(gasUsed)
      const gasFee =
        gasUsed && chainDefaultGasPrice
          ? calculateGasFee(+gasUsed, +chainDefaultGasPrice, decimal)
          : chainDefaultGasPrice
      setGasPriceFormatted(gasFee)
    }
  }, [gasUsed])
  const signTransaction = async (safeAddress: string) => {
    const votingTxParam = {
      option: voteMapping[vote.toUpperCase()],
      proposalId: proposal?.id,
    }
    const msgs: any[] = [
      {
        typeUrl: MsgTypeUrl.Vote,
        value: {
          option: votingTxParam?.option,
          proposalId: votingTxParam?.proposalId as any,
          voter: safeAddress,
        },
      },
    ]
    dispatch(
      signAndCreateTransaction(
        msgs,
        manualGasLimit || '250000',
        sequence,
        undefined,
        undefined,
        () => {
          setDisabled(true)
        },
        () => {
          setDisabled(false)
        },
        () => {
          setDisabled(false)
        },
      ),
    )
  }
  return (
    <Popup handleClose={onClose} open={open} title="Voting Popup">
      <Header onClose={onClose} title="Vote" />
      <ReviewTxPopupWrapper>
        <div className="tx-detail">
          <p className="proposal-title">{`Proposal #${proposal?.id} ${proposal?.title}`}</p>
          <div className="voting-detail">
            <p>Vote value</p>
            <p>{vote}</p>
          </div>
          <div className="voting-detail">
            <p>Execute before</p>
            <p>{proposal && formatWithSchema(new Date(proposal.votingEnd).getTime(), 'dd/MM/yyyy')}</p>
          </div>
        </div>

        <FeeAndSequence
          open={openGasInput}
          setOpen={setOpenGasInput}
          manualGasLimit={manualGasLimit}
          setManualGasLimit={setManualGasLimit}
          gasPriceFormatted={gasPriceFormatted}
          setGasPriceFormatted={setGasPriceFormatted}
          sequence={sequence}
          setSequence={setSequence}
        />
        <Gap height={24} />
        <div className="total-amount">
          <p className="title">Total Allocation Amount</p>
          <div className="amount">
            <img alt={'nativeCurrencyLogoUri'} height={25} src={nativeCurrency.logoUri} />
            <p>{`${gasPriceFormatted} ${nativeCurrency.symbol}`}</p>
          </div>
        </div>
        <div className="notice">
          You’re about to create a transaction and will have to confirm it with your currently connected wallet.
        </div>
      </ReviewTxPopupWrapper>
      <Footer>
        <OutlinedNeutralButton onClick={onBack}>Back</OutlinedNeutralButton>
        <FilledButton
          onClick={() => {
            signTransaction(safeAddress)
          }}
          disabled={isDisabled}
        >
          Submit
        </FilledButton>
      </Footer>
    </Popup>
  )
}

export default ReviewTxPopup
