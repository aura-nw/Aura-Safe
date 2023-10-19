import { Text as AuraText } from '@aura/safe-react-components'
import { ReactElement, useState } from 'react'
import styled from 'styled-components'

import { AccordionDetails } from '@material-ui/core'
import DoneIcon from 'src/assets/icons/done-icon.svg'
import ExecuteIcon from 'src/assets/icons/excute-icon.svg'
import NotExecuteIcon from 'src/assets/icons/execute.svg'
import PlusIcon from 'src/assets/icons/plus-icon.svg'
import CircleRedIcon from 'src/assets/icons/rejected.svg'
import AddressInfo from 'src/components/AddressInfo'
import Img from 'src/components/layout/Img'
import { NoPaddingSmallAccordion, OwnerList, OwnerListItem, StyledSmallAccordionSummary } from '../../styled'

const StyledImg = styled(Img)`
  background-color: transparent;
  border-radius: 50%;
`

const Text = styled(AuraText)`
  margin-bottom: 6px;
`

const RedStyledLabel = styled.span`
  color: #e65e5e;
`

const ErrorMsg = styled.span`
  color: #d5625e;
  font-size: 12px;
  margin-top: 10px;
`

export const TxOwners = ({ txDetails }: { txDetails: any }): ReactElement | null => {
  if (!txDetails.confirmations) {
    return null
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showErr, setShowErr] = useState<boolean>(false)
  const confirmationsNeeded = txDetails.confirmationsRequired - txDetails.confirmations.length
  const CreationNode = (
    <OwnerListItem>
      <span className="icon">
        <img src={PlusIcon} alt="Aura Safe" />
      </span>
      <div className="legend">
        <Text color="linkAura" size="lg" strong>
          Created
        </Text>
      </div>
    </OwnerListItem>
  )

  return (
    <OwnerList>
      {CreationNode}
      {txDetails.confirmations.map(({ signer }) => {
        return (
          <OwnerListItem key={signer.value}>
            <span className="icon">
              <img src={DoneIcon} alt="Aura Safe" />
            </span>
            <div className="legend">
              <Text color="linkAura" size="lg" strong>
                <span style={{ fontWeight: 700 }}>Confirmed</span>
              </Text>
              <AddressInfo
                address={signer.value}
                name={signer?.name || undefined}
                avatarUrl={signer?.logoUri || undefined}
              />
            </div>
          </OwnerListItem>
        )
      })}
      {txDetails.rejectors?.map(({ value, name, logoUri }) => (
        <OwnerListItem key={value}>
          <span className="icon">
            <img src={CircleRedIcon} alt="Aura Safe" />
          </span>
          <div className="legend">
            <Text color="failAura" size="lg" strong>
              <span style={{ fontWeight: 700 }}>Rejected</span>
            </Text>
            <AddressInfo address={value} name={name || undefined} avatarUrl={logoUri || undefined} />
          </div>
        </OwnerListItem>
      ))}
      {txDetails.executor && (
        <OwnerListItem>
          <span className="icon">
            <img src={DoneIcon} alt="Aura Safe" />
          </span>
          <div className="legend">
            <Text color="linkAura" size="lg" strong>
              Executed
            </Text>
            <AddressInfo
              address={txDetails.executor.value}
              name={txDetails.executor?.name || undefined}
              avatarUrl={txDetails.executor?.logoUri || undefined}
            />
          </div>
        </OwnerListItem>
      )}
      {!txDetails.executor && confirmationsNeeded <= 0 && !txDetails.deletedBy && (
        <OwnerListItem className="isPending">
          <span className="icon">
            <StyledImg alt="" src={ExecuteIcon} />
          </span>
          <div className="legend">
            <Text color="linkAura" size="lg" strong>
              Execute
            </Text>
          </div>
        </OwnerListItem>
      )}
      {confirmationsNeeded > 0 && !txDetails.deletedBy && (
        <OwnerListItem className="isPending">
          <span className="icon">
            <StyledImg alt="" src={NotExecuteIcon} />
          </span>
          <div className="legend">
            <Text color="disableAura" size="lg" strong>
              <span style={{ fontWeight: 700 }}>
                Execute ({confirmationsNeeded} more {confirmationsNeeded === 1 ? 'confirmation' : 'confirmations'}{' '}
                needed)
              </span>
            </Text>
          </div>
        </OwnerListItem>
      )}
      {txDetails.deletedBy && (
        <OwnerListItem>
          <span className="icon">
            <img src={CircleRedIcon} alt="Aura Safe" />
          </span>
          <div className="legend">
            <Text color="failAura" size="lg" strong>
              <span style={{ fontWeight: 700 }}>Deleted</span>
            </Text>
            <AddressInfo address={txDetails.deletedBy.ownerAddress} />
          </div>
        </OwnerListItem>
      )}
      {txDetails.logs && (
        <NoPaddingSmallAccordion expanded={showErr} onChange={() => setShowErr(!showErr)}>
          <StyledSmallAccordionSummary>
            <RedStyledLabel>{showErr ? 'Hide error detail' : 'Show error detail'}</RedStyledLabel>
          </StyledSmallAccordionSummary>
          <AccordionDetails>
            <ErrorMsg>{txDetails.logs}</ErrorMsg>
          </AccordionDetails>
        </NoPaddingSmallAccordion>
      )}
    </OwnerList>
  )
}
