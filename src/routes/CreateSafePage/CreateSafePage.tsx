import { ReactElement, useState, useEffect } from 'react'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import queryString from 'query-string'
import { useLocation } from 'react-router'
import { GenericModal, Loader } from '@gnosis.pm/safe-react-components'

import Page from 'src/components/layout/Page'
import Block from 'src/components/layout/Block'
import Row from 'src/components/layout/Row'
import Heading from 'src/components/layout/Heading'
import { generateSafeRouteWithChainId, history, SAFE_ROUTES } from 'src/routes/routes'
import { sm, secondary, boldFont } from 'src/theme/variables'
import StepperForm, { StepFormElement } from 'src/components/StepperForm/StepperForm'
import NameNewSafeStep, { nameNewSafeStepLabel } from './steps/NameNewSafeStep'
import {
  CreateSafeFormValues,
  FIELD_CREATE_CUSTOM_SAFE_NAME,
  FIELD_CREATE_SUGGESTED_SAFE_NAME,
  FIELD_MAX_OWNER_NUMBER,
  FIELD_NEW_SAFE_PROXY_SALT,
  FIELD_NEW_SAFE_THRESHOLD,
  FIELD_SAFE_OWNERS_LIST,
} from './fields/createSafeFields'
import { useMnemonicSafeName } from 'src/logic/hooks/useMnemonicName'
import { providerNameSelector, shouldSwitchWalletChain, userAccountSelector } from 'src/logic/wallets/store/selectors'
import OwnersAndConfirmationsNewSafeStep, {
  ownersAndConfirmationsNewSafeStepLabel,
  ownersAndConfirmationsNewSafeStepValidations,
} from './steps/OwnersAndConfirmationsNewSafeStep'
import { currentNetworkAddressBookAsMap } from 'src/logic/addressBook/store/selectors'
import ReviewNewSafeStep, { reviewNewSafeStepLabel } from './steps/ReviewNewSafeStep'
import SelectWalletAndNetworkStep, { selectWalletAndNetworkStepLabel } from './steps/SelectWalletAndNetworkStep'

import { createMSafe, ISafeCreate } from 'src/services'
import { getInternalChainId, _getChainId } from 'src/config'
import { parseToAdress } from 'src/utils/parseByteAdress'
import Paragraph from 'src/components/layout/Paragraph'
import NetworkLabel from 'src/components/NetworkLabel/NetworkLabel'
import Button from 'src/components/layout/Button'
import { buildMSafe } from '../../logic/safe/store/actions/fetchSafe'
import { SafeStatus } from '../../logic/safe/hooks/useOwnerSafes'
import { addOrUpdateSafe } from '../../logic/safe/store/actions/addOrUpdateSafe'
import { makeAddressBookEntry } from '../../logic/addressBook/model/addressBook'
import { addressBookSafeLoad } from '../../logic/addressBook/store/actions'
import { useAnalytics, USER_EVENTS } from '../../utils/googleAnalytics'
import { MESSAGES_CODE } from '../../services/constant/message'
import enqueueSnackbar from '../../logic/notifications/store/actions/enqueueSnackbar'
import { enhanceSnackbarForAction, ERROR, NOTIFICATIONS } from '../../logic/notifications'

type ModalDataType = {
  safeAddress: string
  safeId?: number
}

function CreateSafePage(): ReactElement {
  const dispatch = useDispatch()
  // const [safePendingToBeCreated, setSafePendingToBeCreated] = useState<CreateSafeFormValues>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [showCreatedModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState<ModalDataType>({ safeAddress: '' })

  const providerName = useSelector(providerNameSelector)
  const isWrongNetwork = useSelector(shouldSwitchWalletChain)
  const provider = !!providerName && !isWrongNetwork
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    const checkIfSafeIsPendingToBeCreated = async (): Promise<void> => {
      setIsLoading(true)

      // Removing the await completely is breaking the tests for a mysterious reason
      // @TODO: remove the promise
      // const safePendingToBeCreated = await Promise.resolve(
      //   loadFromStorage<CreateSafeFormValues>(SAFE_PENDING_CREATION_STORAGE_KEY),
      // )

      // if (provider) {
      //   await instantiateSafeContracts()
      //   setSafePendingToBeCreated(safePendingToBeCreated)
      // }
      setIsLoading(false)
    }
    checkIfSafeIsPendingToBeCreated()
  }, [provider])

  const userWalletAddress = useSelector(userAccountSelector)
  const addressBook = useSelector(currentNetworkAddressBookAsMap)
  const location = useLocation()
  const safeRandomName = useMnemonicSafeName()

  const showSafeCreationProcess = async (newSafeFormValues: CreateSafeFormValues): Promise<void> => {
    // saveToStorage(SAFE_PENDING_CREATION_STORAGE_KEY, { ...newSafeFormValues })

    const payload = await makeSafeCreate(userWalletAddress, newSafeFormValues)

    const { ErrorCode, Data: safeData, Message } = await createMSafe(payload)

    if (ErrorCode === MESSAGES_CODE.SUCCESSFUL.ErrorCode) {
      trackEvent(USER_EVENTS.CREATE_SAFE)

      if (safeData.status === SafeStatus.Created) {
        const { safeAddress, id } = safeData
        const safeProps = await buildMSafe(String(safeAddress), id)

        updateAddressBook(safeAddress, newSafeFormValues)
        await dispatch(addOrUpdateSafe(safeProps))

        setModalData({
          safeAddress,
          safeId: id,
        })
      }
      setShowModal(true)
    } else {
      if (ErrorCode === MESSAGES_CODE.E017.ErrorCode) {
        dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.SAFE_CREATION_DUPLICATED)))
      } else {
        dispatch(
          enqueueSnackbar(
            enhanceSnackbarForAction({
              message: Message,
              options: { variant: ERROR, persist: false, autoHideDuration: 5000 },
            }),
          ),
        )
      }
    }
    // setSafePendingToBeCreated(newSafeFormValues)
  }

  const updateAddressBook = async (newAddress: string, formValues: CreateSafeFormValues) => {
    const chainId = _getChainId()
    const defaultSafeValue = formValues[FIELD_CREATE_SUGGESTED_SAFE_NAME]
    const name = formValues[FIELD_CREATE_CUSTOM_SAFE_NAME] || defaultSafeValue

    const ownersAddressBookEntry = formValues[FIELD_SAFE_OWNERS_LIST].map(({ nameFieldName, addressFieldName }) =>
      makeAddressBookEntry({
        address: newAddress || formValues[addressFieldName],
        name: name || formValues[nameFieldName],
        chainId,
      }),
    )
    await dispatch(addressBookSafeLoad([...ownersAddressBookEntry]))
  }

  const [initialFormValues, setInitialFormValues] = useState<CreateSafeFormValues>()

  useEffect(() => {
    if (provider && userWalletAddress) {
      const initialValuesFromUrl = getInitialValues(userWalletAddress, addressBook, location, safeRandomName)
      setInitialFormValues(initialValuesFromUrl)
    }
  }, [provider, userWalletAddress, addressBook, location, safeRandomName])

  if (isLoading) {
    return (
      <LoaderContainer data-testid={'create-safe-loader'}>
        <Loader size="md" />
      </LoaderContainer>
    )
  }

  function onClickModalButton() {
    const { safeId, safeAddress } = modalData
    history.push({
      pathname: generateSafeRouteWithChainId(SAFE_ROUTES.ASSETS_BALANCES, {
        shortName: '',
        safeId: safeId,
        safeAddress,
      }),
    })
  }

  return (
    <>
      <Page>
        <Block>
          <Row align="center">
            <BackIcon disableRipple onClick={history.goBack}>
              <ChevronLeft />
            </BackIcon>
            <Heading tag="h2">Create new Safe</Heading>
          </Row>
          <StepperForm initialValues={initialFormValues} onSubmit={showSafeCreationProcess} testId={'create-safe-form'}>
            <StepFormElement
              label={selectWalletAndNetworkStepLabel}
              nextButtonLabel="Continue"
              disableNextButton={!provider}
            >
              <SelectWalletAndNetworkStep />
            </StepFormElement>
            <StepFormElement label={nameNewSafeStepLabel} nextButtonLabel="Continue">
              <NameNewSafeStep />
            </StepFormElement>
            <StepFormElement
              label={ownersAndConfirmationsNewSafeStepLabel}
              nextButtonLabel="Continue"
              validate={ownersAndConfirmationsNewSafeStepValidations}
            >
              <OwnersAndConfirmationsNewSafeStep />
            </StepFormElement>
            <StepFormElement label={reviewNewSafeStepLabel} nextButtonLabel="Create">
              <ReviewNewSafeStep />
            </StepFormElement>
          </StepperForm>
        </Block>
      </Page>

      {showCreatedModal && (
        <GenericModal
          onClose={onClickModalButton}
          title="Safe Created!"
          body={
            <div data-testid="safe-created-popup">
              <Paragraph>
                You just created a new Safe on <NetworkLabel />
              </Paragraph>
              <Paragraph>
                You will only be able to use this Safe on <NetworkLabel />
              </Paragraph>
              <Paragraph>
                If you send assets on other networks to this address,{' '}
                <EmphasisLabel>you will not be able to access them</EmphasisLabel>
              </Paragraph>
            </div>
          }
          footer={
            <ButtonContainer>
              <Button
                testId="safe-created-button"
                onClick={onClickModalButton}
                color="primary"
                type={'button'}
                size="small"
                variant="contained"
              >
                Continue
              </Button>
            </ButtonContainer>
          }
        />
      )}

      {/* { true && (
        <GenericModal
        onClose={() => {}}
        
          title="Unable to load the new Safe"
          body={
            <div>
              <Paragraph>
                We are currently unable to load the Safe but it was successfully created and can be found <br />
                under the following address{' '}
                <InlinePrefixedEthHashInfo
                  hash={'newSafeAddress'}
                  showCopyBtn
                  explorerUrl={getExplorerInfo('newSafeAddress')}
                />
              </Paragraph>
            </div>
          }
          footer={
            <ButtonContainer>
              <Button color="primary" type="button" size="small" variant="contained">
                OK
              </Button>
            </ButtonContainer>
          }
        />
      )} */}
    </>
  )
}

export default CreateSafePage

const DEFAULT_THRESHOLD_VALUE = 1

// initial values can be present in the URL because the Old MultiSig migration
function getInitialValues(userAddress, addressBook, location, suggestedSafeName): CreateSafeFormValues {
  const query = queryString.parse(location.search, { arrayFormat: 'comma' })
  const { name, owneraddresses, ownernames, threshold } = query

  // if owners are not present in the URL we use current user account as default owner
  const isOwnersPresentInTheUrl = !!owneraddresses
  const ownersFromUrl = Array.isArray(owneraddresses) ? owneraddresses : [owneraddresses]
  const owners = isOwnersPresentInTheUrl ? ownersFromUrl : [userAddress]

  // we set the owner names
  const ownersNamesFromUrl = Array.isArray(ownernames) ? ownernames : [ownernames]
  const userAddressName = [addressBook[userAddress]?.name || 'My Wallet']
  const ownerNames = isOwnersPresentInTheUrl ? ownersNamesFromUrl : userAddressName

  const thresholdFromURl = Number(threshold)
  const isValidThresholdInTheUrl =
    threshold && !Number.isNaN(threshold) && thresholdFromURl <= owners.length && thresholdFromURl > 0

  return {
    [FIELD_CREATE_SUGGESTED_SAFE_NAME]: suggestedSafeName,
    [FIELD_CREATE_CUSTOM_SAFE_NAME]: name,
    [FIELD_NEW_SAFE_THRESHOLD]: isValidThresholdInTheUrl ? threshold : DEFAULT_THRESHOLD_VALUE,
    [FIELD_SAFE_OWNERS_LIST]: owners.map((owner, index) => ({
      nameFieldName: `owner-name-${index}`,
      addressFieldName: `owner-address-${index}`,
    })),
    // we set owners address values as owner-address-${index} format in the form state
    ...owners.reduce(
      (ownerAddressFields, ownerAddress, index) => ({
        ...ownerAddressFields,
        [`owner-address-${index}`]: ownerAddress,
      }),
      {},
    ),
    // we set owners name values as owner-name-${index} format in the form state
    ...ownerNames.reduce(
      (ownerNameFields, ownerName, index) => ({
        ...ownerNameFields,
        [`owner-name-${index}`]: ownerName,
      }),
      {},
    ),
    [FIELD_MAX_OWNER_NUMBER]: owners.length,
    [FIELD_NEW_SAFE_PROXY_SALT]: Date.now(),
  }
}

async function makeSafeCreate(creatorAddress: string, newSafeFormValues: CreateSafeFormValues): Promise<ISafeCreate> {
  const chainId = _getChainId()
  const internalChainId = getInternalChainId()
  const pubkey = await window.keplr?.getKey(chainId)
  const creatorPubkey = parseToAdress(pubkey?.pubKey as Uint8Array)
  return {
    internalChainId,
    creatorAddress,
    creatorPubkey,
    otherOwnersAddress: newSafeFormValues[FIELD_SAFE_OWNERS_LIST].map(
      ({ addressFieldName }) => newSafeFormValues[addressFieldName],
    ).filter((e) => e !== creatorAddress),
    threshold: newSafeFormValues[FIELD_NEW_SAFE_THRESHOLD],
  } as ISafeCreate
}

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`

const BackIcon = styled(IconButton)`
  color: ${secondary};
  padding: ${sm};
  margin-right: 5px;
`
const EmphasisLabel = styled.span`
  font-weight: ${boldFont};
`

const ButtonContainer = styled.div`
  text-align: center;
`
