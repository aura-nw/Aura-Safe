import IconButton from '@material-ui/core/IconButton'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import { ReactElement, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import Block from 'src/components/layout/Block'
import Heading from 'src/components/layout/Heading'
import Page from 'src/components/layout/Page'
import Row from 'src/components/layout/Row'
import StepperForm, { StepFormElement } from 'src/components/StepperForm/StepperForm'
import { getShortName } from 'src/config'
import { AddressBookEntry, makeAddressBookEntry } from 'src/logic/addressBook/model/addressBook'
import { addressBookSafeLoad } from 'src/logic/addressBook/store/actions'
import { currentNetworkAddressBookAsMap } from 'src/logic/addressBook/store/selectors'
import { currentChainId } from 'src/logic/config/store/selectors'
import { useMnemonicSafeName } from 'src/logic/hooks/useMnemonicName'
import { getKeplrKey, WalletKey } from 'src/logic/keplr/keplr'
import { enhanceSnackbarForAction, ERROR } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import { SafeStatus } from 'src/logic/safe/hooks/useOwnerSafes'
import { addOrUpdateSafe } from 'src/logic/safe/store/actions/addOrUpdateSafe'
import { buildMSafe } from 'src/logic/safe/store/actions/fetchSafe'
import { loadStoredSafes, saveSafes } from 'src/logic/safe/utils'
import { PendingSafeListStorage } from 'src/routes/CreateSafePage/CreateSafePage'
import { FIELD_SAFE_OWNERS_LIST, SAFES_PENDING_STORAGE_KEY } from 'src/routes/CreateSafePage/fields/createSafeFields'
import { allowMSafe, getMSafeInfo } from 'src/services'
import { MESSAGES_CODE } from 'src/services/constant/message'
import { secondary, sm } from 'src/theme/variables'
import { loadFromStorage } from 'src/utils/storage'
import { WALLETS_NAME } from '../../logic/wallets/constant/wallets'
import { loadLastUsedProvider } from '../../logic/wallets/store/middlewares/providerWatcher'
import {
  ALLOW_SPECIFIC_SAFE_ROUTE,
  extractPrefixedSafeAddress,
  generateSafeRoute,
  SAFE_ROUTES,
  WELCOME_ROUTE,
} from '../routes'
import {
  FIELD_ALLOW_CUSTOM_SAFE_NAME,
  FIELD_ALLOW_IS_LOADING_SAFE_ADDRESS,
  FIELD_ALLOW_SAFE_ID,
  FIELD_ALLOW_SUGGESTED_SAFE_NAME,
  FIELD_SAFE_OWNER_LIST,
  FIELD_SAFE_THRESHOLD,
  LoadSafeFormValues as AllowSafeFormValues,
  OwnerFieldListItem,
} from './fields/allowFields'
import { getLoadSafeName } from './fields/utils'
import AllowSafeOwnersStep, { loadSafeOwnersStepLabel } from './steps/AllowSafeOwnersStep'
import NameAllowSafeStep, { nameNewSafeStepLabel } from './steps/NameAllowSafeStep'
import ReviewAllowStep, { reviewLoadStepLabel } from './steps/ReviewAllowStep'

function Allow(): ReactElement {
  const dispatch = useDispatch()
  const history = useHistory()
  const { safeAddress, safeId } = extractPrefixedSafeAddress(undefined, ALLOW_SPECIFIC_SAFE_ROUTE)
  const safeRandomName = useMnemonicSafeName()
  const [initialFormValues, setInitialFormValues] = useState<AllowSafeFormValues>()
  const addressBook = useSelector(currentNetworkAddressBookAsMap)
  const chainId = useSelector(currentChainId)

  useEffect(() => {
    const checkSafeAddress = async () => {
      if (!safeId) {
        return
      }

      const initialValues: AllowSafeFormValues = {
        [FIELD_ALLOW_SUGGESTED_SAFE_NAME]: safeRandomName,
        [FIELD_ALLOW_IS_LOADING_SAFE_ADDRESS]: false,
        [FIELD_ALLOW_SAFE_ID]: safeId,
        [FIELD_SAFE_OWNER_LIST]: [],
        [FIELD_ALLOW_CUSTOM_SAFE_NAME]: '',
        [FIELD_SAFE_THRESHOLD]: 0,
      }

      try {
        const safesPending = await Promise.resolve(loadFromStorage<PendingSafeListStorage>(SAFES_PENDING_STORAGE_KEY))
        const pendingSafe = safesPending?.find((e) => e.id === safeId)

        const { owners, threshold } = await getMSafeInfo(safeId)

        const ownerList: Array<OwnerFieldListItem> = owners.map((address, idx) => {
          const pendingOwner = pendingSafe?.[FIELD_SAFE_OWNERS_LIST][idx].nameFieldName

          return {
            address: address,
            name: pendingSafe && pendingOwner ? pendingSafe[pendingOwner] : '',
          }
        })

        initialValues[FIELD_SAFE_OWNER_LIST] = [...ownerList]
        initialValues[FIELD_SAFE_THRESHOLD] = threshold

        setInitialFormValues(initialValues)
      } catch (error) {}
    }

    checkSafeAddress()
  }, [safeAddress, safeId, safeRandomName])

  const updateAddressBook = (newAddress: string, values: AllowSafeFormValues) => {
    const ownerList = values[FIELD_SAFE_OWNER_LIST] as AddressBookEntry[]
    debugger
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
      address: newAddress,
      name: getLoadSafeName(values, addressBook),
      chainId,
    })

    dispatch(addressBookSafeLoad([...ownerEntries, safeEntry]))
  }

  const onSubmitAllowSafe = async (values: AllowSafeFormValues): Promise<void> => {
    const id = values[FIELD_ALLOW_SAFE_ID]

    const lastUsedProvider = await loadLastUsedProvider()

    let walletKey: WalletKey | undefined

    if (lastUsedProvider === WALLETS_NAME.Keplr) {
      walletKey = await getKeplrKey(chainId)
    }

    if (!id || !walletKey) {
      return
    }

    const { ErrorCode, Message, Data: safeData } = await allowMSafe(id, walletKey)

    if (ErrorCode === MESSAGES_CODE.SUCCESSFUL.ErrorCode) {
      if (safeData.status === SafeStatus.Created) {
        const { safeAddress, id } = safeData
        const safeProps = await buildMSafe(safeAddress, id)

        const storedSafes = loadStoredSafes() || {}

        storedSafes[safeAddress] = safeProps

        saveSafes(storedSafes)
        updateAddressBook(safeAddress, values)

        dispatch(addOrUpdateSafe(safeProps))

        history.push(
          generateSafeRoute(SAFE_ROUTES.ASSETS_BALANCES, {
            shortName: getShortName(),
            safeAddress: safeAddress,
            safeId: id,
          }),
        )
      } else {
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

  return (
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
          onSubmit={onSubmitAllowSafe}
          key={safeId}
        >
          <StepFormElement label={nameNewSafeStepLabel} nextButtonLabel="Continue">
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
  )
}

export default Allow

const BackIcon = styled(IconButton)`
  color: ${secondary};
  padding: ${sm};
  margin-right: 5px;
`
