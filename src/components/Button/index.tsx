import { Button } from '@aura/safe-react-components'
import styled from 'styled-components'
import { borderLinear } from 'src/theme/variables'

export const OutlinedButton = ({ children, ...rest }) => {
  return (
    <OutlinedButtonWrap {...rest}>
      <div>{children}</div>
    </OutlinedButtonWrap>
  )
}
const OutlinedButtonWrap = styled.button<{ disabled?: boolean }>`
  cursor: pointer;
  border: 1px solid transparent;
  background-image: ${borderLinear};
  background-origin: border-box;
  background-clip: content-box, border-box;
  background-color: transparent !important;
  padding: 0 !important;
  border-radius: 8px;
  font-weight: 400;
  font-family: 'Inter';
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  letter-spacing: 0.01em;
  color: #fff;
  white-space: nowrap;

  &:disabled {
    cursor: not-allowed;
    pointer-events: unset;
    color: #717582;
    background-image: linear-gradient(rgba(19, 20, 25, 1), rgba(19, 20, 25, 1)),
      linear-gradient(108.46deg, #23534b 12.51%, #45475b 51.13%, #5c4326 87.49%);
    > div {
      background: #131419;
    }
  }
  > div {
    padding: 10px 24px;
    border-radius: 8px;
    display: flex;
    > i,
    img,
    svg,
    .icon {
      margin: 0px 8px 0px 0px;
    }
  }

  &:hover {
    > div {
      background: linear-gradient(0deg, rgba(0, 0, 0, 0.64), rgba(0, 0, 0, 0.64)),
        linear-gradient(113.1deg, #5ee6d0 13.45%, #bfc6ff 50.33%, #ffba69 85.05%);
    }
  }
  &:active {
    > div {
      background: linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
        linear-gradient(113.1deg, #5ee6d0 13.45%, #bfc6ff 50.33%, #ffba69 85.05%);
    }
  }

  &.small {
    font-size: 12px;
    line-height: 16px;
    > div {
      padding: 8px 16px;
      border-radius: 8px;
      > i,
      img,
      svg,
      .icon {
        margin: 0px 6px 0px 0px;
      }
    }
  }
`
export const OutlinedNeutralButton = ({ children, ...rest }) => {
  return (
    <OutlinedNeutralButtonWrap {...rest}>
      <div>{children}</div>
    </OutlinedNeutralButtonWrap>
  )
}
const OutlinedNeutralButtonWrap = styled.button<{ disabled?: boolean; color?: string }>`
  background: transparent;
  cursor: pointer;
  padding: 0 !important;
  border: 1px solid ${(props) => (props.color ? props.color : '#717582')};
  border-radius: 8px;
  font-weight: 400;
  font-family: 'Inter';
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  letter-spacing: 0.01em;
  color: ${(props) => (props.color ? props.color : '#fff')};
  white-space: nowrap;

  &:disabled {
    cursor: not-allowed;
    pointer-events: unset;
    color: #717582;
    > div {
      background: #131419;
    }
  }
  > div {
    padding: 10px 24px;
    border-radius: 8px;
    display: flex;
    > i,
    img,
    svg,
    .icon {
      margin: 0px 8px 0px 0px;
    }
  }

  &:not(:disabled)&:hover {
    > div {
      background: #363843;
    }
  }
  &:active {
    > div {
      background: #24262e;
    }
  }

  &.small {
    font-size: 12px;
    line-height: 16px;
    > div {
      padding: 8px 16px;
      border-radius: 8px;
      > i,
      img,
      svg,
      .icon {
        margin: 0px 6px 0px 0px;
      }
    }
  }
`

export const TextButton = styled(Button)`
  border: none;
  padding: 0 !important;
  min-width: 130px !important;
  background-color: transparent !important;
  box-shadow: none !important;
`
export const LinkButton = styled.button`
  border: none;
  padding: 0 !important;
  background-color: transparent !important;
  box-shadow: none !important;
  color: #2bbba3;
  cursor: pointer;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
`
export const FilledButton = styled.button<{ disabled?: boolean }>`
  cursor: pointer;
  background: linear-gradient(113.1deg, #5ee6d0 13.45%, #bfc6ff 50.33%, #ffba69 85.05%);
  border-radius: 8px;
  font-weight: 400;
  font-family: 'Inter';
  font-size: 16px;
  line-height: 20px;
  padding: 10px 24px;
  text-align: center;
  letter-spacing: 0.01em;
  color: #131419;
  border: none;
  white-space: nowrap;
  > i,
  img,
  svg,
  .icon {
    margin: 0px -14px;
  }
  &:disabled {
    cursor: not-allowed;
    pointer-events: unset;
    background: #494c58;
  }
  &:not(:disabled)&:hover {
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.44), rgba(255, 255, 255, 0.44)),
      linear-gradient(113.1deg, #5ee6d0 13.45%, #bfc6ff 50.33%, #ffba69 85.05%);
  }
  &:not(:disabled):active {
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.24), rgba(0, 0, 0, 0.24)),
      linear-gradient(94.25deg, #5ee6d0 4.18%, #bfc6ff 50.06%, #ffba69 93.26%);
  }
  &.loading {
    pointer-events: unset;
    cursor: wait;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.24), rgba(0, 0, 0, 0.24)),
      linear-gradient(94.25deg, #5ee6d0 4.18%, #bfc6ff 50.06%, #ffba69 93.26%);
    > div > div:nth-child(2) {
      border-color: #24262e #24262e #24262e transparent;
    }
  }
  &.small {
    font-size: 12px;
    line-height: 16px;
    padding: 8px 16px;
    > i,
    img,
    svg,
    .icon {
      margin: 0px -8px;
    }
  }
`
