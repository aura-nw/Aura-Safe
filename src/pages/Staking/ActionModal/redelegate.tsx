import { Text } from '@aura/safe-react-components'
import { useEffect, useRef } from 'react'
import Gap from 'src/components/Gap'
import AmountInput from 'src/components/Input/AmountInput'
import Col from 'src/components/layout/Col'
import { formatBigNumber, formatNativeCurrency } from 'src/utils'
import SelectValidator from '../SelectValidator'
import {
  BorderAura,
  BorderInput,
  BoxDelegate,
  InputAura,
  PaddingPopup,
  StyledButtonModal,
  StyledInputModal,
  TextDisable,
  TextGray,
} from './styles'

export default function ModalRedelegate(props) {
  const {
    arrRedelegate,
    handleChangeRedelegate,
    valueDelegate,
    handleDelegatedAmount,
    nativeCurrency,
    handleMax,
    amount,
    dataDelegateOfUser,
    validateMsg,
  } = props
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    inputRef?.current?.focus()
  }, [inputRef])
  return (
    <>
      <Col sm={12} xs={12} layout="column">
        <BoxDelegate style={{ marginBottom: 24 }}>
          <PaddingPopup>
            <Col sm={7} xs={12}>
              <p>Redelegate to:</p>
            </Col>
            <SelectValidator
              arrRedelegate={arrRedelegate}
              handleChangeRedelegate={handleChangeRedelegate}
              valueDelegate={valueDelegate}
            />
          </PaddingPopup>
        </BoxDelegate>

        <BoxDelegate>
          <PaddingPopup>
            <Col sm={7} xs={12}>
              <p>
                Available for redelegation{'  '}
                <strong>
                  {formatNativeCurrency(
                    formatBigNumber(dataDelegateOfUser?.delegation?.delegationBalance?.amount || 0),
                  )}
                </strong>
              </p>
            </Col>
            <Gap height={8} />
            <AmountInput
              handleMax={() =>
                handleMax(formatBigNumber(dataDelegateOfUser?.delegation?.delegationBalance?.amount || 0))
              }
              onChange={handleDelegatedAmount}
              value={amount}
              autoFocus={true}
              placeholder="Amount to redelegate"
            />

            {validateMsg && <p className="validate-msg">{validateMsg}</p>}
          </PaddingPopup>
        </BoxDelegate>
      </Col>
    </>
  )
}
