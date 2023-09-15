import { makeStyles } from '@material-ui/core/styles'
import { ReactElement, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import Field from 'src/components/forms/Field'
import GnoForm from 'src/components/forms/GnoForm'
import TextField from 'src/components/forms/TextField'
import { composeValidators, required, validAddressBookName } from 'src/components/forms/validator'
import Block from 'src/components/layout/Block'
import Heading from 'src/components/layout/Heading'
import Paragraph from 'src/components/layout/Paragraph'
import { makeAddressBookEntry } from 'src/logic/addressBook/model/addressBook'
import { addressBookAddOrUpdate } from 'src/logic/addressBook/store/actions'
import { enhanceSnackbarForAction, getNotificationsFromTxType } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import { updateSafe } from 'src/logic/safe/store/actions/updateSafe'
import { TX_NOTIFICATION_TYPES } from 'src/logic/safe/transactions'
import { StyledBorder, StyledButtonBorder, StyledButtonLabel, styles } from './style'

import ChainIndicator from 'src/components/ChainIndicator'
import { currentChainId } from 'src/logic/config/store/selectors'
import { currentSafe, safesWithNamesAsMap } from 'src/logic/safe/store/selectors'
import { SETTINGS_EVENTS, useAnalytics } from 'src/utils/googleAnalytics'

export const SAFE_NAME_INPUT_TEST_ID = 'safe-name-input'
export const SAFE_NAME_SUBMIT_BTN_TEST_ID = 'change-safe-name-btn'
export const SAFE_NAME_UPDATE_SAFE_BTN_TEST_ID = 'update-safe-name-btn'

const useStyles = makeStyles(styles)

const StyledParagraph = styled(Paragraph)`
  margin-bottom: 0;
`

const SafeDetails = (): ReactElement => {
  const classes = useStyles()
  const curChainId = useSelector(currentChainId)
  const { address: safeAddress, currentVersion: safeCurrentVersion, chainId = curChainId } = useSelector(currentSafe)
  const safeNamesMap = useSelector(safesWithNamesAsMap)
  const safeName = safeNamesMap[safeAddress]?.name

  const dispatch = useDispatch()
  const { trackEvent } = useAnalytics()

  const updateAddressBook = (values) => {
    dispatch(
      addressBookAddOrUpdate(
        makeAddressBookEntry({ address: safeAddress, name: values.safeName, chainId: curChainId }),
      ),
    )
    // setting `loadedViaUrl` to `false` as setting a safe's name is considered to intentionally add the safe
    dispatch(updateSafe({ address: safeAddress, loadedViaUrl: false }))

    const notification = getNotificationsFromTxType(TX_NOTIFICATION_TYPES.SAFE_NAME_CHANGE_TX)
    dispatch(enqueueSnackbar(enhanceSnackbarForAction(notification.afterExecution.noMoreConfirmationsNeeded)))
  }

  useEffect(() => {
    trackEvent(SETTINGS_EVENTS.DETAILS)
  }, [trackEvent])

  return (
    <GnoForm onSubmit={updateAddressBook}>
      {() => (
        <>
          <Block className={classes.formContainer}>
            <Heading tag="h2">Blockchain Network</Heading>
            <StyledParagraph>
              <ChainIndicator chainId={chainId} />
            </StyledParagraph>
          </Block>

          {safeName != null && (
            <Block className={classes.formContainer}>
              <Heading tag="h2">Modify Safe Name</Heading>
              <Paragraph>
                You can change the name of this Safe. This name is only stored locally and never shared with Pyxis Safe
                or any third parties.
              </Paragraph>
              <Block className={classes.root}>
                <Field
                  component={TextField}
                  defaultValue={safeName}
                  name="safeName"
                  placeholder="Safe name*"
                  testId={SAFE_NAME_INPUT_TEST_ID}
                  text="Safe name*"
                  type="text"
                  validate={composeValidators(required, validAddressBookName)}
                />
                <Block>
                  <StyledBorder>
                    <StyledButtonBorder testId={SAFE_NAME_SUBMIT_BTN_TEST_ID} type="submit">
                      <StyledButtonLabel size="lg"> Save </StyledButtonLabel>
                    </StyledButtonBorder>
                  </StyledBorder>
                </Block>
              </Block>
            </Block>
          )}
        </>
      )}
    </GnoForm>
  )
}

export default SafeDetails
