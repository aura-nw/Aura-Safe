import { ReactElement } from 'react'
import styled from 'styled-components'
import { Text, Link, Icon } from '@aura/safe-react-components'

const StyledIcon = styled(Icon)`
  svg {
    position: relative;
    top: 4px;
    left: 4px;
  }
`

const HelpInfo = (): ReactElement => (
  <Link href="https://aura.network/" target="_blank" rel="noreferrer" title="Export & import info">
    <Text size="xl" as="span" color="primary">
      Learn about the address book import and export
    </Text>
    <StyledIcon size="sm" type="externalLink" color="primary" />
  </Link>
)

export default HelpInfo
