import { CopyToClipboardBtn, ExplorerButton, FixedIcon, Icon, Identicon, Text } from '@aura/safe-react-components'
import { useState } from 'react'
import ButtonHelper from 'src/components/ButtonHelper'
import FlexSpacer from 'src/components/FlexSpacer'
import MultiSendPopup from 'src/components/Popup/MultiSendPopup'
import SendPopup from 'src/components/Popup/SendingPopup'
import SendTxTypePopup from 'src/components/Popup/SendingTypePopup'
import { getChainInfo, getExplorerInfo } from 'src/config'
import { THEME_DF } from 'src/services/constant/chainThemes'
import LockIcon from './assets/Lockicon.svg'
import {
  Container,
  ContainerButton,
  IconContainer,
  IdenticonContainer,
  StyledButton,
  StyledDotChainName,
  StyledIcon,
  StyledIdenticonContainer,
  StyledLabel,
  StyledPrefixedEthHashInfo,
  StyledTextLabel,
  StyledTextSafeName,
  StyledTextSafeNameWrapper,
} from './styles'
import { Props } from './type'

export const TOGGLE_SIDEBAR_BTN_TESTID = 'TOGGLE_SIDEBAR_BTN'
const SafeHeader = ({
  address,
  safeName,
  granted,
  onToggleSafeList,
  onReceiveClick,
  onNewTransactionClick,
}: Props): React.ReactElement => {
  const chainInfo = getChainInfo()

  const [sendTxTypePopupOpen, setSendTxTypePopupOpen] = useState<boolean>(false)
  const [sendTxType, setSendTxType] = useState<string | undefined>(undefined)

  const { backgroundColor } = chainInfo?.theme || THEME_DF

  if (!address) {
    return (
      <Container>
        <IdenticonContainer>
          <FlexSpacer />
          <img src={LockIcon} alt="icon-lock" />
          <ButtonHelper onClick={onToggleSafeList} data-testid={TOGGLE_SIDEBAR_BTN_TESTID}>
            <StyledIcon size="md" type="circleDropdown" />
          </ButtonHelper>
        </IdenticonContainer>
      </Container>
    )
  }

  return (
    <>
      <StyledTextLabel size="lg" chainInfo={chainInfo}>
        <StyledDotChainName color={backgroundColor}></StyledDotChainName>
        <span style={{ color: 'white' }}> {chainInfo.chainName}</span>
      </StyledTextLabel>
      <Container>
        <IdenticonContainer>
          <StyledIdenticonContainer>
            <Identicon address={address} size="lg" />
            <StyledTextSafeNameWrapper>
              <StyledTextSafeName size="lg" center>
                {safeName}
              </StyledTextSafeName>
              <StyledPrefixedEthHashInfo hash={address} shortenHash={4} textSize="sm" />
            </StyledTextSafeNameWrapper>
          </StyledIdenticonContainer>
          <ButtonHelper onClick={onToggleSafeList} data-testid={TOGGLE_SIDEBAR_BTN_TESTID}>
            <StyledIcon size="md" type="circleDropdown" />
          </ButtonHelper>
        </IdenticonContainer>
        <ContainerButton>
          <IconContainer>
            <ButtonHelper onClick={onReceiveClick}>
              <Icon size="sm" type="qrCode" tooltip="Show QR" />
            </ButtonHelper>
            <CopyToClipboardBtn textToCopy={address} />
            {address && <ExplorerButton explorerUrl={getExplorerInfo(address)} />}
          </IconContainer>
          {/* <StyledButton size="md" disabled={!granted} onClick={() => onNewTransactionClick()}> */}
          <StyledButton size="md" disabled={!granted} onClick={() => setSendTxTypePopupOpen(true)}>
            <FixedIcon type="arrowSentWhite" />
            <Text size="lg" color="white">
              New transaction
            </Text>
          </StyledButton>
        </ContainerButton>
        {!granted && (
          <StyledLabel>
            <Text size="sm" color="white">
              READ ONLY
            </Text>
          </StyledLabel>
        )}
      </Container>
      <SendTxTypePopup
        open={sendTxTypePopupOpen}
        onClose={() => setSendTxTypePopupOpen(false)}
        onTypeButtonClick={(type: string) => {
          setSendTxType(type)
          setSendTxTypePopupOpen(false)
        }}
      />
      <SendPopup
        open={sendTxType == 'single-send'}
        onOpen={() => setSendTxType('single-send')}
        onClose={() => setSendTxType(undefined)}
      />
      <MultiSendPopup
        open={sendTxType == 'multi-send'}
        onOpen={() => setSendTxType('multi-send')}
        onClose={() => setSendTxType(undefined)}
      />
    </>
  )
}

export default SafeHeader
