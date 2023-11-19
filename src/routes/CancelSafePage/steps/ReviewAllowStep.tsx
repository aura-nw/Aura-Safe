import TableContainer from '@material-ui/core/TableContainer'
import { Fragment, ReactElement } from 'react'
import { useForm } from 'react-final-form'
import styled from 'styled-components'

import Block from 'src/components/layout/Block'
import Col from 'src/components/layout/Col'
import Hairline from 'src/components/layout/Hairline'
import Paragraph from 'src/components/layout/Paragraph'
import Row from 'src/components/layout/Row'
import NetworkLabel from 'src/components/NetworkLabel/NetworkLabel'
import PrefixedEthHashInfo from 'src/components/PrefixedEthHashInfo'
import { getExplorerInfo } from 'src/config'
import { border, lg, sm, xs } from 'src/theme/variables'
import {
  CancelSafeFormValues,
  FIELD_CREATE_SUGGESTED_SAFE_NAME,
  FIELD_SAFE_CREATED_ADDRESS,
  FIELD_SAFE_OWNERS_LIST,
  FIELD_SAFE_THRESHOLD,
} from '../fields/cancelSafeFields'

function ReviewAllowStep(): ReactElement {
  const loadSafeForm = useForm()

  const formValues = loadSafeForm.getState().values as CancelSafeFormValues

  const threshold = formValues[FIELD_SAFE_THRESHOLD]
  const ownerList = formValues[FIELD_SAFE_OWNERS_LIST] || []
  const safeName = formValues[FIELD_CREATE_SUGGESTED_SAFE_NAME] || ''
  const safeCreatedAddress = formValues[FIELD_SAFE_CREATED_ADDRESS] || ''

  const safeCreatedAddressName = ownerList.find((owner) => owner.address === safeCreatedAddress)?.name || ''

  const ownerListWithNames = [...ownerList]

  return (
    <Row data-testid={'load-safe-review-step'}>
      <Col layout="column" xs={4}>
        <DetailsContainer>
          <Block margin="lg">
            <Paragraph color="primary" noMargin size="lg" data-testid="load-safe-step-three">
              Review details
            </Paragraph>
          </Block>
          <Block margin="lg">
            <Paragraph color="disabled" noMargin size="sm">
              Network
            </Paragraph>
            <StyledParagraph color="disabled" noMargin size="sm" data-testid="load-form-review-safe-network">
              <NetworkLabel />
            </StyledParagraph>
          </Block>
          <Block margin="lg">
            <Paragraph color="disabled" noMargin size="sm">
              Name of the Safe
            </Paragraph>
            <SafeNameParagraph
              color="primary"
              noMargin
              size="md"
              weight="bolder"
              data-testid="create-safe-review-safe-name"
            >
              {safeName}
            </SafeNameParagraph>
          </Block>
          {safeCreatedAddress ? (
            <Block margin="lg">
              <Paragraph color="disabled" noMargin size="sm">
                Created by
              </Paragraph>
              <SafeAddressContainer>
                <PrefixedEthHashInfo
                  hash={safeCreatedAddress}
                  name={safeCreatedAddressName}
                  shortenHash={4}
                  showAvatar
                  showCopyBtn
                  explorerUrl={getExplorerInfo(safeCreatedAddress)}
                />
              </SafeAddressContainer>
            </Block>
          ) : null}
          {ownerList ? (
            <Block margin="lg">
              <Paragraph color="disabled" noMargin size="sm">
                Any transaction requires the confirmation of:
              </Paragraph>
              <Paragraph color="primary" noMargin size="lg" weight="bolder">
                {`${threshold} out of ${ownerList.length} owners`}
              </Paragraph>
            </Block>
          ) : null}
        </DetailsContainer>
      </Col>
      <Col layout="column" xs={8}>
        <TableContainer>
          <OwnersContainer>
            <Paragraph color="primary" noMargin size="lg">
              {`${ownerList.length} Safe owners`}
            </Paragraph>
          </OwnersContainer>
          <Hairline />
          {ownerListWithNames
            ? ownerListWithNames.map((owner, index) => (
                <Fragment key={owner.address}>
                  <OwnerItemContainer testId={'load-safe-review-owner-name-' + index}>
                    <Col align="center" xs={12}>
                      <PrefixedEthHashInfo
                        hash={owner.address}
                        name={owner.name}
                        showAvatar
                        showCopyBtn
                        explorerUrl={getExplorerInfo(owner.address)}
                      />
                    </Col>
                  </OwnerItemContainer>
                  {index !== ownerList.length - 1 && <Hairline />}
                </Fragment>
              ))
            : null}
        </TableContainer>
      </Col>
    </Row>
  )
}

export default ReviewAllowStep

const DetailsContainer = styled(Block)`
  padding: ${lg};
  border-right: solid 1px ${border};
  height: 100%;
`

const OwnersContainer = styled(Block)`
  padding: ${lg};
`

const OwnerItemContainer = styled(Row)`
  align-items: center;
  min-width: fit-content;
  padding: ${sm};
  padding-left: ${lg};
`

const SafeAddressContainer = styled(Row)`
  margin-top: ${xs};
  align-items: center;
`
const StyledParagraph = styled(Paragraph)`
  margin-top: 4px;
`

const SafeNameParagraph = styled(Paragraph)`
  text-overflow: ellipsis;
  overflow: hidden;
`
