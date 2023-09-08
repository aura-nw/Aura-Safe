import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { Record, RecordOf } from 'immutable'
import { ChainId } from 'src/config/chain.d'

import { BalanceRecord } from 'src/logic/tokens/store/actions/fetchSafeTokens'

type SafeOwner = string

export type ModulePair = [
  // previous module
  string,
  // module
  string,
]

export type SpendingLimit = {
  delegate: string
  token: string
  amount: string
  spent: string
  resetTimeMin: string
  lastResetMin: string
  nonce: string
}

export type SafeRecordProps = {
  address: string
  chainId?: ChainId
  safeId?: number
  threshold: number
  nativeBalance: string
  totalFiatBalance: string
  owners: SafeOwner[]
  modules?: ModulePair[] | null
  spendingLimits?: SpendingLimit[] | null
  balances: any[]
  nonce: number
  recurringUser?: boolean
  currentVersion: string
  needsUpdate: boolean
  featuresEnabled: FEATURES[]
  loadedViaUrl: boolean
  guard: string
  collectiblesTag: string
  txQueuedTag: string
  txHistoryTag: string
  nextQueueSeq: string
  sequence: string
  coinConfig?: any[]
  isHideZeroBalance?: boolean,
  isSafeLoaded?: boolean
}

/**
 * Create a safe record defaulting to these values
 */
const makeSafe = Record<SafeRecordProps>({
  address: '',
  chainId: undefined,
  safeId: undefined,
  threshold: 0,
  nativeBalance: '0',
  totalFiatBalance: '0',
  owners: [],
  modules: [],
  spendingLimits: [],
  balances: [],
  nonce: 0,
  recurringUser: undefined,
  currentVersion: '',
  needsUpdate: false,
  featuresEnabled: [],
  loadedViaUrl: true,
  guard: '',
  collectiblesTag: '0',
  txQueuedTag: '0',
  txHistoryTag: '0',
  nextQueueSeq: '1',
  sequence: '1',
  coinConfig: [],
  isHideZeroBalance: true,
  isSafeLoaded: undefined,
})

export type SafeRecord = RecordOf<SafeRecordProps>

export default makeSafe
