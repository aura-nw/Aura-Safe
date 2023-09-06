import { ReactElement } from 'react'
import styled from 'styled-components'
import notiIcon from 'src/pages/Staking/assets/notiLinear.svg'

const NotificationPopupStyled = styled.div`
  border: 1px solid #363843;
  box-shadow: 0px 64px 64px -48px rgba(15, 15, 15, 0.1);
  border-radius: 20px;
  background: rgba(36, 38, 46, 0.5);
  padding: 16px;
  gap: 12px;
  display: flex;
  align-items: flex-start;
`

const IconStyled = styled.img`
  width: 24px;
  height: 24px;
`

function NotificationPopup(props): ReactElement {
  const { children } = props

  return (
    <NotificationPopupStyled>
      <IconStyled src={notiIcon} />
      {children}
    </NotificationPopupStyled>
  )
}

export default NotificationPopup
