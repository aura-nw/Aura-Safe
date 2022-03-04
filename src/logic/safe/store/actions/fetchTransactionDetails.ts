import { createAction } from 'redux-actions'

import { Dispatch } from 'src/logic/safe/store/actions/types'
import { Transaction } from 'src/logic/safe/store/models/types/gateway.d'
import { TransactionDetailsPayload } from 'src/logic/safe/store/reducer/gatewayTransactions'
import { getTransactionByAttribute } from 'src/logic/safe/store/selectors/gatewayTransactions'
import { AppReduxState } from 'src/store'
import { fetchSafeTransaction } from 'src/logic/safe/transactions/api/fetchSafeTransaction'
import { currentChainId } from 'src/logic/config/store/selectors'
import { extractSafeAddress } from 'src/routes/routes'
import { getTxDetailByHash } from 'src/services'
import { MESSAGES_CODE } from 'src/services/constant/message'
import { AddressEx, DetailedExecutionInfo, MultisigConfirmation, Operation, SafeAppInfo, TokenType, TransactionData, TransactionDetails, TransactionStatus, TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'

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

export const fetchTransactionDetailsByHash = ({ transactionId, txHash }: { transactionId: string, txHash?: string | null }) =>
  async (dispatch: Dispatch, getState: () => AppReduxState): Promise<Transaction['txDetails']> => {
    const transaction = getTransactionByAttribute(getState(), {
      attributeValue: transactionId,
      attributeName: 'id',
    })
    const safeAddress = extractSafeAddress()
    const chainId = currentChainId(getState())

    const txQuery = txHash || transactionId

    if (transaction?.txDetails || !safeAddress || !txQuery) {
      return
    }

    try {
      const { Data, ErrorCode } = await getTxDetailByHash(txQuery, safeAddress)

      if (ErrorCode !== MESSAGES_CODE.SUCCESSFUL.ErrorCode) {
        return
      }

      const direction: TransferDirection = Data?.Direction as TransferDirection || TransferDirection.UNKNOWN

      let safeAppInfo: SafeAppInfo | null = null;
      let detailedExecutionInfo: DetailedExecutionInfo & DetailedExecutionInfoExtended | null = null;
      let txData: TransactionData | null = null;

      if (direction == TransferDirection.OUTGOING) {
        safeAppInfo = {
          name: '',
          url: '',
          logoUri: '',
        }

        detailedExecutionInfo = {
          type: 'MULTISIG',
          submittedAt: new Date(Data.CreatedAt).getTime(),
          nonce: Data.Id,
          safeTxGas: (Data?.GasUsed || 0)?.toString(),
          baseGas: (Data?.GasWanted || 0)?.toString(),
          gasPrice: (Data?.GasPrice || 0)?.toString(),
          gasToken: Data.Denom,
          refundReceiver: {
            logoUri: null,
            name: null,
            value: '0000000000000000000000000000000000000000'
          },
          safeTxHash: safeAddress,
          executor: !Data.Executor[0] ? null : {
            logoUri: null,
            name: null,
            value: Data.Executor[0].ownerAddress
          },
          signers: Data.Signers.map(signer => ({
            logoUri: null,
            name: null,
            value: signer.OwnerAddress
          } as AddressEx)),
          confirmationsRequired: Data.ConfirmationsRequired,
          confirmations: Data.Confirmations.map(cf => ({
            signature: cf.signature,
            signer: {
              logoUri: null,
              name: null,
              value: cf.ownerAddress
            },
            submittedAt: new Date(cf.createdAt).getTime()
          } as MultisigConfirmation)),
          rejectors: null,
          gasTokenInfo: {
            address: '',
            decimals: 6,
            logoUri: 'https://safe-transaction-assets.staging.gnosisdev.com/chains/4/currency_logo.png',
            name: 'Aura',
            symbol: 'Aura'
          },
        }

        txData = {
          hexData: null,
          dataDecoded: null,
          to: {
            logoUri: null,
            name: null,
            value: Data.ToAddress
          },
          value: Data.Amount.toString(),
          operation: Operation.CALL,
          addressInfoIndex: null
        }
      }

      const transactionDetails: TransactionDetails = {
        txId: Data.Id.toString(),
        executedAt: Data.TxHash ? new Date(Data.UpdatedAt).getTime() : null,
        txStatus: (Data.Status == '0' ? TransactionStatus.SUCCESS : Data.Status) as TransactionStatus,
        txInfo: {
          type: 'Transfer',
          sender: {
            value: Data.FromAddress,
            name: null,
            logoUri: null,
          },
          recipient: {
            value: Data.ToAddress,
            name: null,
            logoUri: null,
          },
          direction,
          transferInfo: {
            type: TokenType.NATIVE_COIN,
            value: (Data.Amount).toString(),
          },
        },
        txHash: Data?.TxHash || null,
        safeAppInfo,
        detailedExecutionInfo,
        txData
      }

      dispatch(updateTransactionDetails({ chainId, transactionId: transactionDetails.txId, safeAddress, value: transactionDetails }))
    } catch (error) {
      console.error(`Failed to retrieve transaction details`, error.message)
    }
  }
