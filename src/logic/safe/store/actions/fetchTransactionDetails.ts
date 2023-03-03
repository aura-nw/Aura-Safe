import { createAction } from 'redux-actions'

import { AddressEx, MultisigConfirmation, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'
import { getInternalChainId } from 'src/config'
import { currentChainId } from 'src/logic/config/store/selectors'
import { Dispatch } from 'src/logic/safe/store/actions/types'
import { Transaction } from 'src/logic/safe/store/models/types/gateway.d'
import { TransactionDetailsPayload } from 'src/logic/safe/store/reducer/gatewayTransactions'
import { getTransactionByAttribute } from 'src/logic/safe/store/selectors/gatewayTransactions'
import { fetchSafeTransaction } from 'src/logic/safe/transactions/api/fetchSafeTransaction'
import { extractSafeAddress } from 'src/routes/routes'
import { getProposalDetail, getTxDetailById } from 'src/services'
import { MESSAGES_CODE } from 'src/services/constant/message'
import { AppReduxState } from 'src/store'

export const UPDATE_TRANSACTION_DETAILS = 'UPDATE_TRANSACTION_DETAILS'
const updateTransactionDetails = createAction<TransactionDetailsPayload>(UPDATE_TRANSACTION_DETAILS)

export const fetchTransactionDetails =
  ({ transactionId }: { transactionId: Transaction['id'] }) =>
  async (dispatch: Dispatch, getState: () => AppReduxState): Promise<Transaction['txDetails']> => {
    const transaction = getTransactionByAttribute(getState(), {
      attributeValue: transactionId,
      attributeName: 'id',
    })
    const safeAddress = extractSafeAddress()
    const chainId = currentChainId(getState())

    if (transaction?.txDetails || !safeAddress) {
      return
    }

    try {
      const transactionDetails = await fetchSafeTransaction(transactionId)

      dispatch(updateTransactionDetails({ chainId, transactionId, safeAddress, value: transactionDetails }))
    } catch (error) {
      console.error(`Failed to retrieve transaction ${transactionId} details`, error.message)
    }
  }

type DetailedExecutionInfoExtended = {
  gasPrice: string
}

export const fetchTransactionDetailsById =
  ({ transactionId, auraTxId }: { transactionId?: string; auraTxId?: string }) =>
  async (dispatch: Dispatch, getState: () => AppReduxState): Promise<Transaction['txDetails']> => {
    const transaction = getTransactionByAttribute(getState(), {
      attributeValue: transactionId,
      attributeName: 'id',
    })
    const safeAddress = extractSafeAddress()
    const chainId = currentChainId(getState())
    const internalChainId = getInternalChainId()
    if (transaction?.txDetails || !safeAddress) {
      return
    }

    try {
      const { Data, ErrorCode } = await getTxDetailById(safeAddress, transactionId, auraTxId)
      if (ErrorCode !== MESSAGES_CODE.SUCCESSFUL.ErrorCode) {
        return
      }
      let extraDetails: any = {}

      if (Data?.Messages?.[0]?.proposalId) {
        const respone = await getProposalDetail(internalChainId, Data?.Messages?.[0]?.proposalId)
        if (respone.Data) {
          const proposalDetail = {
            id: respone.Data.id,
            title: respone.Data.title,
            status: respone.Data.status,
            votingEnd: respone.Data.votingEnd,
          }
          extraDetails.proposalDetail = proposalDetail
        }
      }

      const transactionDetails: any = {
        txId: Data?.MultisigTxId?.toString() || null,
        auraTxId: Data?.AuraTxId?.toString() || null,
        executedAt: Data.Timestamp
          ? new Date(Data.Timestamp).getTime()
          : Data.Executor
          ? new Date(Data.Executor.updatedAt).getTime()
          : null,
        createAt: Data.CreatedAt ? new Date(Data.CreatedAt).getTime() : null,
        txStatus: (Data.Status == '0' ? TransactionStatus.SUCCESS : Data.Status) as TransactionStatus,
        txMessage: Data?.Messages?.length ? Data?.Messages : [],
        fee: Data?.Fee?.toString() || 0,
        gas: Data?.Gas?.toString() || 0,
        txHash: Data?.TxHash || null,
        confirmationsRequired: Data.ConfirmationsRequired,
        confirmations: Data?.Confirmations?.map(
          (cf) =>
            ({
              signature: cf.signature,
              signer: {
                logoUri: null,
                name: null,
                value: cf.ownerAddress,
              },
              submittedAt: new Date(cf.createdAt).getTime(),
            } as MultisigConfirmation),
        ),
        executor: !Data?.Executor
          ? null
          : {
              logoUri: null,
              name: null,
              value: Data.Executor.ownerAddress,
            },
        rejectors: Data?.Rejectors?.map((re) => ({ logoUri: null, name: null, value: re.ownerAddress } as AddressEx)),
        extraDetails,
        autoClaimAmount: Data?.AutoClaimAmount,
        sequence: Data?.Sequence,
      }

      dispatch(
        updateTransactionDetails({
          chainId,
          transactionId: transactionDetails.txId,
          safeAddress,
          value: transactionDetails,
        }),
      )
    } catch (error) {
      console.error(`Failed to retrieve transaction details`, error.message)
    }
  }
