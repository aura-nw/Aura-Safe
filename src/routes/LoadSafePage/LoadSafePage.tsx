import { ReactElement, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import StepperForm, { StepFormElement } from 'src/components/StepperForm/StepperForm'
import Block from 'src/components/layout/Block'
import Heading from 'src/components/layout/Heading'
import Page from 'src/components/layout/Page'
import Row from 'src/components/layout/Row'
import { getShortName } from 'src/config'
import { AddressBookEntry, makeAddressBookEntry } from 'src/logic/addressBook/model/addressBook'
import { addressBookSafeLoad } from 'src/logic/addressBook/store/actions'
import { currentNetworkAddressBookAsMap } from 'src/logic/addressBook/store/selectors'
import { currentChainId } from 'src/logic/config/store/selectors'
import { useMnemonicSafeName } from 'src/logic/hooks/useMnemonicName'
import { addOrUpdateSafe } from 'src/logic/safe/store/actions/addOrUpdateSafe'
import { buildMSafe } from 'src/logic/safe/store/actions/fetchSafe'
import { loadStoredSafes, saveSafes } from 'src/logic/safe/utils'
import ArrowBack from '../CreateSafePage/assets/arrow-left.svg'
import { LOAD_SPECIFIC_SAFE_ROUTE, SAFE_ROUTES, extractPrefixedSafeAddress, generateSafeRoute } from '../routes'
import {
  FIELD_LOAD_IS_LOADING_SAFE_ADDRESS,
  FIELD_LOAD_SAFE_ADDRESS,
  FIELD_LOAD_SAFE_ID,
  FIELD_LOAD_SUGGESTED_SAFE_NAME,
  FIELD_SAFE_OWNER_LIST,
  LoadSafeFormValues,
} from './fields/loadFields'
import { getLoadSafeName } from './fields/utils'
import LoadSafeAddressStep, {
  loadSafeAddressStepLabel,
  loadSafeAddressStepValidations,
} from './steps/LoadSafeAddressStep/LoadSafeAddressStep'
import LoadSafeOwnersStep, { loadSafeOwnersStepLabel } from './steps/LoadSafeOwnersStep/LoadSafeOwnersStep'
import ReviewLoadStep, { reviewLoadStepLabel } from './steps/ReviewLoadStep/ReviewLoadStep'
import SelectNetworkStep, { selectNetworkStepLabel } from './steps/SelectNetworkStep/SelectNetworkStep'
import { BackIcon } from './styles'

function Load(): ReactElement {
  const dispatch = useDispatch()
  const history = useHistory()
  const { safeAddress, shortName, safeId } = extractPrefixedSafeAddress(undefined, LOAD_SPECIFIC_SAFE_ROUTE)
  const safeRandomName = useMnemonicSafeName()
  const [initialFormValues, setInitialFormValues] = useState<LoadSafeFormValues>()
  const addressBook = useSelector(currentNetworkAddressBookAsMap)
  const chainId = useSelector(currentChainId)

  useEffect(() => {
    const initialValues: LoadSafeFormValues = {
      [FIELD_LOAD_SUGGESTED_SAFE_NAME]: safeRandomName,
      [FIELD_LOAD_SAFE_ADDRESS]: safeAddress,
      [FIELD_LOAD_IS_LOADING_SAFE_ADDRESS]: false,
      [FIELD_SAFE_OWNER_LIST]: [],
      [FIELD_LOAD_SAFE_ID]: safeId,
    }
    setInitialFormValues(initialValues)
  }, [safeAddress, safeRandomName])

  const updateAddressBook = (values: LoadSafeFormValues) => {
    const ownerList = values[FIELD_SAFE_OWNER_LIST] as AddressBookEntry[]

    const ownerEntries = ownerList
      .map((owner) => {
        const ownerFieldName = `owner-address-${owner.address}`
        const ownerNameValue = values[ownerFieldName]
        return {
          ...owner,
          name: ownerNameValue,
        }
      })
      .filter((owner) => !!owner.name)

    const safeEntry = makeAddressBookEntry({
      address: values[FIELD_LOAD_SAFE_ADDRESS] || '',
      name: getLoadSafeName(values, addressBook),
      chainId,
    })

    dispatch(addressBookSafeLoad([...ownerEntries, safeEntry]))
  }

  const onSubmitLoadSafe = async (values: LoadSafeFormValues): Promise<void> => {
    const address = values[FIELD_LOAD_SAFE_ADDRESS]
    const id = values[FIELD_LOAD_SAFE_ID]
    if (!address || !id) {
      return
    }
    updateAddressBook(values)
    const safeProps = await buildMSafe(String(address), id)
    // const checksummedAddress = checksumAddress(address || '')
    // const safeProps = await buildSafe(checksummedAddress)
    const storedSafes = loadStoredSafes() || {}
    storedSafes[String(address)] = safeProps
    saveSafes(storedSafes)
    dispatch(addOrUpdateSafe(safeProps))

    // Go to the newly added Safe
    history.push(
      generateSafeRoute(SAFE_ROUTES.ASSETS_BALANCES, {
        shortName: getShortName(),
        safeAddress: String(address),
        safeId: safeProps.safeId,
      }),
    )
  }

  return (
    <Page>
      <Block>
        <Row align="center">
          <BackIcon disableRipple onClick={history.goBack}>
            <img src={ArrowBack} alt="Safe Aura" />
          </BackIcon>
          <Heading tag="h2">Add existing Safe</Heading>
        </Row>

        {/* key={safeAddress} ensures that it goes to step 1 when the address changes */}
        <StepperForm
          initialValues={initialFormValues}
          testId="load-safe-form"
          onSubmit={onSubmitLoadSafe}
          key={safeAddress}
        >
          {safeAddress && safeId ? null : (
            <StepFormElement label={selectNetworkStepLabel} nextButtonLabel="Continue">
              <SelectNetworkStep />
            </StepFormElement>
          )}
          <StepFormElement label={loadSafeAddressStepLabel} validate={loadSafeAddressStepValidations}>
            <LoadSafeAddressStep />
          </StepFormElement>
          <StepFormElement label={loadSafeOwnersStepLabel} nextButtonLabel="Continue">
            <LoadSafeOwnersStep />
          </StepFormElement>
          <StepFormElement label={reviewLoadStepLabel} nextButtonLabel="Add">
            <ReviewLoadStep />
          </StepFormElement>
        </StepperForm>
      </Block>
    </Page>
  )
}

export default Load
