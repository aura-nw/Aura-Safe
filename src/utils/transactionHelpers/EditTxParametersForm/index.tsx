import { Divider, Text, Title } from '@aura/safe-react-components'
import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/core/styles'
import Close from '@material-ui/icons/Close'
import { ReactElement } from 'react'
import styled from 'styled-components'

import { Modal } from 'src/components/Modal'
import Field from 'src/components/forms/Field'
import GnoForm from 'src/components/forms/GnoForm'
import TextField from 'src/components/forms/TextField'
import { minValue } from 'src/components/forms/validator'
import Block from 'src/components/layout/Block'
import Row from 'src/components/layout/Row'
import { TxParameters } from 'src/routes/safe/container/hooks/useTransactionParameters'
import { styles } from './style'

import { loadLastUsedProvider } from 'src/logic/wallets/store/middlewares/providerWatcher'
import useSafeTxGas from '../useSafeTxGas'
import { ParametersStatus, ethereumTxParametersTitle } from '../utils'
let lastUsedProvider = ''

loadLastUsedProvider().then((result) => {
  lastUsedProvider = result || ''
})

const StyledDivider = styled(Divider)`
  margin: 0px;
`
const StyledDividerFooter = styled(Divider)`
  margin: 16px -24px;
`

const SafeOptions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`

const EthereumOptions = styled.div`
  display: flex;
  /* justify-content: space-between; */
  flex-wrap: wrap;
  gap: 10px 20px;

  div {
    width: 216px !important;
  }
`
const StyledTextMt = styled(Text)`
  margin: 16px 0 4px 0;
`
const useStyles = makeStyles(styles)

interface Props {
  txParameters: TxParameters
  onClose: (txParameters?: TxParameters) => void
  parametersStatus: ParametersStatus
  isExecution: boolean
}

const formValidation = (values) => {
  const { ethGasLimit, ethGasPrice, ethNonce, safeNonce, safeTxGas } = values ?? {}

  const ethGasLimitValidation = minValue(0, false)(ethGasLimit)

  let ethGasPriceValidation

  if (lastUsedProvider?.toLowerCase() === 'keplr') {
    ethGasPriceValidation = minValue(0, false)(ethGasPrice)
  } else {
    ethGasPriceValidation = minValue(14999, false)(ethGasPrice)
  }

  const ethNonceValidation = minValue(0, true)(ethNonce)

  const safeNonceValidation = minValue(0, true)(safeNonce)

  const safeTxGasValidation = minValue(0, true)(safeTxGas)

  return {
    ethGasLimit: ethGasLimitValidation,
    ethGasPrice: ethGasPriceValidation,
    ethNonce: ethNonceValidation,
    safeNonce: safeNonceValidation,
    safeTxGas: safeTxGasValidation,
  }
}

export const EditTxParametersForm = ({
  onClose,
  txParameters,
  parametersStatus = 'ENABLED',
  isExecution,
}: Props): ReactElement => {
  const classes = useStyles()
  const { safeNonce, safeTxGas, ethNonce, ethGasLimit, ethGasPrice } = txParameters
  const showSafeTxGas = useSafeTxGas()

  const onSubmit = (values: TxParameters) => {
    onClose(values)
  }

  const onCloseFormHandler = () => {
    onClose()
  }

  return (
    <>
      {/* Header */}
      <Row align="center" className={classes.heading} grow data-testid="send-funds-review-step">
        <Title size="sm" withoutMargin>
          Advanced options
        </Title>
        <IconButton disableRipple onClick={onCloseFormHandler}>
          <Close className={classes.closeIcon} />
        </IconButton>
      </Row>

      <StyledDivider />

      <Block className={classes.container}>
        <GnoForm
          initialValues={{
            safeNonce: safeNonce || 0,
            safeTxGas: safeTxGas || '',
            ethNonce: ethNonce || '',
            ethGasLimit: ethGasLimit || '',
            ethGasPrice: ethGasPrice || '',
          }}
          onSubmit={onSubmit}
          validation={formValidation}
        >
          {() => (
            <>
              {/* <StyledText size="xl" strong>
                Safe transaction
              </StyledText>

              <SafeOptions>
                <Field
                  name="safeNonce"
                  defaultValue={safeNonce}
                  placeholder="Safe nonce"
                  text="Safe nonce"
                  type="number"
                  min="0"
                  component={TextField}
                  disabled={!areSafeParamsEnabled(parametersStatus)}
                />
                {showSafeTxGas && (
                  <Field
                    name="safeTxGas"
                    defaultValue={safeTxGas}
                    placeholder="SafeTxGas"
                    text="SafeTxGas"
                    type="number"
                    min="0"
                    component={TextField}
                    disabled={!areSafeParamsEnabled(parametersStatus)}
                  />
                )}
              </SafeOptions> */}

              {/* {areEthereumParamsVisible(parametersStatus) && (
                
              )} */}
              <>
                <StyledTextMt size="xl" color="white" strong>
                  {ethereumTxParametersTitle(isExecution)}
                </StyledTextMt>

                <EthereumOptions>
                  {/* <Field
                      name="ethNonce"
                      defaultValue={ethNonce}
                      placeholder="Nonce"
                      text="Nonce"
                      type="number"
                      component={TextField}
                      disabled={!areEthereumParamsVisible(parametersStatus)}
                    /> */}
                  <Field
                    name="ethGasLimit"
                    defaultValue={ethGasLimit}
                    placeholder="Gas limit"
                    text="Gas limit"
                    type="number"
                    component={TextField}
                    disabled={parametersStatus === 'CANCEL_TRANSACTION'}
                  />
                  <Field
                    name="ethGasPrice"
                    defaultValue={ethGasPrice}
                    type="number"
                    placeholder="Gas price"
                    text="Gas price"
                    component={TextField}
                    // disabled={!areEthereumParamsVisible(parametersStatus)}
                  />
                </EthereumOptions>

                {/* <StyledLink
                    href="https://help.gnosis-safe.io/en/articles/4738445-configure-advanced-transaction-parameters-manually"
                    target="_blank"
                  >
                    <Text size="xl" color="primary">
                      How can I configure these parameters manually?
                    </Text>
                    <Icon size="sm" type="externalLink" color="primary" />
                  </StyledLink> */}
              </>

              <StyledDividerFooter />

              {/* Footer */}
              <Row align="center" className={classes.buttonRow}>
                <Modal.Footer.Buttons
                  cancelButtonProps={{ onClick: onCloseFormHandler, text: 'Back' }}
                  confirmButtonProps={{
                    type: 'submit',
                    text: 'Confirm',
                    testId: 'submit-tx-btn',
                  }}
                />
              </Row>
            </>
          )}
        </GnoForm>
      </Block>
    </>
  )
}
