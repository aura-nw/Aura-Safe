import { Loader } from '@gnosis.pm/safe-react-components'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import queryString from 'query-string'
import { ReactElement, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import Block from 'src/components/layout/Block'
import Heading from 'src/components/layout/Heading'
import Page from 'src/components/layout/Page'
import Row from 'src/components/layout/Row'
import StepperForm, { StepFormElement } from 'src/components/StepperForm/StepperForm'
import { currentNetworkAddressBookAsMap } from 'src/logic/addressBook/store/selectors'
import { useMnemonicSafeName } from 'src/logic/hooks/useMnemonicName'
import { providerNameSelector, shouldSwitchWalletChain, userAccountSelector } from 'src/logic/wallets/store/selectors'
import { generateSafeRoute, history, SAFE_ROUTES, WELCOME_ROUTE } from 'src/routes/routes'
import {
  CreateSafeFormValues,
  FIELD_CREATE_CUSTOM_SAFE_NAME,
  FIELD_CREATE_SUGGESTED_SAFE_NAME,
  FIELD_MAX_OWNER_NUMBER,
  FIELD_NEW_SAFE_PROXY_SALT,
  FIELD_NEW_SAFE_THRESHOLD,
  FIELD_SAFE_OWNERS_LIST,
  SAFES_PENDING_STORAGE_KEY,
} from './fields/createSafeFields'
import NameNewSafeStep, { nameNewSafeStepLabel } from './steps/NameNewSafeStep/NameNewSafeStep'
import OwnersAndConfirmationsNewSafeStep, {
  ownersAndConfirmationsNewSafeStepLabel,
  ownersAndConfirmationsNewSafeStepValidations,
} from './steps/OwnersAndConfirmationsNewSafeStep/OwnersAndConfirmationsNewSafeStep'
import ReviewNewSafeStep, { reviewNewSafeStepLabel } from './steps/ReviewNewSafeStep/ReviewNewSafeStep'
import SelectWalletAndNetworkStep, {
  selectWalletAndNetworkStepLabel,
} from './steps/SelectWalletAndNetworkStep/SelectWalletAndNetworkStep'

import { ConnectWalletModal } from 'src/components/ConnectWalletModal'
import Paragraph from 'src/components/layout/Paragraph'
import { Modal } from 'src/components/Modal'
import NetworkLabel from 'src/components/NetworkLabel/NetworkLabel'
import { getInternalChainId, getShortName, _getChainId } from 'src/config'
import { createMSafe, ISafeCreate } from 'src/services'
import { parseToAdress } from 'src/utils/parseByteAdress'
import { loadFromStorage, saveToStorage } from 'src/utils/storage'
import { makeAddressBookEntry } from '../../logic/addressBook/model/addressBook'
import { addressBookSafeLoad } from '../../logic/addressBook/store/actions'
import { enhanceSnackbarForAction, ERROR, NOTIFICATIONS } from '../../logic/notifications'
import enqueueSnackbar from '../../logic/notifications/store/actions/enqueueSnackbar'
import { SafeStatus } from '../../logic/safe/hooks/useOwnerSafes'
import { addOrUpdateSafe } from '../../logic/safe/store/actions/addOrUpdateSafe'
import { buildMSafe } from '../../logic/safe/store/actions/fetchSafe'
import { WALLETS_NAME } from '../../logic/wallets/constant/wallets'
import { loadLastUsedProvider } from '../../logic/wallets/store/middlewares/providerWatcher'
import { MESSAGES_CODE } from '../../services/constant/message'
import { useAnalytics, USER_EVENTS } from '../../utils/googleAnalytics'

import useConnectWallet from 'src/logic/hooks/useConnectWallet'
import { BackIcon, EmphasisLabel, LoaderContainer, StyledBorder, StyledButtonBorder, StyledButtonLabel } from './styles'

type ModalDataType = {
  safeAddress: string
  safeId?: number
}

type PendingSafeStorage =
  | {
      id: number
    } & CreateSafeFormValues

export type PendingSafeListStorage = PendingSafeStorage[]

function CreateSafePage(): ReactElement {
  const dispatch = useDispatch()
  // const [safePendingToBeCreated, setSafePendingToBeCreated] = useState<CreateSafeFormValues>()
  const [pendingSafe, setPendingSafe] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [showCreatedModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState<ModalDataType>({ safeAddress: '' })

  const providerName = useSelector(providerNameSelector)
  const isWrongNetwork = useSelector(shouldSwitchWalletChain)
  const provider = !!providerName && !isWrongNetwork
  const { connectWalletState, onConnectWalletShow, onConnectWalletHide } = useConnectWallet()
  const { trackEvent } = useAnalytics()

  // const BYTES = Buffer.from('')

  useEffect(() => {
    const checkIfSafeIsPendingToBeCreated = async (): Promise<void> => {
      setIsLoading(true)
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
    const lastUsedProvider = await loadLastUsedProvider()
    let payload: ISafeCreate

    if (lastUsedProvider === WALLETS_NAME.Keplr) {
      payload = await makeSafeCreate(userWalletAddress, newSafeFormValues)
    } else {
      return
    }

    const { ErrorCode, Data: safeData, Message } = await createMSafe(payload)

    if (ErrorCode === MESSAGES_CODE.SUCCESSFUL.ErrorCode) {
      trackEvent(USER_EVENTS.CREATE_SAFE)
      const { safeAddress, id, status } = safeData

      if (status === SafeStatus.Created) {
        const safeProps = await buildMSafe(safeAddress, id)

        updateAddressBook(safeAddress, newSafeFormValues, dispatch)
        dispatch(addOrUpdateSafe(safeProps))

        setModalData({
          safeAddress,
          safeId: id,
        })
      } else {
        setPendingSafe(true)

        const safesPending = await Promise.resolve(loadFromStorage<PendingSafeListStorage>(SAFES_PENDING_STORAGE_KEY))

        if (safesPending) {
          saveToStorage(SAFES_PENDING_STORAGE_KEY, [
            ...safesPending,
            {
              ...newSafeFormValues,
              id,
            },
          ])
        } else {
          saveToStorage(SAFES_PENDING_STORAGE_KEY, [
            {
              ...newSafeFormValues,
              id,
            },
          ])
        }
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
    if (safeId && safeAddress) {
      history.push({
        pathname: generateSafeRoute(SAFE_ROUTES.ASSETS_BALANCES, {
          shortName: getShortName(),
          safeId: safeId,
          safeAddress,
        }),
      })
    } else {
      history.push(WELCOME_ROUTE)
    }
  }

  return (
    <>
      <Page>
        <Block>
          <Row align="center">
            <BackIcon disableRipple onClick={history.goBack}>
              <ChevronLeft />
            </BackIcon>
            <Heading tag="h2" color="white">
              Create new Safe
            </Heading>
          </Row>
          <StepperForm initialValues={initialFormValues} onSubmit={showSafeCreationProcess} testId={'create-safe-form'}>
            <StepFormElement
              label={selectWalletAndNetworkStepLabel}
              nextButtonLabel="Continue"
              disableNextButton={!provider}
            >
              <SelectWalletAndNetworkStep onConnectWalletShow={onConnectWalletShow} />
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

      <Modal
        description=""
        handleClose={onClickModalButton}
        open={showCreatedModal}
        title={pendingSafe ? 'Confirmation' : 'Safe Created!'}
      >
        <Modal.Header onClose={onClickModalButton}>
          <Modal.Header.Title withoutMargin>{pendingSafe ? 'Confirmation' : 'Safe Created!'}</Modal.Header.Title>
        </Modal.Header>

        <Modal.Body>
          {!pendingSafe ? (
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
          ) : (
            <div data-testid="safe-created-popup">
              <Paragraph>
                You are about to create a new Safe on <NetworkLabel />
              </Paragraph>
              <Paragraph>
                You will only be able to use this Safe on <NetworkLabel />
              </Paragraph>
              <Paragraph>All other owners must give their permission in order for the Safe to be created.</Paragraph>
              <Paragraph>
                Before that, you can also cancel the Safe creation request by clicking the{' '}
                <EmphasisLabel> {`"Cancel"`}</EmphasisLabel> button next to your awaiting safe in the Safe list.
              </Paragraph>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer justifyContent="flex-end">
          {
            <StyledBorder>
              <StyledButtonBorder iconType="safe" iconSize="sm" size="lg" onClick={onClickModalButton}>
                <StyledButtonLabel size="xl">Continue</StyledButtonLabel>
              </StyledButtonBorder>
            </StyledBorder>
          }
        </Modal.Footer>
      </Modal>

      <ConnectWalletModal isOpen={connectWalletState.showConnect} onClose={onConnectWalletHide}></ConnectWalletModal>
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

// async function makeSafeCreateWithTerra(
//   creatorAddress: string,
//   newSafeFormValues: CreateSafeFormValues,
//   creatorPubkey,
// ): Promise<ISafeCreate> {
//   const internalChainId = getInternalChainId()
//   return {
//     internalChainId,
//     creatorAddress,
//     creatorPubkey,
//     otherOwnersAddress: newSafeFormValues[FIELD_SAFE_OWNERS_LIST].map(
//       ({ addressFieldName }) => newSafeFormValues[addressFieldName],
//     ).filter((e) => e !== creatorAddress),
//     threshold: newSafeFormValues[FIELD_NEW_SAFE_THRESHOLD],
//   } as ISafeCreate
// }

export const updateAddressBook = async (newAddress: string, formValues: CreateSafeFormValues, dispatch) => {
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
