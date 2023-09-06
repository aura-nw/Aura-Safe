import { ReactElement } from 'react'
import styled from 'styled-components'

const CloseButtonStyled = styled.button`
  font-size: 14px;
  padding: 8px 20px;
  border: 1px solid #5c606d;
  border-radius: 20px;
  background-color: transparent;
  color: white;
  height: 32px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`

function CloseButton(props): ReactElement {
  const { title, onClick } = props

  return <CloseButtonStyled onClick={onClick}>{title}</CloseButtonStyled>
}

export default CloseButton
