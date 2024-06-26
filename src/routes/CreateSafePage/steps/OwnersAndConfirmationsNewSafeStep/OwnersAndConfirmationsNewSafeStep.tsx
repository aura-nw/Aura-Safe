import InputAdornment from '@material-ui/core/InputAdornment'
import MenuItem from '@material-ui/core/MenuItem'
import { Fragment, ReactElement, useEffect } from 'react'
import { useForm } from 'react-final-form'
import { useSelector } from 'react-redux'
import ButtonHelper from 'src/components/ButtonHelper'
import AddressInput from 'src/components/forms/AddressInput'
import SelectField from 'src/components/forms/SelectField'
import TextField from 'src/components/forms/TextField'
import {
  ADDRESS_INVALID_ERROR,
  ADDRESS_REPEATED_ERROR,
  composeValidators,
  minMaxLength,
  minValue,
  required,
  THRESHOLD_ERROR,
} from 'src/components/forms/validator'
import Block from 'src/components/layout/Block'
import Button from 'src/components/layout/Button'
import Col from 'src/components/layout/Col'
import Paragraph from 'src/components/layout/Paragraph'
import NetworkLabel from 'src/components/NetworkLabel/NetworkLabel'
import { ScanQRWrapper } from 'src/components/ScanQRModal/ScanQRWrapper'
import { useStepper } from 'src/components/Stepper/stepperContext'
import { currentNetworkAddressBookAsMap } from 'src/logic/addressBook/store/selectors'
import { providerNameSelector, userAccountSelector } from 'src/logic/wallets/store/selectors'
import { FIELD_MAX_OWNER_NUMBER, FIELD_NEW_SAFE_THRESHOLD, FIELD_SAFE_OWNERS_LIST } from '../../fields/createSafeFields'
import {
  BlockWithPadding,
  CheckIconAddressAdornment,
  FieldStyled,
  OwnerContainer,
  OwnerNameField,
  OwnersIconsContainer,
  ParagraphWithMargin,
  RowHeader,
  StyledParagraph,
} from './styles'

import { isValidAddress } from 'src/utils/isValidAddress'
import TrashIcon from '../../assets/trash-2.svg'

export const ownersAndConfirmationsNewSafeStepLabel = 'Owners and Confirmations'

function OwnersAndConfirmationsNewSafeStep(): ReactElement {
  const provider = useSelector(providerNameSelector)
  const userWalletAddress = useSelector(userAccountSelector)
  const { setCurrentStep } = useStepper()

  useEffect(() => {
    if (!provider) {
      setCurrentStep(0)
    }
  }, [provider, setCurrentStep])

  const createSafeForm = useForm()
  const addressBook = useSelector(currentNetworkAddressBookAsMap)

  const createSafeFormValues = createSafeForm.getState().values
  const formErrors = createSafeForm.getState().errors || {}

  const owners = createSafeFormValues[FIELD_SAFE_OWNERS_LIST]
  const threshold = createSafeFormValues[FIELD_NEW_SAFE_THRESHOLD]
  const maxOwnerNumber = createSafeFormValues[FIELD_MAX_OWNER_NUMBER]

  function onClickAddNewOwner() {
    const newEmptyOwner = {
      nameFieldName: `owner-name-${maxOwnerNumber}`,
      addressFieldName: `owner-address-${maxOwnerNumber}`,
    }
    createSafeForm.change(FIELD_SAFE_OWNERS_LIST, [...owners, newEmptyOwner])
    const updatedMaxOwnerNumbers = maxOwnerNumber + 1
    createSafeForm.change(FIELD_MAX_OWNER_NUMBER, updatedMaxOwnerNumbers)
  }

  function onClickRemoveOwner({ addressFieldName }) {
    const ownersUpdated = owners.filter((owner) => owner.addressFieldName !== addressFieldName)

    createSafeForm.change(FIELD_SAFE_OWNERS_LIST, ownersUpdated)

    const hasToUpdateThreshold = threshold > ownersUpdated.length

    if (hasToUpdateThreshold) {
      createSafeForm.change(FIELD_NEW_SAFE_THRESHOLD, threshold - 1)
    }
  }

  return (
    <>
      <BlockWithPadding data-testid={'create-safe-owners-confirmation-step'}>
        <ParagraphWithMargin color="textaura" noMargin size="lg">
          Your Safe will have one or more owners. We have prefilled the first owner with your connected wallet details.
        </ParagraphWithMargin>
        <Paragraph color="textaura" size="lg">
          Add additional owners (e.g. wallets of your teammates) and specify how many of them have to confirm a
          transaction before it gets executed. In general, the more confirmations required, the more secure your Safe
          is.{' '}
          {/* <StyledLink
            href="https://help.gnosis-safe.io/en/articles/4772567-what-gnosis-safe- setup-should-i-use"
            target="_blank"
            rel="noreferrer"
            title="Learn about which Safe setup to use"
          >
            <Text size="xl" as="span" color="primary">
              Learn about which Safe setup to use
            </Text>
            <Icon size="sm" type="externalLink" color="primary" />
          </StyledLink> */}
          The new Safe will ONLY be available on <NetworkLabel />
        </Paragraph>
      </BlockWithPadding>
      {/* <Hairline /> */}
      <RowHeader>
        <Col xs={3}>NAME</Col>
        <Col xs={7}>ADDRESS</Col>
      </RowHeader>
      {/* <Hairline /> */}
      <Block margin="md" padding="md">
        <RowHeader>
          {owners.map(({ nameFieldName, addressFieldName }, index) => {
            const hasOwnerAddressError = formErrors[addressFieldName]
            const showDeleteIcon = addressFieldName !== 'owner-address-0' // we hide de delete icon for the first owner
            const disbaleAddressInput =
              createSafeFormValues[addressFieldName] === userWalletAddress && Number(index) === 0

            const handleScan = (address: string, closeQrModal: () => void): void => {
              createSafeForm.change(addressFieldName, address)
              closeQrModal()
            }

            return (
              <Fragment key={addressFieldName}>
                <Col xs={3}>
                  <OwnerNameField
                    component={TextField}
                    name={nameFieldName}
                    placeholder="Owner Name"
                    text="Owner Name"
                    type="text"
                    validate={minMaxLength(0, 50)}
                    testId={nameFieldName}
                  />
                </Col>
                <Col xs={7}>
                  <AddressInput
                    disabled={disbaleAddressInput}
                    fieldMutator={(address) => {
                      createSafeForm.change(addressFieldName, address)
                      const addressName = addressBook[address]?.name
                      if (addressName) {
                        createSafeForm.change(nameFieldName, addressName)
                      }
                    }}
                    inputAdornment={
                      !hasOwnerAddressError && {
                        endAdornment: (
                          <InputAdornment position="end">
                            <CheckIconAddressAdornment data-testid={`${addressFieldName}-valid-adornment`} />
                          </InputAdornment>
                        ),
                      }
                    }
                    name={addressFieldName}
                    placeholder="Owner Address*"
                    text="Owner Address"
                    testId={addressFieldName}
                  />
                </Col>
                {!disbaleAddressInput && (
                  <OwnersIconsContainer xs={1} center="xs" middle="xs">
                    <ScanQRWrapper handleScan={handleScan} testId={`${addressFieldName}-scan-QR`} />
                  </OwnersIconsContainer>
                )}
                {showDeleteIcon && (
                  <OwnersIconsContainer xs={1} center="xs" middle="xs">
                    <ButtonHelper
                      onClick={() => onClickRemoveOwner({ addressFieldName })}
                      dataTestId={`${addressFieldName}-remove-button`}
                    >
                      <img src={TrashIcon} alt="Trash Icon" />
                    </ButtonHelper>
                  </OwnersIconsContainer>
                )}
              </Fragment>
            )
          })}
        </RowHeader>

        <div style={{ paddingLeft: '24px' }}>
          <OwnerContainer align="center" grow>
            <Button color="secondary" data-testid="add-new-owner" onClick={onClickAddNewOwner}>
              <Paragraph noMargin size="smd" weight="bolder" color="green">
                + Add another owner
              </Paragraph>
            </Button>
          </OwnerContainer>
        </div>

        <BlockWithPadding>
          <Block>
            <Paragraph color="textaura">Any transaction requires the confirmation of:</Paragraph>
          </Block>
          <OwnerContainer align="center" grow>
            <Col xs={1}>
              <FieldStyled
                component={SelectField}
                data-testid="threshold-selector-input"
                name={FIELD_NEW_SAFE_THRESHOLD}
                validate={composeValidators(required, minValue(1))}
                color="white"
              >
                {owners.map((_, option) => (
                  <MenuItem
                    key={`threshold-selector-option-${option}`}
                    value={option + 1}
                    data-testid={`threshold-selector-option-${option + 1}`}
                    color="white"
                  >
                    {option + 1}
                  </MenuItem>
                ))}
              </FieldStyled>
            </Col>
            <Col xs={11}>
              <StyledParagraph noMargin>out of {owners.length} owner(s)</StyledParagraph>
            </Col>
          </OwnerContainer>
        </BlockWithPadding>
      </Block>
    </>
  )
}

export default OwnersAndConfirmationsNewSafeStep

export const ownersAndConfirmationsNewSafeStepValidations = (values: {
  [FIELD_SAFE_OWNERS_LIST]: Array<Record<string, string>>
  [FIELD_NEW_SAFE_THRESHOLD]: number
}): Record<string, string> => {
  const errors = {}

  const owners = values[FIELD_SAFE_OWNERS_LIST]
  const threshold = values[FIELD_NEW_SAFE_THRESHOLD]
  const addresses = owners.map(({ addressFieldName }) => values[addressFieldName])

  // we check repeated addresses
  owners.forEach(({ addressFieldName }, index) => {
    const address = values[addressFieldName]
    const previousOwners = addresses.slice(0, index)
    const isRepeated = previousOwners.includes(address)

    const isValid = isValidAddress(address)

    if (!isValid) {
      errors[addressFieldName] = ADDRESS_INVALID_ERROR
    } else if (isRepeated) {
      errors[addressFieldName] = ADDRESS_REPEATED_ERROR
    }
  })

  const isValidThreshold = !!threshold && threshold <= owners.length
  if (!isValidThreshold) {
    errors[FIELD_NEW_SAFE_THRESHOLD] = THRESHOLD_ERROR
  }

  return errors
}
