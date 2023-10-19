import { withStyles } from '@material-ui/core/styles'
import { ReactElement } from 'react'
import Col from 'src/components/layout/Col'
import Paragraph from 'src/components/layout/Paragraph'
import { styles } from './styles'
// import { KeyRing } from 'src/components/AppLayout/Header/components/KeyRing/KeyRing'

const ProviderDisconnected = ({ classes }): ReactElement => (
  <>
    {/* <KeyRing circleSize={35} dotRight={11} dotSize={16} dotTop={24} keySize={17} mode="error" /> */}
    <Col className={classes.account} end="sm" layout="column" middle="xs">
      <Paragraph
        className={classes.network}
        noMargin
        size="md"
        transform="capitalize"
        weight="semiBold"
        data-testid="not-connected-wallet"
        color="gray"
      >
        Not Connected
      </Paragraph>
      <Paragraph className={classes.connect} color="gradient" noMargin size="md">
        Connect Wallet
      </Paragraph>
    </Col>
  </>
)

export default withStyles(styles as any)(ProviderDisconnected)
