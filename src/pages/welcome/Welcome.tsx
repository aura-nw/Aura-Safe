import { Text, Title } from '@aura/safe-react-components'
import Divider from '@material-ui/core/Divider'
import { ReactElement } from 'react'
import { useHistory } from 'react-router-dom'
import { FilledButton, OutlinedButton } from 'src/components/Button'
import Block from 'src/components/layout/Block'
import Page from 'src/components/layout/Page'
import { LOAD_SAFE_ROUTE, OPEN_SAFE_ROUTE } from 'src/routes/routes'
import styled from 'styled-components'
import plusIcon from './assets/plus.svg'
import walletIcon from './assets/wallet.svg'
import {
  ButtonContainer,
  CardContentContainer,
  CardDescriptionContainer,
  CardsContainer,
  StyledCard,
  StyledTitle,
} from './styles'

const TitleFont = styled(Title)`
  font-family: 'Inter';
`
const TextFont = styled(Text)`
  font-family: 'Inter';
`
function Welcome(): ReactElement {
  const history = useHistory()
  return (
    <Page align="center">
      <Block>
        <StyledTitle>
          <TitleFont size="md" strong>
            Welcome to Pyxis Safe.
          </TitleFont>
          <TitleFont size="xs">
            Pyxis Safe is the go-to platform for multi-signature asset management on the Interchain.
            <br /> Here is how to get started:
          </TitleFont>
        </StyledTitle>
        <CardsContainer>
          <StyledCard>
            {/* Create Safe */}
            <CardContentContainer>
              <TitleFont size="sm" strong withoutMargin>
                Create Safe
              </TitleFont>
              <CardDescriptionContainer>
                <TextFont size="xl" color="white">
                  Create a new Safe that is controlled by one or multiple owners.
                </TextFont>
                <TextFont size="xl" color="white">
                  Creating a Safe is totally free of charge.
                </TextFont>
              </CardDescriptionContainer>
              <FilledButton onClick={() => history.push(OPEN_SAFE_ROUTE)}>
                <ButtonContainer>
                  <img src={plusIcon} />
                  <span> Create new Safe</span>
                </ButtonContainer>
              </FilledButton>
            </CardContentContainer>
            <Divider orientation="vertical" flexItem />
            <CardContentContainer>
              <TitleFont size="sm" strong withoutMargin>
                Load Existing Safe
              </TitleFont>
              <CardDescriptionContainer>
                <TextFont size="xl" color="white">
                  Already have a Safe or want to access it from a different device? Easily load your Safe using your
                  Safe address.
                </TextFont>
              </CardDescriptionContainer>
              <OutlinedButton onClick={() => history.push(LOAD_SAFE_ROUTE)}>
                <ButtonContainer>
                  <img src={walletIcon} />
                  <span> Add existing Safe</span>
                </ButtonContainer>
              </OutlinedButton>
            </CardContentContainer>
          </StyledCard>
        </CardsContainer>
      </Block>
    </Page>
  )
}

export default Welcome
