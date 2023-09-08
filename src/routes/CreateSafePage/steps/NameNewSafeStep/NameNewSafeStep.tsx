import { ReactElement, useEffect } from 'react'
import { useForm } from 'react-final-form'
import { useSelector } from 'react-redux'
import NetworkLabel from 'src/components/NetworkLabel/NetworkLabel'
import { useStepper } from 'src/components/Stepper/stepperContext'
import Field from 'src/components/forms/Field'
import TextField from 'src/components/forms/TextField'
import { minMaxLength } from 'src/components/forms/validator'
import Block from 'src/components/layout/Block'
import Col from 'src/components/layout/Col'
import Paragraph from 'src/components/layout/Paragraph'
import { providerNameSelector } from 'src/logic/wallets/store/selectors'
import { FIELD_CREATE_CUSTOM_SAFE_NAME } from '../../fields/createSafeFields'
import { BlockWithPadding, FieldContainer } from './styles'

export const nameNewSafeStepLabel = 'Name'

function NameNewSafeStep(): ReactElement {
  const provider = useSelector(providerNameSelector)

  const { setCurrentStep } = useStepper()

  useEffect(() => {
    if (!provider) {
      setCurrentStep(0)
    }
  }, [provider, setCurrentStep])

  const createNewSafeForm = useForm()

  const formValues = createNewSafeForm.getState().values

  return (
    <BlockWithPadding data-testid={'create-safe-name-step'}>
      <Block margin="md">
        <Paragraph color="textaura" noMargin size="lg">
          You are about to create a new Safe with one or more owners. First, let&apos;s give your new wallet a name.
          This name is only stored locally and will never be shared with Pyxis Safe or any third parties. The new Safe
          will ONLY be available on <NetworkLabel />
        </Paragraph>
      </Block>
      <label htmlFor={FIELD_CREATE_CUSTOM_SAFE_NAME} style={{ color: '#E6E7E8' }}>
        Name of the new Safe
      </label>
      <FieldContainer margin="lg">
        <Col xs={11}>
          <Field
            component={TextField}
            name={FIELD_CREATE_CUSTOM_SAFE_NAME}
            text="Safe name"
            type="text"
            testId="create-safe-name-field"
            validate={minMaxLength(0, 50)}
          />
        </Col>
      </FieldContainer>
      <Block margin="lg">
        <Paragraph color="descriptionAura" noMargin size="lg">
          By continuing you consent with our terms of use and privacy policy. All assets inside the Safe are in total
          control of Safe owners and cannot be accessed by Pyxis Safe at any point.
        </Paragraph>
      </Block>
    </BlockWithPadding>
  )
}

export default NameNewSafeStep
