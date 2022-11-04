import { TransactionSummary, Transfer } from '@gnosis.pm/safe-react-gateway-sdk'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import { Action, handleActions } from 'redux-actions'

import { UPDATE_TRANSACTION_DETAILS } from 'src/logic/safe/store/actions/fetchTransactionDetails'
import {
  ADD_HISTORY_TRANSACTIONS,
  ADD_QUEUED_TRANSACTIONS,
} from 'src/logic/safe/store/actions/transactions/gatewayTransactions'
import {
  HistoryGatewayResponse,
  isConflictHeader,
  isDateLabel,
  isLabel,
  isMultisigExecutionInfo,
  isTransactionSummary,
  QueuedGatewayResponse,
  StoreStructure,
  Transaction,
} from 'src/logic/safe/store/models/types/gateway.d'

import { ChainId } from 'src/config/chain.d'
import { getLocalStartOfDate } from 'src/utils/date'
import { sortObject } from 'src/utils/objects'
import { sameString } from 'src/utils/strings'

export const GATEWAY_TRANSACTIONS_ID = 'gatewayTransactions'

export type GatewayTransactionsState = Record<ChainId, Record<string, StoreStructure>>

type BasePayload = { chainId: string; safeAddress: string; isTail?: boolean }

export type HistoryPayload = BasePayload & { values: HistoryGatewayResponse['results'] }

export type QueuedPayload = BasePayload & { values: QueuedGatewayResponse['results'] }

export type TransactionDetailsPayload = {
  chainId: string
  safeAddress: string
  transactionId: string
  value: Transaction['txDetails']
}

type Payload = HistoryPayload | QueuedPayload | TransactionDetailsPayload

export const gatewayTransactionsReducer = handleActions<GatewayTransactionsState, Payload>(
  {
    [ADD_HISTORY_TRANSACTIONS]: (state, action: Action<HistoryPayload>) => {
      const { chainId, safeAddress, values, isTail = false } = action.payload
      const newHistory: StoreStructure['history'] = cloneDeep(state[chainId]?.[safeAddress]?.history || {})

      values.forEach((value) => {
        if (isDateLabel(value)) {
          // DATE_LABEL is discarded as it's not needed for the current implementation
          return
        }

        if (isTransactionSummary(value)) {
          const transaction = (value as any).transaction as TransactionSummary
          const startOfDate = getLocalStartOfDate(transaction.timestamp)

          if (typeof newHistory[startOfDate] === 'undefined') {
            newHistory[startOfDate] = []
          }

          const txExist = newHistory[startOfDate].some(({ id }) => sameString(id, transaction.id))

          if (!txExist) {
            newHistory[startOfDate].push(transaction)
            // pushing a newer transaction to the existing list messes the transactions order
            // this happens when most recent transactions are added to the existing txs in the store
            newHistory[startOfDate] = newHistory[startOfDate].sort((a, b) => b.timestamp - a.timestamp)
          }
          return
        }
      })

      return {
        // all the safes with their respective states
        ...state,
        // current safe
        [chainId]: {
          [safeAddress]: {
            // keep queued list
            ...state[chainId]?.[safeAddress],
            // extend history list
            history: isTail ? newHistory : sortObject(newHistory, 'desc'),
          },
        },
      }
    },
    [ADD_QUEUED_TRANSACTIONS]: (state, action: Action<QueuedPayload>) => {
      const { chainId, safeAddress, values } = action.payload
      // let prevQueueds: StoreStructure['queued'] = cloneDeep(state[chainId]?.[safeAddress]?.queued || {})

      // let newQueueds: StoreStructure['queued']

      // if (!prevQueueds['txs']) {
      //   prevQueueds['txs'] = {}
      // }

      // let prevTxs = prevQueueds['txs']

      let newNext = {}
      let newQueued = {}
      let txs: { [nonce: number]: Transaction[] } = []

      let label: 'next' | 'queued' | undefined

      values.forEach((value) => {
        if (isLabel(value)) {
          // we're assuming that the first page will always provide `next` and `queued` labels
          label = value.label.toLowerCase() as 'next' | 'queued'
          return
        }

        if (
          // Conflict headers are not needed in the current implementation
          isConflictHeader(value) ||
          !isMultisigExecutionInfo(value.transaction.executionInfo)
        ) {
          return
        }

        const txNonce = value.transaction.executionInfo?.nonce

        if (txNonce === undefined) {
          console.warn('A transaction without nonce was provided by client-gateway:', JSON.stringify(value))
          return
        }

        if (!label) {
          const oldNext = state[chainId]?.[safeAddress]?.queued?.next
          label = oldNext?.[txNonce] ? 'next' : 'queued'
        }

        const newTx = value.transaction

        // if (prevTxs[txNonce]) {
        //   prevTxs[txNonce] = [{ ...prevTxs[txNonce], ...newTx }]
        // } else {
        //   prevTxs = {
        //     ...prevTxs,
        //     [txNonce]: [newTx],
        //   }
        // }

        if (txs?.[txNonce]) {
          txs[txNonce] = [...txs[txNonce], newTx]
        } else {
          txs = { ...txs, [txNonce]: [newTx] }
        }

        if (label === 'queued') {
          if (newQueued?.[txNonce]) {
            newQueued[txNonce] = [...newQueued[txNonce], newTx]
          } else {
            newQueued = { ...newQueued, [txNonce]: [newTx] }
          }
        } else {
          if (newNext?.[txNonce]) {
            newNext[txNonce] = [...newNext[txNonce], newTx]
          } else {
            newNext = { [txNonce]: [newTx] }
          }
        }
      })

      // No new txs, empty queue list, cleanup
      if (!values.length && !Object.keys(newQueued).length && Object.keys(newNext).length === 1) {
        newNext = {}
      }

      return {
        // all the safes with their respective states
        ...state,
        [chainId]: {
          // current safe
          [safeAddress]: {
            // keep history list
            ...state[chainId]?.[safeAddress],
            // overwrites queued lists
            queued: {
              next: newNext,
              queued: newQueued,
              txs,
            },
          },
        },
      }
    },
    [UPDATE_TRANSACTION_DETAILS]: (state, action: Action<TransactionDetailsPayload>) => {
      const { chainId, safeAddress, transactionId, value } = action.payload
      const clonedStoredTxs = cloneDeep(state[chainId]?.[safeAddress])
      const { queued: newQueued, history: newHistory } = clonedStoredTxs

      // get the tx group (it will be `queued.next`, `queued.queued` or `history`)
      txLocationLoop: for (const txLocation of ['queued.txs', 'history']) {
        const txGroup: StoreStructure['queued']['txs'] | StoreStructure['history'] = get(clonedStoredTxs, txLocation)

        if (!txGroup) {
          continue
        }

        for (const [timestamp, transactions] of Object.entries(txGroup)) {
          const txIndex = transactions.findIndex(({ txHash, id, txInfo }) => {
            const isSameTxHas = sameString(txHash, value?.txHash || undefined)

            const isSameId = sameString(id, transactionId)

            return isSameTxHas || isSameId

            // return sameString(txHash, value?.txHash || undefined) || sameString(id, transactionId)
          })

          if (txIndex !== -1) {
            txGroup[timestamp][txIndex]['txDetails'] = value
            break txLocationLoop
          }
        }
      }

      // update state
      return {
        // all the safes with their respective states
        ...state,
        [chainId]: {
          // current safe
          [safeAddress]: {
            history: newHistory,
            queued: newQueued,
          },
        },
      }
    },
  },
  {},
)

export default gatewayTransactionsReducer
