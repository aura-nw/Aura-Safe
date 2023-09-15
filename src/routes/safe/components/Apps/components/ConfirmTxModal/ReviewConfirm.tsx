import { Text } from '@aura/safe-react-components'
import { DecodedDataResponse, Operation } from '@gnosis.pm/safe-react-gateway-sdk'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { toBN } from 'web3-utils'

import { BasicTxInfo, DecodeTxs } from 'src/components/DecodeTxs'
import Divider from 'src/components/Divider'
import PrefixedEthHashInfo from 'src/components/PrefixedEthHashInfo'
import { ReviewInfoText } from 'src/components/ReviewInfoText'
import Block from 'src/components/layout/Block'
import Hairline from 'src/components/layout/Hairline'
import { getExplorerInfo, getNativeCurrency } from 'src/config'
import { getMultisendContractAddress } from 'src/logic/contracts/safeContracts'
import { EstimationStatus, useEstimateTransactionGas } from 'src/logic/hooks/useEstimateTransactionGas'
import { encodeMultiSendCall } from 'src/logic/safe/transactions/multisend'
import { fromTokenUnit } from 'src/logic/tokens/utils/humanReadableValue'
import { ModalHeader } from 'src/routes/safe/components/Balances/SendModal/screens/ModalHeader'
import { TxParameters } from 'src/routes/safe/container/hooks/useTransactionParameters'
import { lg, md } from 'src/theme/variables'
import { fetchTxDecoder } from 'src/utils/decodeTx'
import { EditableTxParameters } from 'src/utils/transactionHelpers/EditableTxParameters'
import { TxParametersDetail } from 'src/utils/transactionHelpers/TxParametersDetail'

import ExecuteCheckbox from 'src/components/ExecuteCheckbox'
import { grantedSelector } from 'src/utils/safeUtils/selector'
import { ConfirmTxModalProps, DecodedTxDetail } from '.'

const Container = styled.div`
  max-width: 480px;
  padding: ${md} ${lg} 0;
`

const DecodeTxsWrapper = styled.div`
  margin: 24px -24px;
`

const StyledBlock = styled(Block)`
  background-color: ${({ theme }) => theme.colors.separator};
  width: fit-content;
  padding: 5px 10px;
  border-radius: 3px;
  margin: 4px 0 0 40px;

  display: flex;

  > :nth-child(1) {
    margin-right: 5px;
  }
`

type Props = ConfirmTxModalProps & {
  onReject: () => void
  showDecodedTxData: (decodedTxDetails: DecodedTxDetail) => void
  hidden: boolean // used to prevent re-rendering the modal each time a tx is inspected
}

const parseTxValue = (value: string | number): string => {
  return toBN(value).toString()
}

export const ReviewConfirm = ({
  app,
  txs,
  safeAddress,
  nativeBalance,
  safeName,
  params,
  hidden,
  onUserConfirm,
  onClose,
  onReject,
  requestId,
  showDecodedTxData,
}: Props): ReactElement => {
  const isMultiSend = txs.length > 1
  const [decodedData, setDecodedData] = useState<DecodedDataResponse | null>(null)
  const dispatch = useDispatch()
  const nativeCurrency = getNativeCurrency()
  const explorerUrl = getExplorerInfo(safeAddress)
  const isOwner = useSelector(grantedSelector)

  const txRecipient: string | undefined = useMemo(
    () => (isMultiSend ? getMultisendContractAddress() : txs[0]?.to),
    [txs, isMultiSend],
  )
  const txData: string | undefined = useMemo(
    () => (isMultiSend ? encodeMultiSendCall(txs) : txs[0]?.data),
    [txs, isMultiSend],
  )
  const txValue: string | undefined = useMemo(
    () => (isMultiSend ? '0' : parseTxValue(txs[0]?.value)),
    [txs, isMultiSend],
  )
  const operation = useMemo(() => (isMultiSend ? Operation.DELEGATE : Operation.CALL), [isMultiSend])
  const [manualSafeTxGas, setManualSafeTxGas] = useState('0')
  const [manualGasPrice, setManualGasPrice] = useState<string | undefined>()
  const [manualGasLimit, setManualGasLimit] = useState<string | undefined>()

  const {
    gasLimit,
    gasPriceFormatted,
    gasEstimation,
    isOffChainSignature,
    isCreation,
    isExecution,
    gasCostFormatted,
    txEstimationExecutionStatus,
  } = useEstimateTransactionGas({
    txData: txData || '',
    txRecipient,
    operation,
    txAmount: txValue,
    safeTxGas: manualSafeTxGas,
    manualGasPrice,
    manualGasLimit,
  })

  const [executionApproved, setExecutionApproved] = useState<boolean>(true)
  const doExecute = isExecution && executionApproved

  // Decode tx data.
  useEffect(() => {
    const decodeTxData = async () => {
      const res = await fetchTxDecoder(txData)
      setDecodedData(res)
    }

    decodeTxData()
  }, [txData])

  const closeEditModalCallback = (txParameters: TxParameters) => {
    const oldGasPrice = gasPriceFormatted
    const newGasPrice = txParameters.ethGasPrice
    const oldSafeTxGas = gasEstimation
    const newSafeTxGas = txParameters.safeTxGas

    if (newGasPrice && oldGasPrice !== newGasPrice) {
      setManualGasPrice(txParameters.ethGasPrice)
    }

    if (txParameters.ethGasLimit && gasLimit !== txParameters.ethGasLimit) {
      setManualGasLimit(txParameters.ethGasLimit)
    }

    if (newSafeTxGas && oldSafeTxGas !== newSafeTxGas) {
      setManualSafeTxGas(newSafeTxGas)
    }
  }

  return (
    <EditableTxParameters
      ethGasLimit={gasLimit}
      ethGasPrice={gasPriceFormatted}
      safeTxGas={Math.max(parseInt(gasEstimation), params?.safeTxGas || 0).toString()}
      closeEditModalCallback={closeEditModalCallback}
      isOffChainSignature={isOffChainSignature}
      isExecution={doExecute}
    >
      {(txParameters, toggleEditMode) => (
        <div hidden={hidden}>
          <ModalHeader title={app.name} iconUrl={app.iconUrl} onClose={onReject} />

          <Hairline />

          <Container>
            {/* Safe */}
            <PrefixedEthHashInfo name={safeName} hash={safeAddress} showAvatar showCopyBtn explorerUrl={explorerUrl} />
            <StyledBlock>
              <Text size="md">Balance:</Text>
              <Text size="md" strong>{`${nativeBalance} ${nativeCurrency.symbol}`}</Text>
            </StyledBlock>

            <Divider withArrow />

            {/* Txs decoded */}
            <BasicTxInfo
              txRecipient={txRecipient}
              txData={txData}
              txValue={fromTokenUnit(txValue, nativeCurrency.decimals)}
            />

            <DecodeTxsWrapper>
              <DecodeTxs txs={txs} decodedData={decodedData} onTxItemClick={showDecodedTxData} />
            </DecodeTxsWrapper>

            {!isMultiSend && <Divider />}

            {isExecution && <ExecuteCheckbox onChange={setExecutionApproved} />}

            {/* Tx Parameters */}
            <TxParametersDetail
              txParameters={txParameters}
              onEdit={toggleEditMode}
              isTransactionCreation={isCreation}
              isTransactionExecution={doExecute}
              isOffChainSignature={isOffChainSignature}
            />
          </Container>

          {/* Gas info */}
          {txEstimationExecutionStatus === EstimationStatus.LOADING ? null : (
            <ReviewInfoText
              gasCostFormatted={isOwner ? gasCostFormatted : undefined}
              isCreation={isCreation}
              isExecution={doExecute}
              isOffChainSignature={isOffChainSignature}
              safeNonce={txParameters.safeNonce}
              txEstimationExecutionStatus={txEstimationExecutionStatus}
            />
          )}
        </div>
      )}
    </EditableTxParameters>
  )
}
