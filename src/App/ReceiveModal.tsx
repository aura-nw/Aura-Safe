import IconButton from '@material-ui/core/IconButton'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import Close from '@material-ui/icons/Close'
import QRCode from 'qrcode.react'
import { ReactElement } from 'react'
import styled from 'styled-components'

import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import Block from 'src/components/layout/Block'
import Col from 'src/components/layout/Col'
import Hairline from 'src/components/layout/Hairline'
import Paragraph from 'src/components/layout/Paragraph'
import Row from 'src/components/layout/Row'
import { getChainInfo, getExplorerInfo } from 'src/config'
import { borderLinear, lg, md, screenSm, secondaryText } from 'src/theme/variables'
import PrefixedEthHashInfo from '../components/PrefixedEthHashInfo'
const useStyles = (chainInfo: ChainInfo) =>
  makeStyles(
    createStyles({
      heading: {
        padding: `${md} ${lg}`,
        justifyContent: 'space-between',
        height: '74px',
        boxSizing: 'border-box',
      },
      close: {
        height: lg,
        width: lg,
        fill: secondaryText,
      },
      qrContainer: {
        backgroundColor: '#fff',
        padding: md,
        borderRadius: '6px',
        border: `1px solid ${secondaryText}`,
      },
      networkInfo: {
        backgroundColor: 'rgba(38, 38, 41, 1)',
        color: 'white',
        padding: md,
        marginBottom: 0,
      },
      annotation: {
        margin: lg,
        marginBottom: 0,
      },
      safeName: {
        margin: `${md} 0`,
      },
      buttonRow: {
        height: '84px',
        justifyContent: 'flex-end',
        marginRight: 50,
        // '& > button': {
        //   fontFamily: 'Inter',
        //   fontSize: md,
        //   boxShadow: 'none',
        //   backgroundColor: 'transparent !important',
        //   border: '1px solid rgba(94, 230, 157, 1)',
        // },
      },
      addressContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        margin: `${lg} 0`,

        [`@media (min-width: ${screenSm}px)`]: {
          flexDirection: 'row',
        },
      },
    }),
  )()

const StyledButton = styled.div`
  display: flex;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 30px;
  background-color: transparent;
  border: 2px solid transparent;
  background-image: ${borderLinear};
  background-origin: border-box;
  background-clip: content-box, border-box;
  cursor: pointer;
  margin-left: 10px;
`

type Props = {
  onClose: () => void
  safeAddress: string
  safeName: string
}

const ReceiveModal = ({ onClose, safeAddress, safeName }: Props): ReactElement => {
  const chainInfo = getChainInfo()
  const classes = useStyles(chainInfo)

  // const copyShortName = useSelector(copyShortNameSelector)
  // const [shouldEncodePrefix, setShouldEncodePrefix] = useState<boolean>(copyShortName)

  const qrCodeString = safeAddress

  return (
    <>
      <Row align="center" className={classes.heading}>
        <Paragraph noMargin size="xl" weight="bolder">
          Receive assets
        </Paragraph>
        <IconButton disableRipple onClick={onClose}>
          <Close className={classes.close} />
        </IconButton>
      </Row>
      <Hairline />
      <Paragraph className={classes.networkInfo} noMargin size="lg" weight="bolder">
        {chainInfo.chainName} Network–only send {chainInfo.chainName} assets to this Safe.
      </Paragraph>
      <Paragraph className={classes.annotation} noMargin size="lg">
        This is the address of your Safe. Deposit funds by scanning the QR code or copying the address below. Only send{' '}
        {chainInfo.nativeCurrency.symbol} and assets to this address (e.g. AURA, CW20, CW721)!
      </Paragraph>
      <Col layout="column" middle="xs">
        <Paragraph className={classes.safeName} noMargin size="lg" weight="bold">
          {safeName}
        </Paragraph>
        <Block className={classes.qrContainer}>
          <QRCode size={135} value={qrCodeString} />
        </Block>
        <Block className={classes.addressContainer} justify="center">
          <PrefixedEthHashInfo hash={safeAddress} showAvatar showCopyBtn explorerUrl={getExplorerInfo(safeAddress)} />
        </Block>
      </Col>
      <Hairline />
      <Row align="center" className={classes.buttonRow}>
        <StyledButton onClick={onClose}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Done</span>
        </StyledButton>
      </Row>
    </>
  )
}

export default ReceiveModal
