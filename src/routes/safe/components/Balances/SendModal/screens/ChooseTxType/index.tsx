import IconButton from '@material-ui/core/IconButton'
import Close from '@material-ui/icons/Close'
import * as React from 'react'

import Col from 'src/components/layout/Col'
import Hairline from 'src/components/layout/Hairline'
import Paragraph from 'src/components/layout/Paragraph'
import Row from 'src/components/layout/Row'
import PrefixedEthHashInfo from 'src/components/PrefixedEthHashInfo'
import { useStyles } from 'src/routes/safe/components/Balances/SendModal/screens/ChooseTxType/style'

import { getExplorerInfo } from 'src/config'
import { StyledBorder, StyledButtonBorder, StyledButtonLabel } from './style'

type ActiveScreen = 'sendFunds' | 'sendCollectible' | 'contractInteraction'

interface ChooseTxTypeProps {
  onClose: () => void
  recipientAddress?: string
  recipientName?: string
  setActiveScreen: React.Dispatch<React.SetStateAction<ActiveScreen>>
}

const ChooseTxType = ({
  onClose,
  recipientAddress,
  recipientName,
  setActiveScreen,
}: ChooseTxTypeProps): React.ReactElement => {
  const classes = useStyles()

  return (
    <>
      <Row align="center" className={classes.heading} grow>
        <Paragraph className={classes.manage} noMargin weight="bolder">
          Send
        </Paragraph>
        <IconButton disableRipple onClick={onClose}>
          <Close className={classes.closeIcon} />
        </IconButton>
      </Row>
      <Hairline />
      {!!recipientAddress && (
        <Row align="center" margin="md">
          <Col className={classes.disclaimer} layout="column" middle="xs">
            <Paragraph className={classes.disclaimerText} noMargin>
              Please select what you will send to
            </Paragraph>
            <PrefixedEthHashInfo
              hash={recipientAddress}
              name={recipientName}
              showAvatar
              showCopyBtn
              explorerUrl={getExplorerInfo(recipientAddress)}
            />
          </Col>
        </Row>
      )}
      <Row align="center">
        <Col className={classes.buttonColumn} layout="column" middle="xs">
          <StyledBorder>
            <StyledButtonBorder iconSize="sm" size="lg" type="button" onClick={() => setActiveScreen('sendFunds')}>
              <StyledButtonLabel size="xl"> Send funds </StyledButtonLabel>
            </StyledButtonBorder>
          </StyledBorder>
        </Col>
      </Row>
    </>
  )
}

export default ChooseTxType
