import { EstimationStatus } from 'src/logic/hooks/useEstimateTransactionGas'
import Paragraph from 'src/components/layout/Paragraph'
import { TransactionFailText } from 'src/components/TransactionFailText'
import styled from 'styled-components'

const StyledText = styled.span`
  color: #98989b !important;
`

type TransactionFailTextProps = {
  txEstimationExecutionStatus: EstimationStatus
  gasCostFormatted?: string
  isExecution: boolean
  isCreation: boolean
  isOffChainSignature: boolean
}

export const TransactionFees = ({
  gasCostFormatted,
  isExecution,
  // isCreation,
  isOffChainSignature,
  txEstimationExecutionStatus,
}: TransactionFailTextProps): React.ReactElement | null => {
  // const nativeCurrency = getNativeCurrency()
  // let transactionAction
  if (txEstimationExecutionStatus === EstimationStatus.LOADING) {
    return null
  }
  // if (isCreation) {
  //   transactionAction = 'create'
  // } else if (isExecution) {
  //   transactionAction = 'execute'
  // } else {
  //   transactionAction = 'approve'
  // }

  return (
    <>
      {gasCostFormatted != null &&
        (isExecution ? (
          <Paragraph color="white" align="center">
            You&apos;re about to execute a transaction and will have to confirm it with your currently connected wallet.
            {!isOffChainSignature && (
              <>
                Make sure you have enough funds in this safe to fund the associated transaction amount and fee.
                <StyledText> {/* {gasCostFormatted} {nativeCurrency.symbol}{' '} */}</StyledText>
              </>
            )}
          </Paragraph>
        ) : (
          <Paragraph color="white" align="center">
            You&apos;re about to confirm a transaction and will have to sign it using your currently connected wallet.
          </Paragraph>
        ))}
      <TransactionFailText txEstimationExecutionStatus={txEstimationExecutionStatus} isExecution={isExecution} />
    </>
  )
}
