import MuiList from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import styled from 'styled-components'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { Fragment, ReactElement } from 'react'
import { Text } from '@aura/safe-react-components'
import { Link } from 'react-router-dom'
import uniqBy from 'lodash/uniqBy'

import Collapse from 'src/components/Collapse'
import SafeListItem from './SafeListItem'
import useLocalSafes from 'src/logic/safe/hooks/useLocalSafes'
import { extractSafeAddress, WELCOME_ROUTE } from 'src/routes/routes'
import { SafeRecordProps } from 'src/logic/safe/store/models/safe'
import { setChainId } from 'src/logic/config/utils'
import { useDispatch, useSelector } from 'react-redux'
import { currentChainId } from 'src/logic/config/store/selectors'
import useOwnerSafes, { SafeStatus, SafeType } from 'src/logic/safe/hooks/useOwnerSafes'
import { getChains } from 'src/config/cache/chains'
import { loadFromStorage, saveToStorage } from 'src/utils/storage'
import { PendingSafeListStorage, updateAddressBook } from 'src/routes/CreateSafePage/CreateSafePage'
import { SAFES_PENDING_STORAGE_KEY } from 'src/routes/CreateSafePage/fields/createSafeFields'
import { loadStoredSafes, saveSafes } from 'src/logic/safe/utils'
import { buildMSafe } from 'src/logic/safe/store/actions/fetchSafe'
import { addOrUpdateSafe } from 'src/logic/safe/store/actions/addOrUpdateSafe'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'

const MAX_EXPANDED_SAFES = 3

const StyledDot = styled.span<{ backgroundColor: string; textColor: string }>`
  width: 15px;
  height: 15px;
  color: ${({ textColor }) => textColor};
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
`

const StyledList = styled(MuiList)`
  height: '100%';
  overflow-x: 'hidden';
  overflow-y: 'auto';
  padding: 0;

  & p > a {
    color: inherit;
  }
`

const useStyles = makeStyles({
  listItemCollapse: {
    '&:not(:first-child)': {
      paddingTop: '10px',
    },

    padding: '0 0 0 0',
    '& > div > div:first-child': {
      paddingLeft: '44px',
      paddingTop: '8px',
      paddingBottom: '8px',
    },
  },
})

const PlaceholderText = styled(Text)`
  padding: 16px 44px;
`

type Props = {
  onSafeClick: () => void
}

const isNotLoadedViaUrl = ({ loadedViaUrl }: SafeRecordProps) => loadedViaUrl === false

const isSameAddress = (addrA: string, addrB: string): boolean => addrA.toLowerCase() === addrB.toLowerCase()

const isPendingSafes = ({ status }: SafeType): boolean =>
  status === SafeStatus.NeedConfirm || status === SafeStatus.Pending || status === SafeStatus.Confirmed

const isCreatedSafes = ({ status }: SafeType): boolean => status === SafeStatus.Created

export const SafeList = ({ onSafeClick }: Props): ReactElement => {
  const dispatch = useDispatch()
  const classes = useStyles()
  const currentSafeAddress = extractSafeAddress()
  const ownedSafes = useOwnerSafes()
  const localSafes = useLocalSafes()
  const curChainId = useSelector(currentChainId)

  const userAccount = useSelector(userAccountSelector)

  return (
    <StyledList>
      {getChains().map(({ chainId, theme, chainName }) => {
        const isCurrentNetwork = chainId === curChainId
        const ownedSafesOnNetwork = ownedSafes[chainId]?.filter(isCreatedSafes) || []
        const pendingSafesOnNetwork = ownedSafes[chainId]?.filter(isPendingSafes) || []

        const getSafePending = async () => {
          const safesPending = await Promise.resolve(
            loadFromStorage<PendingSafeListStorage>(SAFES_PENDING_STORAGE_KEY, `${userAccount}_`),
          )
          let safePendingIndex = -1
          safesPending?.forEach((safePending, index) => {
            const safeFound = ownedSafes[chainId]?.find((ownedSafe) => ownedSafe.id === safePending.id)

            if (safeFound && safeFound.status === SafeStatus.Created && safeFound.safeAddress) {
              safePendingIndex = index

              const buildSafe = async () => {
                const safeProps = await buildMSafe(safeFound.safeAddress, safeFound.id)
                const storedSafes = loadStoredSafes() || {}

                storedSafes[safeFound.safeAddress] = safeProps

                updateAddressBook(safeFound.safeAddress, safePending, dispatch)
                saveSafes(storedSafes)
                dispatch(addOrUpdateSafe(safeProps))
              }
              buildSafe()
            } else if (safeFound && safeFound.status === SafeStatus.Deleted) {
            }
          })

          if (safePendingIndex >= 0 && safesPending) {
            safesPending?.splice(safePendingIndex, 1)
            saveToStorage(SAFES_PENDING_STORAGE_KEY, [...safesPending], `${userAccount}_`)
          }
        }

        getSafePending()

        const localSafesOnNetwork = uniqBy(localSafes[chainId].filter(isNotLoadedViaUrl), ({ address }) =>
          address.toLowerCase(),
        )

        if (!isCurrentNetwork && !ownedSafesOnNetwork.length && !localSafesOnNetwork.length) {
          return null
        }

        let shouldExpandOwnedSafes = false
        if (isCurrentNetwork && ownedSafesOnNetwork.map((e) => e.safeAddress).includes(currentSafeAddress)) {
          // Expand the Owned Safes if the current Safe is owned, but not added
          shouldExpandOwnedSafes = !localSafesOnNetwork.some(({ address }) =>
            isSameAddress(address, currentSafeAddress),
          )
        } else {
          // Expand the Owned Safes if there are no added Safes
          shouldExpandOwnedSafes = !localSafesOnNetwork.length && ownedSafesOnNetwork.length <= MAX_EXPANDED_SAFES
        }

        return (
          <Fragment key={chainId}>
            <ListItem selected>
              <StyledDot {...theme} />
              {chainName}
            </ListItem>
            <MuiList>
              {localSafesOnNetwork.map((safe) => (
                <SafeListItem
                  safeId={0}
                  key={safe.address}
                  networkId={chainId}
                  onNetworkSwitch={() => setChainId(chainId)}
                  onSafeClick={onSafeClick}
                  shouldScrollToSafe
                  {...safe}
                />
              ))}

              {!localSafesOnNetwork.length && !ownedSafesOnNetwork.length && (
                <PlaceholderText size="lg" color="placeHolder">
                  <Link to={WELCOME_ROUTE} onClick={onSafeClick}>
                    Create or add
                  </Link>{' '}
                  an existing Safe on this network
                </PlaceholderText>
              )}

              {ownedSafesOnNetwork.length > 0 && (
                <ListItem classes={{ root: classes.listItemCollapse }} component="div">
                  <Collapse
                    title={
                      <Text
                        size="lg"
                        color="placeHolder"
                      >{`Safes owned on ${chainName} (${ownedSafesOnNetwork.length})`}</Text>
                    }
                    key={String(shouldExpandOwnedSafes)}
                    defaultExpanded={shouldExpandOwnedSafes}
                  >
                    {ownedSafesOnNetwork.map(({ safeAddress, id }) => {
                      const isAdded = localSafesOnNetwork.some(({ address }) => isSameAddress(address, safeAddress))

                      return (
                        <SafeListItem
                          key={safeAddress}
                          address={safeAddress}
                          safeId={id}
                          networkId={chainId}
                          onSafeClick={onSafeClick}
                          showAddSafeLink={!isAdded}
                          shouldScrollToSafe={shouldExpandOwnedSafes && !isAdded}
                        />
                      )
                    })}
                  </Collapse>
                </ListItem>
              )}

              {pendingSafesOnNetwork.length > 0 && (
                <ListItem classes={{ root: classes.listItemCollapse }} component="div">
                  <Collapse
                    title={
                      <Text
                        size="lg"
                        color="placeHolder"
                      >{`Pending safes on ${chainName} (${pendingSafesOnNetwork.length})`}</Text>
                    }
                    key={String(shouldExpandOwnedSafes)}
                    defaultExpanded={shouldExpandOwnedSafes}
                  >
                    {pendingSafesOnNetwork.map(({ creatorAddress, status, id }, index) => {
                      const key = `${creatorAddress}-${index}`

                      return (
                        <SafeListItem
                          key={key}
                          address={creatorAddress}
                          safeId={id}
                          networkId={chainId}
                          onSafeClick={onSafeClick}
                          pendingStatus={status}
                          shouldScrollToSafe={shouldExpandOwnedSafes}
                        />
                      )
                    })}
                  </Collapse>
                </ListItem>
              )}
            </MuiList>
          </Fragment>
        )
      })}
    </StyledList>
  )
}
