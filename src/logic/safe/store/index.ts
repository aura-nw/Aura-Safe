import { applyMiddleware, CombinedState, combineReducers, compose, createStore } from 'redux'
import { load, LoadOptions, RLSOptions, save } from 'redux-localstorage-simple'
import thunk from 'redux-thunk'
import { ValidatorStateType } from '../../validator/store/reducer/index'

import { addressBookMiddleware } from 'src/logic/addressBook/store/middleware'
import addressBookReducer, { ADDRESS_BOOK_REDUCER_ID } from 'src/logic/addressBook/store/reducer'
import {
  NFT_ASSETS_REDUCER_ID,
  NFT_TOKENS_REDUCER_ID,
  nftAssetReducer,
  nftTokensReducer,
} from 'src/logic/collectibles/store/reducer/collectibles'
import cookiesReducer, { COOKIES_REDUCER_ID } from 'src/logic/cookies/store/reducer/cookies'
import currentSessionReducer, {
  CURRENT_SESSION_REDUCER_ID,
  CurrentSessionState,
} from 'src/logic/currentSession/store/reducer/currentSession'
import notificationsReducer, { NOTIFICATIONS_REDUCER_ID } from 'src/logic/notifications/store/reducer/notifications'
import { safeStorageMiddleware } from 'src/logic/safe/store/middleware/safeStorage'
import gatewayTransactionsReducer, {
  GATEWAY_TRANSACTIONS_ID,
  GatewayTransactionsState,
} from 'src/logic/safe/store/reducer/gatewayTransactions'
import localTransactionsReducer, {
  LOCAL_TRANSACTIONS_ID,
  LocalStatusesState,
} from 'src/logic/safe/store/reducer/localTransactions'
import safeReducer, { SAFE_REDUCER_ID } from 'src/logic/safe/store/reducer/safe'
import tokensReducer, { TOKEN_REDUCER_ID, TokenState } from 'src/logic/tokens/store/reducer/tokens'
import providerReducer, { PROVIDER_REDUCER_ID, ProviderState } from 'src/logic/wallets/store/reducer/provider'

import currencyValuesReducer, {
  CURRENCY_REDUCER_ID,
  CurrencyValuesState,
  initialCurrencyState,
} from 'src/logic/currencyValues/store/reducer/currencyValues'

import termReducer, { TERM_ID, TermState } from 'src/logic/checkTerm/store/reducer/term'

import { AddressBookState } from 'src/logic/addressBook/model/addressBook'

import { NFTAssets, NFTTokens } from 'src/logic/collectibles/sources/collectibles'
import { configMiddleware } from 'src/logic/config/store/middleware'
import configReducer, { CONFIG_REDUCER_ID, initialConfigState } from 'src/logic/config/store/reducer'
import { ConfigState } from 'src/logic/config/store/reducer/reducer'
import delegationReducer, { DELEGATION_REDUCER_ID, DelegationStateType } from 'src/logic/delegation/store/reducer'
import { PROPOSALS_REDUCER_ID, proposalsReducer } from 'src/logic/proposal/store/reducer/proposals'
import { localTransactionsMiddleware } from 'src/logic/safe/store/middleware/localTransactionsMiddleware'
import { SafeReducerMap } from 'src/logic/safe/store/reducer/types/safe'
import validatorReducer, { VALIDATOR_REDUCER_ID } from 'src/logic/validator/store/reducer'
import { IProposal } from 'src/types/proposal'
import { LS_NAMESPACE, LS_SEPARATOR } from 'src/utils/constants'
import fundsReducer, { FUNDS_REDUCER_ID } from 'src/logic/contracts/store/reducer'
import { IFund } from 'src/components/JsonschemaForm/FundForm'

const CURRENCY_KEY = `${CURRENCY_REDUCER_ID}.selectedCurrency`

const LS_CONFIG: RLSOptions | LoadOptions = {
  states: [ADDRESS_BOOK_REDUCER_ID, CURRENCY_KEY, CONFIG_REDUCER_ID, TERM_ID],
  namespace: LS_NAMESPACE,
  namespaceSeparator: LS_SEPARATOR,
  disableWarnings: true,
  preloadedState: {
    [CURRENCY_REDUCER_ID]: initialCurrencyState,
    [CONFIG_REDUCER_ID]: initialConfigState,
  },
}

const composeEnhancers =
  (((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as typeof compose) &&
    ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as any)({ trace: true, traceLimit: 25 })) ||
  compose
const enhancer = composeEnhancers(
  applyMiddleware(
    thunk,
    save(LS_CONFIG),
    safeStorageMiddleware,
    // providerWatcher,
    addressBookMiddleware,
    configMiddleware,
    localTransactionsMiddleware,
  ),
)

const reducers = {
  [PROVIDER_REDUCER_ID]: providerReducer,
  [SAFE_REDUCER_ID]: safeReducer,
  [NFT_ASSETS_REDUCER_ID]: nftAssetReducer,
  [NFT_TOKENS_REDUCER_ID]: nftTokensReducer,
  [TOKEN_REDUCER_ID]: tokensReducer,
  [GATEWAY_TRANSACTIONS_ID]: gatewayTransactionsReducer,
  [LOCAL_TRANSACTIONS_ID]: localTransactionsReducer,
  [NOTIFICATIONS_REDUCER_ID]: notificationsReducer,
  [CURRENCY_REDUCER_ID]: currencyValuesReducer,
  [COOKIES_REDUCER_ID]: cookiesReducer,
  [ADDRESS_BOOK_REDUCER_ID]: addressBookReducer,
  [CURRENT_SESSION_REDUCER_ID]: currentSessionReducer,
  [CONFIG_REDUCER_ID]: configReducer,
  [TERM_ID]: termReducer,
  [PROPOSALS_REDUCER_ID]: proposalsReducer,
  [VALIDATOR_REDUCER_ID]: validatorReducer,
  [DELEGATION_REDUCER_ID]: delegationReducer,
  [FUNDS_REDUCER_ID]: fundsReducer,
}

const rootReducer = combineReducers(reducers)

// There is a circular dep that prevents using:
// ReturnType<typeof store.getState>
// or https://dev.to/svehla/typescript-100-type-safe-react-redux-under-20-lines-4h8n
export type AppReduxState = CombinedState<{
  [PROVIDER_REDUCER_ID]: ProviderState
  [SAFE_REDUCER_ID]: SafeReducerMap
  [NFT_ASSETS_REDUCER_ID]: NFTAssets
  [NFT_TOKENS_REDUCER_ID]: NFTTokens
  [TOKEN_REDUCER_ID]: TokenState
  [GATEWAY_TRANSACTIONS_ID]: GatewayTransactionsState
  [LOCAL_TRANSACTIONS_ID]: LocalStatusesState
  [NOTIFICATIONS_REDUCER_ID]: Map<string, Notification>
  [CURRENCY_REDUCER_ID]: CurrencyValuesState
  [COOKIES_REDUCER_ID]: Map<string, any>
  [ADDRESS_BOOK_REDUCER_ID]: AddressBookState
  [CURRENT_SESSION_REDUCER_ID]: CurrentSessionState
  [CONFIG_REDUCER_ID]: ConfigState
  [TERM_ID]: TermState
  [PROPOSALS_REDUCER_ID]: IProposal[]
  [VALIDATOR_REDUCER_ID]: ValidatorStateType
  [DELEGATION_REDUCER_ID]: DelegationStateType
  [FUNDS_REDUCER_ID]: IFund[]
}>

export const store: any = createStore(rootReducer, load(LS_CONFIG), enhancer)
