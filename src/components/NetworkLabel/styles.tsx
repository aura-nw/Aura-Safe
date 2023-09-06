import { extraSmallFontSize, sm, xs } from 'src/theme/variables'
import styled from 'styled-components'

type StyledLabelTypes = {
  backgroundColor: string
  textColor: string
  onClick?: () => void
  flexGrow?: boolean
}

const StyledLabel = styled.span<StyledLabelTypes>`
  position: relative;
  bottom: 2px;
  line-height: normal;
  display: inline-block;
  min-width: 70px;
  font-size: ${extraSmallFontSize};
  padding: ${xs} ${sm};
  background-color: #5ee6d0;
  color: black;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'inherit')};
  text-align: center;
  border-radius: 3px;
  text-transform: capitalize;
  flex-grow: ${({ flexGrow }) => (flexGrow ? 1 : 'initial')};
`
export { StyledLabel }
