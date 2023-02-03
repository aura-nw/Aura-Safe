import { withStyles } from '@material-ui/core/styles'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import Col from 'src/components/layout/Col'
import Divider from 'src/components/layout/Divider'
import Img from 'src/components/layout/Img'
import Row from 'src/components/layout/Row'
import Spacer from 'src/components/Spacer'
import WalletSwitch from 'src/components/WalletSwitch'
import { useStateHandler } from 'src/logic/hooks/useStateHandler'
import { shouldSwitchWalletChain } from 'src/logic/wallets/store/selectors'
import { WELCOME_ROUTE } from 'src/routes/routes'
import { IS_PRODUCTION } from 'src/utils/constants'
import styled from 'styled-components'
import SafeLogo from '../../assets/logoAura.svg'
import NetworkSelector from '../NetworkSelector/NetworkSelector'
import Notifications from '../Notifications'
import Provider from '../Provider/Provider'
import { styles, DevelopBanner } from './styles'
import WalletPopup from './WalletPopup/WalletPopup'

const Wrap = styled.div`
  background: #131419;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 28px;
  border-bottom: 1px solid #3e3f40;
  .MuiSvgIcon-root {
    color: #98989b !important;
  }
`
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  > a {
    height: 42px;
  }
`
const Layout = (props: any) => {
  const { classes, providerDetails, providerInfo, showConnect, openConnectWallet } = props
  const { clickAway, open, toggle } = useStateHandler()
  const { clickAway: clickAwayNetworks, open: openNetworks, toggle: toggleNetworks } = useStateHandler()
  const isWrongChain = useSelector(shouldSwitchWalletChain)
  useEffect(() => {
    clickAway()
  }, [showConnect])

  return (
    <Wrap>
      <LogoContainer>
        <Link to={WELCOME_ROUTE} className={classes.link}>
          <Img alt="Aura Safe" height={42} src={SafeLogo} testId="heading-gnosis-logo" />
        </Link>
        {!IS_PRODUCTION && <DevelopBanner>Testnet Only</DevelopBanner>}
      </LogoContainer>

      <Spacer />

      {isWrongChain && (
        <div className={classes.wallet}>
          <WalletSwitch openConnectWallet={openConnectWallet} />
          <Divider />
        </div>
      )}
      <Notifications />
      <Provider
        info={providerInfo}
        open={open}
        toggle={toggle}
        render={(providerRef) =>
          providerRef.current && (
            <WalletPopup
              anchorEl={providerRef.current}
              providerDetails={providerDetails}
              open={open}
              classes={classes}
              onClose={clickAway}
            />
          )
        }
      />

      <NetworkSelector open={openNetworks} toggle={toggleNetworks} clickAway={clickAwayNetworks} />
    </Wrap>
  )
}

export default withStyles(styles as any)(Layout)
