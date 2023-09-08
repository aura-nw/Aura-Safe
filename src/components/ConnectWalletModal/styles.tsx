import styled from 'styled-components'
import { lg } from '../../theme/variables'
import Row from '../layout/Row'

const WalletList = styled.div`
  height: fit-content;
  padding: ${lg};
`

const ImageContainer = styled(Row)`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const ImageItem = styled.div`
  width: 30%;
  display: flex;
  align-items: center;
  /* justify-content: center; */
  border-radius: 40px;
  cursor: pointer;
  padding: 0.625em 1.25em;
  margin-bottom: 2rem;

  transition: box-shadow 150ms ease-in-out, background 200ms ease-in-out;
  transition: opacity 200ms;

  &:hover {
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
  }
`
const ImageTitle = styled.span`
  margin-left: 0.66em;
  font-size: 18px;
  font-weight: bold;
  text-align: left;
`

export { ImageContainer, ImageItem, ImageTitle, WalletList }
