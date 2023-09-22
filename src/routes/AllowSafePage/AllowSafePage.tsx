import IconButton from '@material-ui/core/IconButton'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import { ReactElement, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import _ from 'lodash'
import { Modal } from 'src/components/Modal'
import NetworkLabel from 'src/components/NetworkLabel/NetworkLabel'
import StepperForm, { StepFormElement } from 'src/components/StepperForm/StepperForm'
import Block from 'src/components/layout/Block'
import Heading from 'src/components/layout/Heading'
import Page from 'src/components/layout/Page'
import Paragraph from 'src/components/layout/Paragraph'
import Row from 'src/components/layout/Row'
import { getShortName } from 'src/config'
import { AddressBookEntry, makeAddressBookEntry } from 'src/logic/addressBook/model/addressBook'
import { addressBookSafeLoad } from 'src/logic/addressBook/store/actions'
import { currentNetworkAddressBookAsMap } from 'src/logic/addressBook/store/selectors'
import { currentChainId } from 'src/logic/config/store/selectors'
import { useMnemonicSafeName } from 'src/logic/hooks/useMnemonicName'
import { ERROR, enhanceSnackbarForAction } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import { SafeStatus } from 'src/logic/safe/hooks/useOwnerSafes'
import { addOrUpdateSafe } from 'src/logic/safe/store/actions/addOrUpdateSafe'
import { buildMSafe } from 'src/logic/safe/store/actions/fetchSafe'
import { loadStoredSafes, saveSafes } from 'src/logic/safe/utils'
import { userAccountSelector } from 'src/logic/wallets/store/selectors'
import { PendingSafeListStorage } from 'src/routes/CreateSafePage/CreateSafePage'
import { SAFES_PENDING_STORAGE_KEY } from 'src/routes/CreateSafePage/fields/createSafeFields'
import { allowMSafe, getMSafeInfo } from 'src/services'
import { MESSAGES_CODE } from 'src/services/constant/message'
import { borderLinear, secondary, sm } from 'src/theme/variables'
import { loadFromStorage, saveToStorage } from 'src/utils/storage'
import {
  ALLOW_SPECIFIC_SAFE_ROUTE,
  SAFE_ROUTES,
  WELCOME_ROUTE,
  extractPrefixedSafeAddress,
  generateSafeRoute,
} from '../routes'
import {
  AllowSafeFormValues,
  FIELD_ALLOW_CUSTOM_SAFE_NAME,
  FIELD_ALLOW_IS_LOADING_SAFE_ADDRESS,
  FIELD_ALLOW_SAFE_ID,
  FIELD_ALLOW_SUGGESTED_SAFE_NAME,
  FIELD_SAFE_OWNERS_LIST,
  FIELD_SAFE_OWNER_LIST,
  FIELD_SAFE_THRESHOLD,
  OwnerFieldListItem,
} from './fields/allowFields'
import { getLoadSafeName } from './fields/utils'
import AllowSafeOwnersStep, { loadSafeOwnersStepLabel } from './steps/AllowSafeOwnersStep'
import NameAllowSafeStep, { loadSafeStepValidations, nameNewSafeStepLabel } from './steps/NameAllowSafeStep'
import ReviewAllowStep, { reviewLoadStepLabel } from './steps/ReviewAllowStep'

import { Text } from '@aura/safe-react-components'
import Button from 'src/components/layout/Button'
import { getKeplrKey } from 'src/logic/providers'

const BackIcon = styled(IconButton)`
  color: ${secondary};
  padding: ${sm};
  margin-right: 5px;
`

const StyledBorder = styled.div`
  border-radius: 50px !important;
  border: 2px solid transparent;
  background-image: ${borderLinear};
  background-origin: border-box;
  background-clip: content-box, border-box;
`

const StyledButtonBorder = styled(Button)`
  background-color: rgba(18, 18, 18, 1) !important;
  border-radius: 50px !important;
`

const StyledButtonLabel = styled(Text)`
  color: white;
  background-color: transparent !important;
`

function Allow(): ReactElement {
  const dispatch = useDispatch()
  const history = useHistory()
  const { safeId } = extractPrefixedSafeAddress(undefined, ALLOW_SPECIFIC_SAFE_ROUTE)
  const safeRandomName = useMnemonicSafeName()
  const [showCreatedModal, setShowModal] = useState(false)
  const [dataAllowSafe, setDataAllowSafe] = useState(null)
  const [initialFormValues, setInitialFormValues] = useState<AllowSafeFormValues>()
  const [safeConfirm, setSafeConfirm] = useState<string[]>()
  const addressBook = useSelector(currentNetworkAddressBookAsMap)
  const chainId = useSelector(currentChainId)

  const userAccount = useSelector(userAccountSelector)

  useEffect(() => {
    if (!safeId) {
      return
    }

    const initialValues: AllowSafeFormValues = {
      [FIELD_ALLOW_SUGGESTED_SAFE_NAME]: safeRandomName,
      [FIELD_ALLOW_IS_LOADING_SAFE_ADDRESS]: true,
      [FIELD_ALLOW_SAFE_ID]: safeId,
      [FIELD_SAFE_OWNER_LIST]: [],
      [FIELD_ALLOW_CUSTOM_SAFE_NAME]: '',
      [FIELD_SAFE_THRESHOLD]: 0,
    }

    Promise.all([
      Promise.resolve(loadFromStorage<PendingSafeListStorage>(SAFES_PENDING_STORAGE_KEY, `${userAccount}_`)),
      getMSafeInfo(safeId),
    ])
      .then(([pendingSafes, mSafeInfo]) => {
        const pendingSafe = pendingSafes?.find((e) => e.id === safeId)
        const { owners, threshold } = mSafeInfo

        const ownerList: Array<OwnerFieldListItem> = owners.map((address, idx) => {
          const pendingOwnerList = pendingSafe?.[FIELD_SAFE_OWNERS_LIST] || []
          const pendingOwner = pendingOwnerList[idx] // ?.nameFieldName

          const name = pendingSafe && pendingOwner ? pendingSafe[pendingOwner.nameFieldName] : ''

          return {
            address: address,
            name, // : pendingSafe && pendingOwner ? pendingSafe[pendingOwner] : '',
          }
        })

        initialValues[FIELD_SAFE_OWNER_LIST] = [...ownerList]
        initialValues[FIELD_SAFE_THRESHOLD] = threshold
        initialValues[FIELD_ALLOW_IS_LOADING_SAFE_ADDRESS] = false

        setSafeConfirm(mSafeInfo?.confirms)
        setInitialFormValues(initialValues)
      })
      .catch((error) => {
        dispatch(
          enqueueSnackbar(
            enhanceSnackbarForAction({
              message: error.message,
              options: { variant: ERROR, persist: false, autoHideDuration: 5000 },
            }),
          ),
        )
      })
  }, [safeId, dispatch, safeRandomName, userAccount])

  const updateAddressBook = (newAddress: string, values: AllowSafeFormValues) => {
    const ownerList = values[FIELD_SAFE_OWNER_LIST] as AddressBookEntry[]
    const ownerEntries = ownerList
      .map((owner) => {
        const ownerFieldName = `owner-address-${owner.address}`
        const ownerNameValue = values[ownerFieldName]
        return {
          ...owner,
          name: ownerNameValue,
          chainId,
        }
      })
      .filter((owner) => !!owner.name)

    if (newAddress) {
      ownerEntries.push(
        makeAddressBookEntry({
          address: newAddress,
          name: getLoadSafeName(values, addressBook),
          chainId,
        }),
      )
    }

    dispatch(addressBookSafeLoad([...ownerEntries]))
  }

  const onSubmitAllowSafe = async (values: AllowSafeFormValues): Promise<void> => {
    const id = values[FIELD_ALLOW_SAFE_ID]
    const safeName = values[FIELD_ALLOW_CUSTOM_SAFE_NAME] || values[FIELD_ALLOW_SUGGESTED_SAFE_NAME]
    const walletKey = await getKeplrKey(chainId)
    if (!id || !walletKey) {
      dispatch(
        enqueueSnackbar(
          enhanceSnackbarForAction({
            message: `Cannot find wallet key. Please disconnect your wallet, check again then reconnect.`,
            options: { variant: ERROR, persist: false, autoHideDuration: 5000 },
          }),
        ),
      )
      return
    }
    const { ErrorCode, Message, Data: safeData } = await allowMSafe(id, walletKey)
    if (ErrorCode === MESSAGES_CODE.SUCCESSFUL.ErrorCode) {
      const { safeAddress, id } = safeData
      updateAddressBook(safeAddress, values)
      if (safeData.status === SafeStatus.Created) {
        const safeProps = await buildMSafe(safeAddress, id)
        const storedSafes = loadStoredSafes() || {}
        storedSafes[safeAddress] = safeProps
        saveSafes(storedSafes)
        dispatch(addOrUpdateSafe(safeProps))
        history.push(
          generateSafeRoute(SAFE_ROUTES.ASSETS_BALANCES, {
            shortName: getShortName(),
            safeAddress: safeAddress,
            safeId: id,
          }),
        )
      } else {
        const safesPending = loadFromStorage<PendingSafeListStorage>(SAFES_PENDING_STORAGE_KEY, `${userAccount}_`) || []
        const safe = _.find(safesPending, ['id', id])
        if (safe) {
          _.assign(safe, {
            suggestedSafeName: safeName,
          })
        } else {
          _.assign(safesPending, [
            ...safesPending,
            {
              id,
              suggestedSafeName: safeName,
            },
          ])
        }
        saveToStorage(SAFES_PENDING_STORAGE_KEY, safesPending, `${userAccount}_`)
        history.push(WELCOME_ROUTE)
      }
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
  const onClickModalButton = () => {
    if (dataAllowSafe) {
      onSubmitAllowSafe(dataAllowSafe)
    } else {
      dispatch(
        enqueueSnackbar(
          enhanceSnackbarForAction({
            message: 'Missing data allow safe',
            options: { variant: ERROR, persist: false, autoHideDuration: 5000 },
          }),
        ),
      )
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
            <Heading tag="h2">Allow New Safe</Heading>
          </Row>

          {/* key={safeAddress} ensures that it goes to step 1 when the address changes */}
          <StepperForm
            initialValues={initialFormValues}
            testId="load-safe-form"
            onSubmit={(value) => {
              setDataAllowSafe(value)
              setShowModal(true)
            }}
            key={safeId}
          >
            <StepFormElement label={nameNewSafeStepLabel} nextButtonLabel="Continue" validate={loadSafeStepValidations}>
              <NameAllowSafeStep />
            </StepFormElement>
            <StepFormElement label={loadSafeOwnersStepLabel} nextButtonLabel="Continue">
              <AllowSafeOwnersStep />
            </StepFormElement>
            <StepFormElement label={reviewLoadStepLabel} nextButtonLabel="Allow">
              <ReviewAllowStep />
            </StepFormElement>
          </StepperForm>
        </Block>
      </Page>

      <Modal
        description=""
        handleClose={() => {
          setShowModal(false)
          setDataAllowSafe(null)
        }}
        open={showCreatedModal}
        title={'Allow a new Safe'}
      >
        <Modal.Header
          onClose={() => {
            setShowModal(false)
            setDataAllowSafe(null)
          }}
        >
          <Modal.Header.Title withoutMargin>{'Allow a new Safe'}</Modal.Header.Title>
        </Modal.Header>

        <Modal.Body>
          <div data-testid="safe-created-popup">
            <Paragraph>
              You have given your permission to create a Safe with other owners on <NetworkLabel />
            </Paragraph>
            <Paragraph>
              You will only be able to use this Safe on <NetworkLabel />
            </Paragraph>
            <>
              {initialFormValues &&
              safeConfirm &&
              initialFormValues?.safeOwnerList?.length - safeConfirm?.length === 1 ? (
                <Paragraph>All owners has accepted to create this Safe. This Safe is now ready to use.</Paragraph>
              ) : (
                <Paragraph>All other owner must give their permission in order for the Safe to be created.</Paragraph>
              )}
            </>
          </div>
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
    </>
  )
}

export default Allow
