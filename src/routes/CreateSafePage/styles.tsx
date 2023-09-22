import styled from 'styled-components'
import IconButton from '@material-ui/core/IconButton'
import { sm, boldFont, borderLinear } from 'src/theme/variables'
import { Text } from '@aura/safe-react-components'
import Button from 'src/components/layout/Button'

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`

const BackIcon = styled(IconButton)`
  color: #98989b;
  padding: ${sm};
  margin-right: 5px;
`
const EmphasisLabel = styled.span`
  font-weight: ${boldFont};
`

const StyledBorder = styled.div`
  border-radius: 50px !important;
  border: 2px solid transparent;
  background-image: ${borderLinear};
  background-origin: border-box;
  background-clip: content-box, border-box;
`

const StyledButtonBorder = styled(Button)`
  background-color: rgba(18, 18, 18, 1) !important;
  border-radius: 50px !important;
`

const StyledButtonLabel = styled(Text)`
  color: white;
  background-color: transparent !important;
`

export { LoaderContainer, BackIcon, EmphasisLabel, StyledButtonBorder, StyledBorder, StyledButtonLabel }
