import styled from 'styled-components'
import MuiTextField from '@material-ui/core/TextField'
import React from 'react'
import { colorLinear } from 'src/theme/variables'
import { formatNumber, isNumberKeyPress, validateFloatNumber } from 'src/utils'
import { InputAdornment } from '@material-ui/core'
import { FilledButton } from 'src/components/Button'
import { getNativeCurrency } from 'src/config'

export const StyledTextField = styled(MuiTextField)`
  width: 100%;
  > label {
    z-index: 1;
    font-size: 14px;
    transform: translate(12px, 18px) scale(1);
  }
  .MuiInputLabel-filled.MuiInputLabel-shrink {
    transform: translate(12px, 8px) scale(0.85);
    height: 16px;
  }
  .MuiInputLabel-filled.MuiInputLabel-shrink.Mui-focused {
    color: #5ee6d0;
  }
  > div {
    background: #24262e;
    border: 1px solid #494c58;
    color: #fff;
    border-radius: 8px;
    overflow: hidden;

    &:hover {
      background: #24262e;
    }
  }
  > div.Mui-focused {
    background: linear-gradient(#24262e, #24262e) padding-box, ${colorLinear} border-box;
    border: 1px solid transparent;
  }
  input {
    color: #fff;
    padding: 14px 16px;
    height: 18px;
    font-size: 14px;
  }
  > div::after,
  > div::before {
    display: none;
  }
  .denom {
    margin-left: 8px;
    color: #fff;
    background: #363843;
    height: 18px;
    margin-right: -12px;
    padding: 14px 8px;
  }
`
export default function AmountInput({
  value,
  onChange,
  type = 'number',
  autoFocus,
  handleMax,
  placeholder = 'Amount',
}: {
  value: any
  onChange: (value: string) => void
  handleMax: () => void
  type?: React.HTMLInputTypeAttribute
  autoFocus?: boolean
  placeholder?: string
}) {
  const nativeCurrency = getNativeCurrency()
  return (
    <StyledTextField
      autoFocus={autoFocus}
      variant="filled"
      type={type}
      placeholder={placeholder}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <FilledButton className="small" onClick={handleMax}>
              Max
            </FilledButton>
            <div className="denom">{nativeCurrency.symbol}</div>
          </InputAdornment>
        ),
      }}
      value={value}
      onKeyPress={type == 'number' ? isNumberKeyPress : undefined}
      inputProps={type == 'number' ? { inputMode: 'numeric', pattern: '[0-9]*', step: '0.0000001' } : {}}
      onChange={(event) =>
        type == 'number' ? onChange(formatNumber(event.target.value)) : onChange(event.target.value)
      }
    />
  )
}
