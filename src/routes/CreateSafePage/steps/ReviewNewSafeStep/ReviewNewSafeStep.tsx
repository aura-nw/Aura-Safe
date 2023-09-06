import React, { ReactElement, useEffect } from 'react'
import { useForm } from 'react-final-form'
import { useSelector } from 'react-redux'

import { makeStyles } from '@material-ui/core'
import TableContainer from '@material-ui/core/TableContainer'
import NetworkLabel from 'src/components/NetworkLabel/NetworkLabel'
import PrefixedEthHashInfo from 'src/components/PrefixedEthHashInfo'
import { useStepper } from 'src/components/Stepper/stepperContext'
import Block from 'src/components/layout/Block'
import Col from 'src/components/layout/Col'
import Hairline from 'src/components/layout/Hairline'
import Paragraph from 'src/components/layout/Paragraph'
import Row from 'src/components/layout/Row'
import { getExplorerInfo, getNativeCurrency } from 'src/config'
import { providerNameSelector } from 'src/logic/wallets/store/selectors'
import InformationIcon from '../../assets/information.svg'
import {
  FIELD_CREATE_CUSTOM_SAFE_NAME,
  FIELD_CREATE_SUGGESTED_SAFE_NAME,
  FIELD_NEW_SAFE_PROXY_SALT,
  FIELD_NEW_SAFE_THRESHOLD,
  FIELD_SAFE_OWNERS_LIST,
} from '../../fields/createSafeFields'
import {
  DescriptionContainer,
  DetailsContainer,
  OwnersAddressesContainer,
  SafeNameParagraph,
  TitleContainer,
  styles,
} from './styles'

export const reviewNewSafeStepLabel = 'Review'
const useStyles = makeStyles((theme) => styles(theme))

function ReviewNewSafeStep(): ReactElement | null {
  const provider = useSelector(providerNameSelector)
  const classes = useStyles()
  const { setCurrentStep } = useStepper()

  useEffect(() => {
    if (!provider) {
      setCurrentStep(0)
    }
  }, [provider, setCurrentStep])

  const createSafeForm = useForm()
  const createSafeFormValues = createSafeForm.getState().values

  const defaultSafeValue = createSafeFormValues[FIELD_CREATE_SUGGESTED_SAFE_NAME]
  const safeName = createSafeFormValues[FIELD_CREATE_CUSTOM_SAFE_NAME] || defaultSafeValue
  const threshold = createSafeFormValues[FIELD_NEW_SAFE_THRESHOLD]
  const owners = createSafeFormValues[FIELD_SAFE_OWNERS_LIST]
  const numberOfOwners = owners.length
  const safeCreationSalt = createSafeFormValues[FIELD_NEW_SAFE_PROXY_SALT]
  const ownerAddresses = owners.map(({ addressFieldName }) => createSafeFormValues[addressFieldName])

  // const { gasCostFormatted, gasLimit, gasPrice } = useEstimateSafeCreationGas({
  //   addresses: ownerAddresses,
  //   numOwners: numberOfOwners,
  //   safeCreationSalt,
  // })
  const nativeCurrency = getNativeCurrency()

  // useEffect(() => {
  //   createSafeForm.change(FIELD_NEW_SAFE_GAS_LIMIT, gasLimit)
  //   createSafeForm.change(FIELD_NEW_SAFE_GAS_PRICE, gasPrice)
  // }, [gasLimit, gasPrice, createSafeForm])

  return (
    <Row data-testid={'create-safe-review-step'}>
      <Col xs={12}>
        <DetailsContainer>
          <Col xs={12}>
            <Block margin="lg">
              <Paragraph color="primary" weight="bolder" noMargin size="bmd">
                Details
              </Paragraph>
            </Block>
          </Col>
          <div style={{ display: 'flex' }}>
            <Block margin="lg">
              <Paragraph color="descriptionAura" noMargin size="smd">
                Name of new Safe
              </Paragraph>
              <SafeNameParagraph
                color="textaura"
                noMargin
                size="lg"
                weight="regular"
                data-testid="create-safe-review-safe-name"
              >
                {safeName}
              </SafeNameParagraph>
            </Block>
            <Block margin="marginLeftxl">
              <Paragraph color="descriptionAura" noMargin size="smd">
                Any transaction requires the confirmation of:
              </Paragraph>
              <Paragraph
                color="textaura"
                noMargin
                size="lg"
                weight="regular"
                data-testid={'create-safe-review-threshold-label'}
              >
                {`${threshold} out of ${numberOfOwners} owners`}
              </Paragraph>
            </Block>
          </div>
        </DetailsContainer>
      </Col>
      <Col layout="column" xs={12}>
        <TableContainer className={classes.containerListOwner}>
          <TitleContainer>
            <Paragraph color="primary" noMargin weight="bolder" size="lg">
              {`${numberOfOwners} Safe owners`}
            </Paragraph>
          </TitleContainer>
          {owners.map(({ nameFieldName, addressFieldName }, index) => {
            const ownerName = createSafeFormValues[nameFieldName]
            const ownerAddress = createSafeFormValues[addressFieldName]
            return (
              <React.Fragment key={`owner-${addressFieldName}`}>
                <OwnersAddressesContainer>
                  <Col align="center" xs={12} data-testid={`create-safe-owner-details-${ownerAddress}`}>
                    <PrefixedEthHashInfo
                      hash={ownerAddress}
                      name={ownerName}
                      showAvatar
                      showCopyBtn
                      explorerUrl={getExplorerInfo(ownerAddress)}
                    />
                  </Col>
                  {owners.length - 1 !== index && (
                    <Col
                      align="center"
                      xs={12}
                      data-testid={`create-safe-owner-details-${ownerAddress}`}
                      style={{ marginTop: 10 }}
                    >
                      <Hairline />
                    </Col>
                  )}
                </OwnersAddressesContainer>
              </React.Fragment>
            )
          })}
        </TableContainer>
      </Col>
      <DescriptionContainer align="center">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={InformationIcon} style={{ marginRight: 5 }} />
          <Paragraph color="textaura" noMargin size="smd">
            You&apos;re about to create a new Safe on <NetworkLabel />. Other listed owners will see that you are about
            to create a Safe with them and will all have to give permission in order for the Safe to be created and
            used.
          </Paragraph>
        </div>
      </DescriptionContainer>
    </Row>
  )
}

export default ReviewNewSafeStep
