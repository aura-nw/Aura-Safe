import { ReactElement } from 'react'
import { StyledConnectButton } from './styles'

const ConnectButton = (props: { 'data-testid': string; onConnect: () => void }): ReactElement => (
  <StyledConnectButton
    color="primary"
    minWidth={240}
    onClick={props.onConnect}
    variant="contained"
    data-testid={props['data-testid']}
  >
    Connect
  </StyledConnectButton>
)

export default ConnectButton
