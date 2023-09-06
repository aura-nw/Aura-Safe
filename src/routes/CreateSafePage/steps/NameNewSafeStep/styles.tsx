import styled from 'styled-components'
import { lg } from 'src/theme/variables'
import Block from 'src/components/layout/Block'

const BlockWithPadding = styled(Block)`
  padding: ${lg};
`

const FieldContainer = styled(Block)`
  display: flex;
  max-width: 480px;
  margin-top: 12px;
`

export { BlockWithPadding, FieldContainer }
