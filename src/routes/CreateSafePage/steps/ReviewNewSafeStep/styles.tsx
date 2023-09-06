import { createStyles } from '@material-ui/core'
import Block from 'src/components/layout/Block'
import Paragraph from 'src/components/layout/Paragraph'
import Row from 'src/components/layout/Row'
import { border, lg, sm } from 'src/theme/variables'
import styled from 'styled-components'

const DetailsContainer = styled(Block)`
  padding: ${lg};
  // border-right: solid 1px ${border};
  height: 100%;
  width: 100%;
`

const SafeNameParagraph = styled(Paragraph)`
  text-overflow: ellipsis;
  overflow: hidden;
`
const TitleContainer = styled(Block)`
  padding-left: ${lg};
`

const OwnersAddressesContainer = styled(Row)`
  align-items: center;
  min-width: fit-content;
  padding: ${sm};
  padding-left: ${lg};
`
const DescriptionContainer = styled(Row)`
  background-color: rgba(29, 29, 31, 1);
  padding: ${lg};
  text-align: left;
  margin: 8px;
  border-radius: 8px;
  display: flex;
  width: auto;
`
const styles = (theme) =>
  createStyles({
    containerListOwner: {
      backgroundColor: 'rgba(29, 29, 31, 1)',
      padding: '10px 0 0 0',
      margin: 0,
      width: '98%',
      marginLeft: 8,
      borderRadius: 8,
    },
  })

export { DescriptionContainer, DetailsContainer, OwnersAddressesContainer, SafeNameParagraph, TitleContainer, styles }
