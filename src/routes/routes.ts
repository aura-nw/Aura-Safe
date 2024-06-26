import { createBrowserHistory } from 'history'
import { generatePath, matchPath } from 'react-router-dom'

import { getChains } from 'src/config/cache/chains'
import { ChainId, ShortName } from 'src/config/chain.d'
import { PUBLIC_URL } from 'src/utils/constants'
import { parsePrefixedAddress } from 'src/utils/prefixedAddress'

export const history = createBrowserHistory({
  basename: PUBLIC_URL,
})
//  8E906198720BB3EE6813FAD4BADDF15AF5E24E2171339D9D8C041D44C67C75DA
// Safe specific routes
// const hashRegExp = '0x[0-9A-Fa-f]'
const hashRegExp = '[0-9A-Za-z]'
const singularExp = '([0-9a-zA-Z]{64,}|[0-9]+)'

// const chainSpecificSafeAddressPathRegExp = `[a-z0-9-]{2,}:${hashRegExp}{40}`
const chainSpecificSafeAddressPathRegExp = `[a-z0-9-]{1,}:[a-z]+${hashRegExp}{39,40}`

export const SAFE_ADDRESS_SLUG = 'prefixedSafeAddress'
export const ADDRESSED_ROUTE = `/:${SAFE_ADDRESS_SLUG}(${chainSpecificSafeAddressPathRegExp})`
// Safe section routes, i.e. /:prefixedSafeAddress/settings
const SAFE_SECTION_SLUG = 'safeSection'
const SAFE_SECTION_ROUTE = `${ADDRESSED_ROUTE}/:${SAFE_SECTION_SLUG}`

// Safe section routes, i.e. /:prefixedSafeAddress/settings
const VOTING_SECTION_SLUG = 'proposalId'

// Safe subsection routes, i.e. /:prefixedSafeAddress/settings/advanced
const SAFE_SUBSECTION_SLUG = 'safeSubsection'
export const SAFE_SUBSECTION_ROUTE = `${SAFE_SECTION_ROUTE}/:${SAFE_SUBSECTION_SLUG}`

export const TRANSACTION_ID_SLUG = `safeTxHash`
const TRANSACTION_ID_NUMBER = `id`
const VOTING_ID_NUMBER = `proposalId`

// URL: gnosis-safe.io/app/:[SAFE_ADDRESS_SLUG]/:[SAFE_SECTION_SLUG]/:[SAFE_SUBSECTION_SLUG]
export type SafeRouteSlugs = {
  [SAFE_ADDRESS_SLUG]?: string
  [SAFE_SECTION_SLUG]?: string
  [SAFE_SUBSECTION_SLUG]?: string
  [TRANSACTION_ID_SLUG]?: string
  [TRANSACTION_ID_NUMBER]?: string
  [VOTING_ID_NUMBER]?: string
}

export const LOAD_SPECIFIC_SAFE_ROUTE = `/load/:${SAFE_ADDRESS_SLUG}?` // ? = optional slug
export const ALLOW_SPECIFIC_SAFE_ROUTE = `/allow/:${SAFE_ADDRESS_SLUG}?` // ? = optional slug
export const CANCEL_SPECIFIC_SAFE_ROUTE = `/cancel/:${SAFE_ADDRESS_SLUG}?` // ? = optional slug

// Routes independant of safe/network
export const ROOT_ROUTE = '/'
export const WELCOME_ROUTE = '/welcome'
export const OPEN_SAFE_ROUTE = '/open'
export const LOAD_SAFE_ROUTE = generatePath(LOAD_SPECIFIC_SAFE_ROUTE) // By providing no slug, we get '/load'
export const ALLOW_SAFE_ROUTE = generatePath(ALLOW_SPECIFIC_SAFE_ROUTE) // By providing no slug, we get '/allow'
export const CANCEL_SAFE_ROUTE = generatePath(CANCEL_SPECIFIC_SAFE_ROUTE) // By providing no slug, we get '/allow'

// [SAFE_SECTION_SLUG], [SAFE_SUBSECTION_SLUG] populated safe routes
export const SAFE_ROUTES = {
  ASSETS_BALANCES: `${ADDRESSED_ROUTE}/balances`, // [SAFE_SECTION_SLUG] === 'balances'
  ASSETS_BALANCES_COLLECTIBLES: `${ADDRESSED_ROUTE}/balances/collectibles`, // [SAFE_SUBSECTION_SLUG] === 'collectibles'
  TRANSACTIONS: `${ADDRESSED_ROUTE}/transactions`,
  TRANSACTIONS_HISTORY: `${ADDRESSED_ROUTE}/transactions/history`,
  TRANSACTIONS_QUEUE: `${ADDRESSED_ROUTE}/transactions/queue`,
  // TRANSACTIONS_SINGULAR: `${ADDRESSED_ROUTE}/transactions/:${TRANSACTION_ID_SLUG}(${hashRegExp}+)`, // [TRANSACTION_HASH_SLUG] === 'safeTxHash'
  TRANSACTIONS_SINGULAR: `${ADDRESSED_ROUTE}/transactions/:${TRANSACTION_ID_NUMBER}${singularExp}`, // [TRANSACTION_HASH_SLUG] === 'safeTxHash'
  ADDRESS_BOOK: `${ADDRESSED_ROUTE}/address-book`,
  STAKING: `${ADDRESSED_ROUTE}/staking`,
  VOTING: `${ADDRESSED_ROUTE}/voting`,
  VOTING_DETAIL: `${ADDRESSED_ROUTE}/voting/detail/:${VOTING_SECTION_SLUG}`,
  APPS: `${ADDRESSED_ROUTE}/apps`,
  SETTINGS: `${ADDRESSED_ROUTE}/settings`,
  SETTINGS_APPEARANCE: `${ADDRESSED_ROUTE}/settings/appearance`,
  SETTINGS_DETAILS: `${ADDRESSED_ROUTE}/settings/details`,
  SETTINGS_OWNERS: `${ADDRESSED_ROUTE}/settings/owners`,
  SETTINGS_POLICIES: `${ADDRESSED_ROUTE}/settings/policies`,
  SETTINGS_SPENDING_LIMIT: `${ADDRESSED_ROUTE}/settings/spending-limit`,
  SETTINGS_ADVANCED: `${ADDRESSED_ROUTE}/settings/advanced`,
  CONTRACT_INTERACTION: `${ADDRESSED_ROUTE}/contract-interaction`,
  CUSTOM_TRANSACTION: `${ADDRESSED_ROUTE}/custom-transaction`,
}

export const getNetworkRootRoutes = (): Array<{ chainId: ChainId; route: string }> =>
  getChains().map(({ chainId, chainName }) => ({
    chainId,
    route: `/${chainName.replaceAll(' ', '-').toLowerCase()}`,
  }))

export type SafeRouteParams = { shortName: ShortName; safeAddress: string; safeId?: number; proposalId?: number }
// Due to hoisting issues, these functions should remain here
export const extractPrefixedSafeAddress = (
  path = history.location.pathname,
  route = ADDRESSED_ROUTE,
): SafeRouteParams => {
  const match = matchPath<SafeRouteSlugs>(path, {
    path: route,
  })
  const prefixedSafeAddress = match?.params?.[SAFE_ADDRESS_SLUG]
  const { prefix, address } = parsePrefixedAddress(prefixedSafeAddress || '')

  return {
    safeId: Number(prefix),
    safeAddress: address,
    shortName: prefix,
  }
}
// export const extractVoting = (path = history.location.pathname, route = VOTING_SECTION_ROUTE): string | undefined => {
//   const match = matchPath<SafeRouteSlugs>(path, {
//     path: route,
//   })
//   const proposalId = match?.params?.[VOTING_SECTION_SLUG]

//   return proposalId
// }

export const hasPrefixedSafeAddressInUrl = (): boolean => {
  const match = matchPath<SafeRouteSlugs>(history.location.pathname, {
    // Routes that have addresses in URL
    path: [ADDRESSED_ROUTE, LOAD_SPECIFIC_SAFE_ROUTE],
  })
  return !!match?.params?.[SAFE_ADDRESS_SLUG]
}

export const extractShortChainName = (): ShortName => extractPrefixedSafeAddress().shortName
export const extractSafeAddress = (): string => extractPrefixedSafeAddress().safeAddress
export const extractSafeId = (): number | undefined => extractPrefixedSafeAddress().safeId
// export const extractVotingId = (): string | undefined => extractVoting()

export const getPrefixedSafeAddressSlug = (
  { safeAddress = extractSafeAddress(), shortName = extractShortChainName(), safeId = extractSafeId() } = {
    safeAddress: extractSafeAddress(),
    shortName: extractShortChainName(),
    safeId: extractSafeId(),
  },
): string => `${safeId}:${safeAddress}`

// Populate `/:[SAFE_ADDRESS_SLUG]` with current 'shortName:safeAddress'
export const generateSafeRoute = (
  path: typeof SAFE_ROUTES[keyof typeof SAFE_ROUTES],
  params: SafeRouteParams,
): string =>
  generatePath(path, {
    [SAFE_ADDRESS_SLUG]: getPrefixedSafeAddressSlug(params),
  })

// Singular tx route is excluded as it has a required safeTxHash slug
// This is to give stricter routing, instead of making the slug optional
const { TRANSACTIONS_SINGULAR: _hasRequiredSlug, VOTING_DETAIL: _proposalIdSlug, ...STANDARD_SAFE_ROUTES } = SAFE_ROUTES

export const generatePrefixedAddressRoutes = (params: SafeRouteParams): typeof STANDARD_SAFE_ROUTES => {
  return Object.entries(STANDARD_SAFE_ROUTES).reduce<typeof STANDARD_SAFE_ROUTES>(
    (routes, [key, route]) => ({ ...routes, [key]: generateSafeRoute(route, params) }),
    {} as typeof STANDARD_SAFE_ROUTES,
  )
}
