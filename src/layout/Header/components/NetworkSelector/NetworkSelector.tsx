import { Divider, Icon } from '@aura/safe-react-components'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import Popper from '@material-ui/core/Popper'
import { makeStyles } from '@material-ui/core/styles'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { Fragment, ReactElement, useCallback, useRef } from 'react'
import { useHistory } from 'react-router-dom'

import Col from 'src/components/layout/Col'
import { ReturnValue } from 'src/logic/hooks/useStateHandler'
import NetworkLabel from '../NetworkLabel/NetworkLabel'

import { useSelector } from 'react-redux'
import { getChainById } from 'src/config'
import { ChainId } from 'src/config/chain.d'
import { currentChainId } from 'src/logic/config/store/selectors'
import { getNetworkRootRoutes } from 'src/routes/routes'
import 'src/services/interceptor'
import { StyledLink, styles } from './styles'

const useStyles = makeStyles(styles)
type NetworkSelectorProps = ReturnValue

const NetworkSelector = ({ open, toggle, clickAway }: NetworkSelectorProps): ReactElement => {
  // const theme = getChainInfoTheme()

  const networkRef = useRef(null)
  const history = useHistory()
  const classes = useStyles()
  const chainId = useSelector(currentChainId)
  const onNetworkSwitch = useCallback(
    (e: React.SyntheticEvent, chainId: ChainId) => {
      e.preventDefault()
      clickAway()
      const newRoute = getNetworkRootRoutes().find((network) => network.chainId === chainId)
      if (newRoute) {
        history.push(newRoute.route)
      }
    },
    [clickAway, history],
  )

  return (
    <>
      <div className={classes.root} ref={networkRef}>
        <Col className={classes.networkList} between="sm" middle="xs" onClick={toggle}>
          <NetworkLabel />
          <IconButton className={classes.expand} disableRipple>
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Col>
        <Divider />
      </div>
      <Popper
        anchorEl={networkRef.current}
        className={classes.popper}
        open={open}
        placement="bottom"
        popperOptions={{ positionFixed: true }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <>
              <ClickAwayListener mouseEvent="onClick" onClickAway={clickAway} touchEvent={false}>
                <List className={classes.network} component="div">
                  {getNetworkRootRoutes().map((network) => (
                    <Fragment key={network.chainId}>
                      <StyledLink onClick={(e) => onNetworkSwitch(e, network.chainId)} href={network.route}>
                        <div className={classes.link}>
                          <NetworkLabel networkInfo={getChainById(network.chainId)} />
                          {chainId === network.chainId && <Icon type="check" size="md" color="primary" />}
                        </div>
                      </StyledLink>
                    </Fragment>
                  ))}
                </List>
              </ClickAwayListener>
            </>
          </Grow>
        )}
      </Popper>
    </>
  )
}

export default NetworkSelector
