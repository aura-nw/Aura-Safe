import {
  AddressEx,
  TransactionInfo,
  Transfer,
  TokenType,
  TransactionDetails,
  MultisigExecutionDetails,
  MultisigExecutionInfo,
  TransactionListPage,
  TransferDirection,
  TransactionListItem,
  TransactionStatus,
  TransactionSummary,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { BigNumber } from 'bignumber.js'
import { now } from 'lodash'
import { matchPath } from 'react-router-dom'
import { getNativeCurrency } from 'src/config'
import { getNativeCurrencyAddress } from 'src/config/utils'

import {
  isCustomTxInfo,
  isModuleExecutionInfo,
  isMultiSigExecutionDetails,
  isTransferTxInfo,
  isTxQueued,
  LocalTransactionStatus,
  Transaction,
} from 'src/logic/safe/store/models/types/gateway.d'
import { formatAmount } from 'src/logic/tokens/utils/formatAmount'
import { sameAddress, ZERO_ADDRESS } from 'src/logic/wallets/ethAddresses'
import { SAFE_ROUTES, TRANSACTION_ID_SLUG, history, extractSafeAddress } from 'src/routes/routes'
import { ITransactionListItem, MTransactionListItem } from 'src/types/transaction'

export const NOT_AVAILABLE = 'n/a'

const inQueuedStatus = [
  TransactionStatus.PENDING,
  TransactionStatus.AWAITING_CONFIRMATIONS,
  TransactionStatus.AWAITING_EXECUTION,
]
interface AmountData {
  decimals?: number | string
  symbol?: string
  value: number | string
}

const getAmountWithSymbol = (
  { decimals = 0, symbol = NOT_AVAILABLE, value }: AmountData,
  formatted = false,
): string => {
  const nonFormattedValue = new BigNumber(value).times(`1e-${decimals}`).toFixed()
  const finalValue = formatted ? formatAmount(nonFormattedValue).toString() : nonFormattedValue
  const txAmount = finalValue === 'NaN' ? NOT_AVAILABLE : finalValue

  return `${txAmount} ${symbol}`
}

export const getTxAmount = (txInfo?: TransactionInfo, formatted = true): string => {
  if (!txInfo || !isTransferTxInfo(txInfo)) {
    return NOT_AVAILABLE
  }

  switch (txInfo.transferInfo.type) {
    case TokenType.ERC20:
      return getAmountWithSymbol(
        {
          decimals: `${txInfo.transferInfo.decimals ?? 0}`,
          symbol: `${txInfo.transferInfo.tokenSymbol ?? NOT_AVAILABLE}`,
          value: txInfo.transferInfo.value,
        },
        formatted,
      )
    case TokenType.ERC721:
      // simple workaround to avoid displaying unexpected values for incoming NFT transfer
      return `1 ${txInfo.transferInfo.tokenSymbol}`
    case TokenType.NATIVE_COIN: {
      const nativeCurrency = getNativeCurrency()
      return getAmountWithSymbol(
        {
          decimals: nativeCurrency.decimals,
          symbol: nativeCurrency.symbol,
          value: txInfo.transferInfo.value,
        },
        formatted,
      )
    }
    default:
      return NOT_AVAILABLE
  }
}

type txTokenData = {
  address: string
  value: string
  decimals: number | null
}

export const getTxTokenData = (txInfo: Transfer): txTokenData => {
  const nativeCurrency = getNativeCurrency()
  switch (txInfo.transferInfo.type) {
    case TokenType.ERC20:
      return {
        address: txInfo.transferInfo.tokenAddress,
        value: txInfo.transferInfo.value,
        decimals: txInfo.transferInfo.decimals,
      }
    case TokenType.ERC721:
      return { address: txInfo.transferInfo.tokenAddress, value: '1', decimals: 0 }
    default:
      return {
        address: getNativeCurrencyAddress(),
        value: txInfo.transferInfo.value,
        decimals: nativeCurrency.decimals,
      }
  }
}

export const isCancelTxDetails = (txInfo: Transaction['txInfo']): boolean =>
  // custom transaction
  isCustomTxInfo(txInfo) &&
  // flag-based identification
  txInfo.isCancellation

export const addressInList =
  (list: AddressEx[] = []) =>
  (address: string): boolean =>
    list.some((ownerAddress) => sameAddress(ownerAddress.value, address))

export const getTxTo = ({ txInfo }: Pick<Transaction, 'txInfo'>): AddressEx | undefined => {
  switch (txInfo.type) {
    case 'Transfer': {
      return txInfo.recipient
    }
    case 'SettingsChange': {
      return undefined
    }
    case 'Custom': {
      return txInfo.to
    }
    case 'Creation': {
      return txInfo.factory || undefined
    }
  }
}

// Our store does not match the details returned from the endpoint
export const makeTxFromDetails = (txDetails: TransactionDetails): Transaction => {
  const getMissingSigners = ({
    signers,
    confirmations,
  }: MultisigExecutionDetails): MultisigExecutionInfo['missingSigners'] => {
    const missingSigners = signers.filter(({ value }) => {
      const hasConfirmed = confirmations?.some(({ signer }) => signer?.value === value)
      return !hasConfirmed
    })

    return missingSigners.length ? missingSigners : null
  }

  const getMultisigExecutionInfo = ({
    detailedExecutionInfo,
  }: TransactionDetails): MultisigExecutionInfo | undefined => {
    if (!isMultiSigExecutionDetails(detailedExecutionInfo)) return undefined

    return {
      type: detailedExecutionInfo.type,
      nonce: detailedExecutionInfo.nonce,
      confirmationsRequired: detailedExecutionInfo.confirmationsRequired,
      confirmationsSubmitted: detailedExecutionInfo.confirmations?.length || 0,
      missingSigners: getMissingSigners(detailedExecutionInfo),
    }
  }

  const executionInfo: Transaction['executionInfo'] = isModuleExecutionInfo(txDetails.detailedExecutionInfo)
    ? txDetails.detailedExecutionInfo
    : getMultisigExecutionInfo(txDetails)

  // Will only be used as a fallback whilst waiting on backend tx creation cache
  const now = Date.now()
  const timestamp = isTxQueued(txDetails.txStatus)
    ? isMultiSigExecutionDetails(txDetails.detailedExecutionInfo)
      ? txDetails.detailedExecutionInfo.submittedAt
      : now
    : txDetails.executedAt || now

  const tx: Transaction = {
    id: txDetails.txId,
    timestamp,
    txStatus: txDetails.txStatus,
    txInfo: txDetails.txInfo,
    executionInfo,
    safeAppInfo: txDetails?.safeAppInfo || undefined,
    txDetails,
  }

  return tx
}

export const isDeeplinkedTx = (): boolean => {
  const txMatch = matchPath(history.location.pathname, {
    path: [SAFE_ROUTES.TRANSACTIONS_HISTORY, SAFE_ROUTES.TRANSACTIONS_QUEUE],
  })

  const deeplinkMatch = matchPath(history.location.pathname, {
    path: SAFE_ROUTES.TRANSACTIONS_SINGULAR,
  })

  return !txMatch && !!deeplinkMatch?.params?.[TRANSACTION_ID_SLUG]
}

export const isAwaitingExecution = (
  txStatus: typeof LocalTransactionStatus[keyof typeof LocalTransactionStatus],
): boolean => [LocalTransactionStatus.AWAITING_EXECUTION, LocalTransactionStatus.PENDING_FAILED].includes(txStatus)

export const makeTransactionDetail = (txDetail: any): any => {
  let confirmationList: Array<any> = []
  if (txDetail?.Confirmations && txDetail?.Confirmations.length > 0) {
    txDetail?.Confirmations.forEach((confirmationItem) => {
      const item = {
        signature: confirmationItem?.signature,
        signer: {
          value: confirmationItem?.ownerAddress,
        },
        submittedAt: new Date(confirmationItem?.updatedAt).getTime(),
      }
      confirmationList.push(item)
    })
  }

  let signerList: Array<any> = []
  if (txDetail?.Signers && txDetail?.Signers.length > 0) {
    txDetail?.Signers.forEach((signerItem) => {
      const item = {
        value: signerItem?.OwnerAddress,
      }
      signerList.push(item)
    })
  }

  return {
    executionInfo: {
      confirmationsRequired: txDetail?.ConfirmationsRequired,
      confirmationsSubmitted: 1,
      missingSigners: null,
      nonce: txDetail?.Id,
      type: 'MULTISIG',
    },
    id: txDetail?.Id?.toString(),
    safeAppInfo: undefined,
    timestamp: new Date(txDetail?.CreatedAt).getTime(),
    txDetails: {
      detailedExecutionInfo: {
        baseGas: txDetail?.GasWanted,
        confirmations: confirmationList,
        confirmationsRequired: txDetail?.ConfirmationsRequired,
        executor: null,
        gasPrice: txDetail?.GasPrice,
        gasToken: '',
        nonce: txDetail?.Id,
        refundReceiver: {
          value: '',
        },
        safeTxGas: txDetail?.GasUsed,
        safeTxHash: txDetail?.TxHash,
        signers: signerList,
        submittedAt: new Date(txDetail?.UpdatedAt).getTime(),
        type: 'MULTISIG',
      },
      executedAt: null,
      safeAddress: txDetail?.FromAddres,
      txData: {
        dataDecoded: null,
        hexData: null,
        operation: 0,
        to: {
          value: txDetail?.ToAddress,
        },
      },
      txHash: txDetail?.TxHash,
      txId: txDetail?.Id,
      txInfo: {
        direction: txDetail?.Direction,
        recipient: {
          value: txDetail?.ToAddress,
          name: '',
          logoUri: '',
        },
        sender: {
          value: txDetail?.FromAddres,
          name: '',
          logoUri: '',
        },
        transferInfo: {
          type: TokenType.NATIVE_COIN,
          value: txDetail?.Amount,
        },
        type: 'Transfer',
      },
    },
    txInfo: {
      direction: txDetail?.Direction,
      recipient: {
        value: txDetail?.ToAddress,
        name: '',
        logoUri: '',
      },
      sender: {
        value: txDetail?.FromAddres,
        name: '',
        logoUri: '',
      },
      transferInfo: {
        type: TokenType.NATIVE_COIN,
        value: txDetail?.Amount,
      },
      type: 'Transfer',
    },
    txStatus: txDetail.Status,
  }
}
export const makeHistoryTransactionsFromService = (list: ITransactionListItem[]): TransactionListPage => {
  const transaction: MTransactionListItem[] = makeTransactions(list).filter(
    ({ transaction }: any) => !inQueuedStatus.includes(transaction.txStatus),
  )
  let page: TransactionListPage = {
    results: [...transaction],
    next: undefined,
    previous: undefined
  }

  return page
}

export const makeQueueTransactionsFromService = (list: ITransactionListItem[]): TransactionListPage => {
  const transaction: MTransactionListItem[] = makeTransactions(list).filter(({ transaction }: any) =>
    inQueuedStatus.includes(transaction.txStatus),
  )
  let page: TransactionListPage = {
    results: [...transaction],
    next: undefined,
    previous: undefined
  }
  return page
}

const makeTransactions = (list: ITransactionListItem[]): MTransactionListItem[] =>
  list.map((tx: ITransactionListItem) => ({
    conflictType: 'None',
    type: 'TRANSACTION',
    transaction: {
      executionInfo: {
        confirmationsRequired: 0,
        confirmationsSubmitted: 0,
        nonce: tx.Id,
        type: 'MULTISIG',
        missingSigners: null,
      },
      id: tx.Id.toString(),
      txHash: tx.TxHash,
      timestamp: new Date(tx.UpdatedAt).getTime(),
      txStatus: (tx.Status == '0' ? TransactionStatus.SUCCESS : tx.Status) as TransactionStatus,
      txInfo: {
        type: 'Transfer',
        sender: {
          value: tx.FromAddress,
          name: null,
          logoUri: null,
        },
        recipient: {
          value: tx.ToAddress,
          name: null,
          logoUri: null,
        },
        direction: tx.Direction as TransferDirection,
        transferInfo: {
          type: TokenType.NATIVE_COIN,
          value: tx.Amount.toString(),
        },
      },
    },
  }))
