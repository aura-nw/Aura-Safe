import { Loader } from '@aura/safe-react-components'
import { makeStyles } from '@material-ui/core/styles'
import { Suspense, lazy, useEffect, useState } from 'react'

import Modal from 'src/components/Modal'
import { NFTToken } from 'src/logic/collectibles/sources/collectibles.d'
import { ReviewTxProp } from './screens/ReviewSendFundsTx'

const ChooseTxType = lazy(() => import('./screens/ChooseTxType'))

const SendFunds = lazy(() => import('./screens/SendFunds'))

const ReviewSendFundsTx = lazy(() => import('./screens/ReviewSendFundsTx'))

const useStyles = makeStyles({
  loaderStyle: {
    height: '500px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

type SendCollectibleTxInfo = {
  assetAddress: string
  assetName: string
  nftTokenId: string
  recipientAddress?: string
  recipientName?: string
  amount?: number
  gasLimit?: number
}

type TxType =
  | 'chooseTxType'
  | 'sendFunds'
  | 'sendFundsReviewTx'
  | 'contractInteraction'
  | 'contractInteractionReview'
  | 'reviewCustomTx'
  | 'sendCollectible'
  | 'reviewCollectible'
  | 'voting'
  | 'delegate'
  | 'redelegate'
  | 'claimReward'
  | ''

type Props = {
  activeScreenType: TxType
  isOpen: boolean
  onClose: () => void
  recipientAddress?: string
  recipientName?: string
  selectedToken?: string | NFTToken
  tokenAmount?: string
}

const SendModal = ({
  activeScreenType,
  isOpen,
  onClose,
  recipientAddress,
  recipientName,
  selectedToken,
  tokenAmount,
}: Props): React.ReactElement => {
  const classes = useStyles()
  const [activeScreen, setActiveScreen] = useState<TxType>(activeScreenType || 'chooseTxType')
  const [tx, setTx] = useState<unknown>({})

  const [recipient, setRecipient] = useState<string | undefined>(recipientAddress)

  useEffect(() => {
    setActiveScreen(activeScreenType || 'chooseTxType')
    setTx({})
    setRecipient(recipientAddress)
  }, [activeScreenType, isOpen, recipientAddress])

  const handleTxCreation = async (txInfo: SendCollectibleTxInfo) => {
    setActiveScreen('sendFundsReviewTx')
    setTx(txInfo)
  }

  const handleOnPrev = (screen: TxType) => {
    setRecipient((tx as ReviewTxProp).recipientAddress)
    setActiveScreen(screen)
  }

  return (
    <Modal
      description="Send Tokens Form"
      handleClose={onClose}
      open={isOpen}
      paperClassName="smaller-modal-window"
      title="Send Tokens"
    >
      <Suspense
        fallback={
          <div className={classes.loaderStyle}>
            <Loader size="md" />
          </div>
        }
      >
        {activeScreen === 'chooseTxType' && (
          <ChooseTxType
            onClose={onClose}
            recipientName={recipientName}
            recipientAddress={recipient}
            setActiveScreen={setActiveScreen}
          />
        )}

        {activeScreen === 'sendFunds' && (
          <SendFunds
            initialValues={tx as ReviewTxProp}
            onClose={onClose}
            onReview={handleTxCreation}
            recipientAddress={recipient}
            selectedToken={selectedToken as string}
            amount={tokenAmount}
          />
        )}

        {activeScreen === 'sendFundsReviewTx' && (
          <ReviewSendFundsTx
            onClose={onClose}
            onPrev={() => {
              handleOnPrev('sendFunds')
            }}
            tx={tx as ReviewTxProp}
          />
        )}
      </Suspense>
    </Modal>
  )
}

export default SendModal
