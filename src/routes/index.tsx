import { Loader } from '@aura/safe-react-components'
import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { matchPath, Redirect, Route, Switch, useLocation } from 'react-router-dom'

import { LoadingContainer } from 'src/components/LoaderContainer'
import { getShortName } from 'src/config'
import { setChainId } from 'src/logic/config/utils'
import { lastViewedSafe } from 'src/logic/currentSession/store/selectors'
import { useAnalytics } from 'src/utils/googleAnalytics'
import { isDeeplinkedTx } from '../utils/transactionUtils'
import {
  ADDRESSED_ROUTE,
  ALLOW_SAFE_ROUTE,
  ALLOW_SPECIFIC_SAFE_ROUTE,
  CANCEL_SAFE_ROUTE,
  CANCEL_SPECIFIC_SAFE_ROUTE,
  generateSafeRoute,
  getNetworkRootRoutes,
  getPrefixedSafeAddressSlug,
  hasPrefixedSafeAddressInUrl,
  LOAD_SAFE_ROUTE,
  LOAD_SPECIFIC_SAFE_ROUTE,
  OPEN_SAFE_ROUTE,
  ROOT_ROUTE,
  SAFE_ROUTES,
  TRANSACTION_ID_SLUG,
  WELCOME_ROUTE,
} from './routes'
import { useAddressedRouteKey } from './safe/container/hooks/useAddressedRouteKey'

const Welcome = React.lazy(() => import('../pages/welcome/Welcome'))
const CreateSafePage = React.lazy(() => import('./CreateSafePage/CreateSafePage'))
const LoadSafePage = React.lazy(() => import('./LoadSafePage/LoadSafePage'))
const AllowSafePage = React.lazy(() => import('./AllowSafePage/AllowSafePage'))
const CanCelSafePage = React.lazy(() => import('./CancelSafePage/CancelSafePage'))
const SafeContainer = React.lazy(() => import('./safe'))

const Routes = (): React.ReactElement => {
  const location = useLocation()
  const { pathname, search } = location
  const defaultSafe = useSelector(lastViewedSafe)
  const { trackPage } = useAnalytics()

  // Component key that changes when addressed route slug changes
  const { key } = useAddressedRouteKey()

  useEffect(() => {
    let trackedPath = pathname

    // Anonymize safe address
    if (hasPrefixedSafeAddressInUrl()) {
      trackedPath = trackedPath.replace(getPrefixedSafeAddressSlug(), 'SAFE_ADDRESS')
    }

    // Anonymize deeplinked transaction
    if (isDeeplinkedTx()) {
      const match = matchPath(pathname, {
        path: SAFE_ROUTES.TRANSACTIONS_SINGULAR,
      })

      trackedPath = trackedPath.replace(match?.params[TRANSACTION_ID_SLUG], 'TRANSACTION_ID')
    }

    trackPage(trackedPath + search)

    // Set the initial network id from the URL.
    // It depends on the chains
    // switchNetworkWithUrl({ pathname }) TO-DO

    // Track when pathname changes
  }, [pathname, search, trackPage])

  const redirection = useCallback((chainId) => {
    setChainId(chainId)
    return <Redirect to={ROOT_ROUTE} />
  }, [])

  return (
    <Switch>
      <Route
        // Remove all trailing slashes
        path="/:url*(/+)"
        render={() => <Redirect to={location.pathname.replace(/\/+$/, `${location.search}${location.hash}`)} />}
      />
      {
        // Redirection to open network specific welcome pages
        getNetworkRootRoutes().map(({ chainId, route }) => (
          <Route key={chainId} path={route} render={() => redirection(chainId)} />
        ))
      }
      <Route
        exact
        path={ROOT_ROUTE}
        render={() => {
          if (defaultSafe === null) {
            return (
              <LoadingContainer>
                <Loader size="md" />
              </LoadingContainer>
            )
          }

          if (defaultSafe) {
            return (
              <Redirect
                to={generateSafeRoute(SAFE_ROUTES.ASSETS_BALANCES, {
                  shortName: getShortName(),
                  safeAddress: defaultSafe?.safeAddress,
                  safeId: Number(defaultSafe?.safeId),
                })}
              />
            )
          }

          return <Redirect to={WELCOME_ROUTE} />
        }}
      />
      <Route component={Welcome} exact path={WELCOME_ROUTE} />
      <Route component={CreateSafePage} exact path={OPEN_SAFE_ROUTE} />
      <Route
        path={ADDRESSED_ROUTE}
        render={() => {
          // Rerender the container/reset its state when prefix/address changes
          return <SafeContainer key={key} />
        }}
      />
      <Route component={LoadSafePage} path={[LOAD_SAFE_ROUTE, LOAD_SPECIFIC_SAFE_ROUTE]} />
      <Route component={AllowSafePage} path={[ALLOW_SAFE_ROUTE, ALLOW_SPECIFIC_SAFE_ROUTE]} />
      <Route component={CanCelSafePage} path={[CANCEL_SAFE_ROUTE, CANCEL_SPECIFIC_SAFE_ROUTE]} />
      <Redirect to={ROOT_ROUTE} />
    </Switch>
  )
}

export default Routes
