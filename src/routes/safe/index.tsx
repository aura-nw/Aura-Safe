import { GenericModal, Loader } from '@aura/safe-react-components'
import React, { lazy, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'

import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { LoadingContainer } from 'src/components/LoaderContainer'
import { fetchAllDelegations } from 'src/logic/delegation/store/actions'
import { currentSafeFeaturesEnabled, currentSafeLoaded } from 'src/logic/safe/store/selectors'
import Assets from 'src/pages/Assets'
import CustomTransaction from 'src/pages/Avanced/Custom Transaction'
import ContractInteraction from 'src/pages/SmartContract/ContractInteraction'
import { SAFE_ROUTES, extractPrefixedSafeAddress, generateSafeRoute } from 'src/routes/routes'
import { SAFE_POLLING_INTERVAL } from 'src/utils/constants'
import { wrapInSuspense } from 'src/utils/wrapInSuspense'
import SafeLoadError from './components/SafeLoadError'

export const BALANCES_TAB_BTN_TEST_ID = 'balances-tab-btn'
export const SETTINGS_TAB_BTN_TEST_ID = 'settings-tab-btn'
export const APPS_TAB_BTN_TEST_ID = 'apps-tab-btn'
export const TRANSACTIONS_TAB_BTN_TEST_ID = 'transactions-tab-btn'
export const ADDRESS_BOOK_TAB_BTN_TEST_ID = 'address-book-tab-btn'
export const SAFE_VIEW_NAME_HEADING_TEST_ID = 'safe-name-heading'
export const TRANSACTIONS_TAB_NEW_BTN_TEST_ID = 'transactions-tab-new-btn'

const Apps = lazy(() => import('src/routes/safe/components/Apps'))
const Settings = lazy(() => import('src/routes/safe/components/Settings'))
const Transaction = lazy(() => import('src/pages/Transactions'))
const AddressBookTable = lazy(() => import('src/pages/AddressBook'))
const Staking = lazy(() => import('src/pages/Staking'))
const Voting = lazy(() => import('src/pages/Voting'))

const Container = (): React.ReactElement => {
  const featuresEnabled = useSelector(currentSafeFeaturesEnabled)
  const isSafeLoaded = useSelector(currentSafeLoaded)
  const [hasLoadFailed, setHasLoadFailed] = useState<boolean>(false)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isSafeLoaded) {
      dispatch(fetchAllDelegations())
      return
    }
    const failedTimeout = setTimeout(() => {
      setHasLoadFailed(true)
    }, SAFE_POLLING_INTERVAL)
    return () => {
      clearTimeout(failedTimeout)
    }
  }, [isSafeLoaded])

  const [modal, setModal] = useState({
    isOpen: false,
    title: null,
    body: null,
    footer: null,
    onClose: () => {},
  })

  const commonRoutes = [
    {
      path: [SAFE_ROUTES.ASSETS_BALANCES, SAFE_ROUTES.ASSETS_BALANCES_COLLECTIBLES],
      component: hasLoadFailed ? <SafeLoadError /> : <Assets />,
      exact: true,
    },
    {
      path: [
        SAFE_ROUTES.TRANSACTIONS,
        SAFE_ROUTES.TRANSACTIONS_HISTORY,
        SAFE_ROUTES.TRANSACTIONS_QUEUE,
        SAFE_ROUTES.TRANSACTIONS_SINGULAR,
      ],
      component: <Transaction />,
      exact: true,
    },
    {
      path: SAFE_ROUTES.CONTRACT_INTERACTION,
      component: hasLoadFailed ? <SafeLoadError /> : <ContractInteraction />,
      exact: true,
    },
    {
      path: SAFE_ROUTES.CUSTOM_TRANSACTION,
      component: <CustomTransaction />,
      exact: true,
    },
    {
      path: SAFE_ROUTES.STAKING,
      component: hasLoadFailed ? <SafeLoadError /> : <Staking />,
      exact: true,
    },
    {
      path: SAFE_ROUTES.VOTING,
      component: hasLoadFailed ? <SafeLoadError /> : <Voting />,
      exact: true,
    },
    {
      path: SAFE_ROUTES.ADDRESS_BOOK,
      component: hasLoadFailed ? <SafeLoadError /> : <AddressBookTable />,
      exact: true,
    },
    {
      path: SAFE_ROUTES.APPS,
      render: ({ history }) => {
        if (!featuresEnabled.includes(FEATURES.SAFE_APPS)) {
          history.push(generateSafeRoute(SAFE_ROUTES.ASSETS_BALANCES, extractPrefixedSafeAddress()))
        }
        return hasLoadFailed ? <SafeLoadError /> : <Apps />
      },
      exact: true,
    },
    {
      path: SAFE_ROUTES.SETTINGS,
      component: hasLoadFailed ? <SafeLoadError /> : <Settings />,
    },
  ]

  if (!isSafeLoaded && !hasLoadFailed) {
    return (
      <LoadingContainer>
        <Loader size="md" />
      </LoadingContainer>
    )
  }

  const closeGenericModal = () => {
    if (modal.onClose) {
      modal.onClose?.()
    }

    setModal({
      isOpen: false,
      title: null,
      body: null,
      footer: null,
      onClose: () => {},
    })
  }

  return (
    <>
      <Switch>
        {commonRoutes.map((route, index) => (
          <Route
            key={index}
            exact={route.exact}
            path={route.path}
            render={route.render || (() => wrapInSuspense(route.component, null))}
          />
        ))}
        <Redirect to={SAFE_ROUTES.ASSETS_BALANCES} />
      </Switch>
      {modal.isOpen && <GenericModal {...modal} onClose={closeGenericModal} />}
    </>
  )
}
export default Container
