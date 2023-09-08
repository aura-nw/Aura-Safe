import { makeStyles } from '@material-ui/core/styles'
import { SnackbarProvider } from 'notistack'
import { useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import AlertIcon from 'src/assets/icons/alert.svg'
import CheckIcon from 'src/assets/icons/check.svg'
import ErrorIcon from 'src/assets/icons/error.svg'
import InfoIcon from 'src/assets/icons/info.svg'
import CookiesBanner from 'src/components/CookiesBanner'
import Modal from 'src/components/Modal'
import Notifier from 'src/components/Notifier'
import { SafeListSidebar, SafeListSidebarContext } from 'src/components/SafeListSidebar'
import Img from 'src/components/layout/Img'
import AppLayout from 'src/layout'
import { currentCurrencySelector } from 'src/logic/currencyValues/store/selectors'
import useConnectWallet from 'src/logic/hooks/useConnectWallet'
import { useLoadSafe } from 'src/logic/safe/hooks/useLoadSafe'
import useSafeActions from 'src/logic/safe/hooks/useSafeActions'
import { useSafeScheduledUpdates } from 'src/logic/safe/hooks/useSafeScheduledUpdates'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { formatAmountInUsFormat } from 'src/logic/tokens/utils/formatAmount'
import { grantedSelector } from 'src/utils/safeUtils/selector'

import { ConnectWalletModal } from 'src/components/ConnectWalletModal'
import { useSidebarItems } from 'src/layout/Sidebar/useSidebarItems'
import useAddressBookSync from 'src/logic/addressBook/hooks/useAddressBookSync'
import { extractSafeAddress, extractSafeId } from 'src/routes/routes'
import TermModal from './TermModal'

import TermContext from 'src/logic/TermContext'
import { fetchAllValidator } from 'src/logic/validator/store/actions'

const notificationStyles = {
  success: {
    background: '#49996F',
    '& span, & svg': {
      color: '#fff!important',
    },
  },
  error: {
    background: '#AF4F4C',
    '& span': {
      color: '#fff',
    },
  },
  warning: {
    background: '#BC872A',
    '& span, & svg': {
      color: '#fff!important',
    },
  },
  info: {
    background: '#0F82C5',
    '& span': {
      color: '#fff',
    },
  },
}

const Frame = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  max-width: 100%;
`

const useStyles = makeStyles(notificationStyles)

const App: React.FC = ({ children }) => {
  const classes = useStyles()
  const { toggleSidebar } = useContext(SafeListSidebarContext)
  const termContext = useContext(TermContext)
  const TermState = termContext?.term || false
  const { name: safeName, totalFiatBalance: currentSafeBalance } = useSelector(currentSafeWithNames)
  const safeAddress = extractSafeAddress()
  const safeId = extractSafeId()
  const { onShow, showSendFunds } = useSafeActions()
  const { connectWalletState, onConnectWalletShow, onConnectWalletHide } = useConnectWallet()
  const currentCurrency = useSelector(currentCurrencySelector)
  const granted = useSelector(grantedSelector)
  const sidebarItems = useSidebarItems()
  const dispatch = useDispatch()
  useLoadSafe(safeAddress, safeId) // load initially
  useSafeScheduledUpdates(safeAddress, safeId) // load every X seconds
  useAddressBookSync()

  const formattedTotalBalance = currentSafeBalance ? formatAmountInUsFormat(currentSafeBalance.toString()) : ''
  const balance =
    !!formattedTotalBalance && !!currentCurrency ? `${formattedTotalBalance} ${currentCurrency}` : undefined

  const onReceiveShow = () => onShow('Receive')

  const onTermHide = () => {
    termContext?.SetTerm(false)
  }

  useEffect(() => {
    dispatch(fetchAllValidator())
  }, [dispatch])

  return (
    <Frame>
      <SnackbarProvider
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        classes={{
          variantSuccess: classes.success,
          variantError: classes.error,
          variantWarning: classes.warning,
          variantInfo: classes.info,
        }}
        iconVariant={{
          error: <Img alt="Error" src={ErrorIcon} />,
          info: <Img alt="Info" src={InfoIcon} />,
          success: <Img alt="Success" src={CheckIcon} />,
          warning: <Img alt="Warning" src={AlertIcon} />,
        }}
        maxSnack={5}
      >
        <>
          <Notifier />
          <AppLayout
            sidebarItems={sidebarItems}
            safeAddress={safeAddress}
            safeName={safeName}
            balance={balance}
            granted={granted}
            onToggleSafeList={toggleSidebar}
            onReceiveClick={onReceiveShow}
            onConnectClick={onConnectWalletShow}
            onNewTransactionClick={() => showSendFunds('')}
          >
            {children}
          </AppLayout>

          <ConnectWalletModal
            isOpen={connectWalletState.showConnect}
            onClose={onConnectWalletHide}
          ></ConnectWalletModal>

          <Modal description="Term Tokens Form" handleClose={onTermHide} open={TermState} title="Term Tokens">
            <TermModal onClose={onTermHide} valueTerm={termContext?.valueTerm} />
          </Modal>
        </>
      </SnackbarProvider>
      <CookiesBanner />
    </Frame>
  )
}

const WrapperAppWithSidebar: React.FC = ({ children }) => (
  <SafeListSidebar>
    <App>{children}</App>
  </SafeListSidebar>
)

export default WrapperAppWithSidebar
