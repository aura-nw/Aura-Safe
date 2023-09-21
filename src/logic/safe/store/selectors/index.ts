import { List } from 'immutable'
import { createSelector } from 'reselect'
import { AddressBookEntry, makeAddressBookEntry } from 'src/logic/addressBook/model/addressBook'
import { currentNetworkAddressBookAsMap } from 'src/logic/addressBook/store/selectors'
import { currentChainId } from 'src/logic/config/store/selectors'
import { AppReduxState } from 'src/logic/safe/store'
import makeSafe, { SafeRecord, SafeRecordProps } from 'src/logic/safe/store/models/safe'
import { SAFE_REDUCER_ID } from 'src/logic/safe/store/reducer/safe'
import { SafesMap } from 'src/logic/safe/store/reducer/types/safe'
import { extractSafeAddress } from 'src/routes/routes'
import { Overwrite } from 'src/types/helpers'

const safesState = (state: AppReduxState) => state[SAFE_REDUCER_ID]

export const safesAsMap = (state: AppReduxState): SafesMap => safesState(state).get('safes')

export const safesAsList = createSelector(safesAsMap, (safes): List<SafeRecord> => safes.toList())

export const currentSafe = createSelector([safesAsMap], (safes: SafesMap) => {
  const address = extractSafeAddress()
  return safes.get(address, baseSafe(address))
})
export const safeByAddressSelector = createSelector(
  [
    (state: AppReduxState, address: string): SafeRecord =>
      safesState(state).get('safes').get(address, baseSafe(address)),
  ],
  (safe: SafeRecord) => safe,
)

const baseSafe = (address = '') => makeSafe({ address })

const safeFieldSelector =
  <K extends keyof SafeRecordProps>(field: K) =>
  (safe: SafeRecord): SafeRecordProps[K] =>
    safe.get(field, baseSafe().get(field))

export const currentSafeNativeBalance = createSelector(currentSafe, safeFieldSelector('nativeBalance'))

export const currentSafeBalances = createSelector(currentSafe, safeFieldSelector('balances'))

export const currentSafeCurrentVersion = createSelector(currentSafe, safeFieldSelector('currentVersion'))

export const currentSafeThreshold = createSelector(currentSafe, safeFieldSelector('threshold'))

export const currentSafeOwners = createSelector(currentSafe, safeFieldSelector('owners'))

export const currentSafeFeaturesEnabled = createSelector(currentSafe, safeFieldSelector('featuresEnabled'))

export const currentSafeSpendingLimits = createSelector(currentSafe, safeFieldSelector('spendingLimits'))

export const currentSafeLoaded = createSelector(currentSafe, safeFieldSelector('isSafeLoaded'))

/*************************/
/* With AddressBook Data */
/*************************/
const baseSafeWithName = (address = '') => ({ ...baseSafe(address).toJS(), name: '' })

type SafeRecordWithNames = Overwrite<SafeRecordProps, { owners: AddressBookEntry[] }> & { name: string }

export const safesWithNamesAsList = createSelector(
  [safesAsList, currentNetworkAddressBookAsMap, currentChainId],
  (safesList, addressBookMap, chainId): SafeRecordWithNames[] => {
    return safesList
      .map((safeRecord) => {
        const safe = safeRecord.toObject()
        const name = addressBookMap?.[safe.address]?.name ?? ''

        const owners = safe.owners.map((ownerAddress) => {
          return addressBookMap?.[ownerAddress] ?? makeAddressBookEntry({ address: ownerAddress, name: '', chainId })
        })

        return { ...safe, name, owners }
      })
      .toJS()
  },
)

export const safesWithNamesAsMap = createSelector(
  [safesWithNamesAsList],
  (
    safesList,
  ): {
    [address: string]: SafeRecordWithNames
  } => {
    return safesList.reduce((acc, safe) => {
      acc[safe.address] = safe
      return acc
    }, {})
  },
)

export const currentSafeWithNames = createSelector(
  [safesWithNamesAsMap, currentSafe],
  (safesMap, safe): SafeRecordWithNames => safesMap[safe.address] || baseSafeWithName(safe.address),
)
