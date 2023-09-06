import styled from 'styled-components'

const ImgStyled = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%50%;
`
const HeaderPopup = styled.div`
  display: flex;
`

const HeaderContainer = styled.div`
  display: flex;
  align-items: end;
`

const BoxImgStyled = styled.div`
  align-self: center;
  margin-left: 10px;
  > p {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(108.46deg, #5ee6d0 12.51%, #bfc6ff 51.13%, #ffba69 87.49%);
    margin: 0px;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

const BoxVotingPower = styled.div`
  margin-left: 40px;
`

const TextPower = styled.div`
  font-size: 16px;
  color: #868a97;
  font-weight: 400;
`

const TextDelegators = styled.div`
  font-size: 16px;
  color: #868a97;
  margin-top: 8px;
  font-weight: 400;
`
const Commission = styled.div`
  font-weight: 510;
  font-size: 16px;
`

const StyleDivider = styled.hr`
  background-color: #363843 !important;
  margin-top: 24px;
  margin-bottom: 24px;
  width: 100%;
  height: 1px;
  border: none;
`

const TextNotiStyled = styled.div`
  color: #868a97;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.01em;
`

const TextGray = styled.span`
  color: #ccd0d5;
`

const TextDelegateNoti = styled.span`
  color: #e5e7ea;
`

const BoxDelegate = styled.div`
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  p {
    margin: 0;
  }
`

const FotterModal = styled.div`
  display: flex;
  margin-top: 10px;
  justify-content: flex-end;
`

const TextTitleStaking = styled.div`
  color: #e5e7ea;
  font-weight: 510;
  font-size: 16px;
`

const PaddingPopup = styled.div`
  width: 100%;
  > .validate-msg {
    color: #ff3535;
    font-size: 12px;
    margin: 6px 0px;
  }
`

const StyledInputModal = styled.input`
  background: transparent;
  border: none;
  color: white;
  outline: none;
  border: none;
  flex: 1;
`

const StyledButtonModal = styled.button`
  background: #717582;
  border-radius: 2px;
  padding: 6px 16px;
  font-weight: 510;
  font-size: 14px;
  color: white;
  cursor: pointer;
  border: none;
`

const BorderInput = styled.div`
  border: 1px solid #363843;
  width: 100%;
  padding: 10px;
  display: flex;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  border-right: none;
`

const BorderAura = styled.div`
  border: 1px solid #363843;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
`

const InputAura = styled.div`
  margin-top: 10px;
  display: flex;
  width: 100%;
`

const TextDisable = styled.span`
  color: #e5e7ea;
`
const Wrapper = styled.div`
  padding: 24px;
  width: 720px;
  min-height: 200px;
  box-sizing: border-box;
`
export {
  BorderAura,
  BorderInput,
  BoxDelegate,
  BoxImgStyled,
  BoxVotingPower,
  Commission,
  FotterModal,
  HeaderContainer,
  HeaderPopup,
  ImgStyled,
  InputAura,
  PaddingPopup,
  StyleDivider,
  StyledButtonModal,
  StyledInputModal,
  TextDelegateNoti,
  TextDelegators,
  TextDisable,
  TextGray,
  TextNotiStyled,
  TextPower,
  TextTitleStaking,
  Wrapper,
}
