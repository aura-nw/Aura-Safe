import { ReactElement, useState, useEffect } from 'react'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import queryString from 'query-string'
import { useLocation } from 'react-router'
import { GenericModal, Loader } from '@gnosis.pm/safe-react-components'

import Page from 'src/components/layout/Page'
import Block from 'src/components/layout/Block'
import Row from 'src/components/layout/Row'
import Heading from 'src/components/layout/Heading'
import { generateSafeRoute, history, SAFE_ROUTES } from 'src/routes/routes'
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
  SAFE_PENDING_CREATION_STORAGE_KEY,
} from './fields/createSafeFields'
import { useMnemonicSafeName } from 'src/logic/hooks/useMnemonicName'
import { providerNameSelector, shouldSwitchWalletChain, userAccountSelector } from 'src/logic/wallets/store/selectors'
import OwnersAndConfirmationsNewSafeStep, {
  ownersAndConfirmationsNewSafeStepLabel,
  ownersAndConfirmationsNewSafeStepValidations,
} from './steps/OwnersAndConfirmationsNewSafeStep'
import { currentNetworkAddressBookAsMap } from 'src/logic/addressBook/store/selectors'
import ReviewNewSafeStep, { reviewNewSafeStepLabel } from './steps/ReviewNewSafeStep'
import { loadFromStorage, saveToStorage } from 'src/utils/storage'
import SafeCreationProcess, { InlinePrefixedEthHashInfo } from './components/SafeCreationProcess'
import SelectWalletAndNetworkStep, { selectWalletAndNetworkStepLabel } from './steps/SelectWalletAndNetworkStep'

import { createMSafe, ISafeCreate } from 'src/services'
import { getExplorerInfo, getInternalChainId, getShortName, _getChainId } from 'src/config'
import { parseToAdress } from 'src/utils/parseByteAdress'
import Paragraph from 'src/components/layout/Paragraph'
import NetworkLabel from 'src/components/NetworkLabel/NetworkLabel'
import Button from 'src/components/layout/Button'

function CreateSafePage(): ReactElement {
  // const [safePendingToBeCreated, setSafePendingToBeCreated] = useState<CreateSafeFormValues>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [showCreatedModal, setShowModal] = useState(false)
  const providerName = useSelector(providerNameSelector)
  const isWrongNetwork = useSelector(shouldSwitchWalletChain)
  const provider = !!providerName && !isWrongNetwork

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

    const createResponse = await createMSafe(payload)

    if ((createResponse as any).ErrorCode === 'SUCCESSFUL') {
      setShowModal(true)
    }
    // setSafePendingToBeCreated(newSafeFormValues)
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
    history.push(SAFE_ROUTES.APPS)
  }

  // return !!safePendingToBeCreated ? (
  //   <SafeCreationProcess />
  // ) :
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
