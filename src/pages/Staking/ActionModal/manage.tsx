import NotificationPopup from 'src/components/NotificationPopup'
import Col from 'src/components/layout/Col'
import { convertAmount, formatNativeCurrency, formatWithComma } from 'src/utils'
import { BoxDelegate, TextDelegateNoti, TextGray, TextNotiStyled } from './styles'

export default function ManageModal(props) {
  const { nativeCurrency, dataDelegateOfUser } = props
  const pendingReward: any = convertAmount(dataDelegateOfUser?.delegation?.pendingReward?.amount || 0, false)
  return (
    <>
      <NotificationPopup>
        <div>
          <TextNotiStyled>
            You can <TextDelegateNoti>“Delegate”</TextDelegateNoti> more to this validator{' '}
          </TextNotiStyled>
          <TextNotiStyled style={{ margin: '6px 0px' }}>
            Or use <TextDelegateNoti>“Redelegate”</TextDelegateNoti> to switch your assets to another validator
          </TextNotiStyled>
          <TextNotiStyled>
            Or use <TextDelegateNoti>“Undelegate”</TextDelegateNoti> to start the unbonding
          </TextNotiStyled>
        </div>
      </NotificationPopup>

      <div style={{ display: 'flex', marginTop: 24 }}>
        <Col sm={5} xs={12} layout="column">
          <BoxDelegate>
            <Col sm={7} xs={12}>
              <TextGray>My delegation</TextGray>
            </Col>
            <p>
              {formatNativeCurrency(
                convertAmount(dataDelegateOfUser?.delegation?.delegationBalance?.amount, false) || 0,
              )}
            </p>
          </BoxDelegate>
          <BoxDelegate>
            <Col sm={7} xs={12}>
              <TextGray>Pending Reward</TextGray>
            </Col>
            <p>
              {pendingReward ? pendingReward : 0} <TextGray>{nativeCurrency.symbol}</TextGray>
            </p>
          </BoxDelegate>
        </Col>
        <Col sm={2} />
        <Col sm={5} xs={12} layout="column">
          <BoxDelegate>
            <Col sm={6} xs={12}>
              <TextGray>Delegatable Balance</TextGray>
            </Col>
            <p>
              {formatNativeCurrency(formatWithComma(dataDelegateOfUser?.delegation?.delegatableBalance?.amount || 0))}
            </p>
          </BoxDelegate>
          <BoxDelegate>
            <Col sm={6} xs={12}>
              <TextGray>Total Reward</TextGray>
            </Col>

            <p>
              {formatNativeCurrency(convertAmount(dataDelegateOfUser?.delegation?.claimedReward?.amount || 0, false))}
            </p>
          </BoxDelegate>
        </Col>
      </div>
    </>
  )
}
