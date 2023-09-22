import { ReactElement, useEffect, useState } from 'react'
import { FilledButton, OutlinedButton } from 'src/components/Button'
import Gap from 'src/components/Gap'
import Loader from 'src/components/Loader'
import DenseTable, { StyledTableCell, StyledTableRow } from 'src/components/Table/DenseTable'
import { convertAmount, formatNativeCurrency } from 'src/utils'
import { Wrapper } from './style'

export default function MyDelegation(props): ReactElement {
  const {
    handleModal,
    availableBalance,
    totalStake,
    rewardAmount,
    validatorOfUser,
    allValidator,
    claimReward,
    disabledButton,
    simulateLoading,
  } = props
  const [data, setData] = useState<any[]>()

  useEffect(() => {
    const dataTemp: any = []
    allValidator?.map((item) => {
      validatorOfUser?.map((i) => {
        if (item.operatorAddress === i.operatorAddress) {
          dataTemp.push({
            ...item,
            balance: i.balance,
            reward: i.reward,
          })
        }
      })
    })
    setData(dataTemp)
  }, [validatorOfUser, allValidator])
  return (
    <Wrapper>
      <div className="stake-management">
        <div className="balance">
          <div>
            <p className="label">Available Balance:</p>
            <p className="amount">
              {formatNativeCurrency(availableBalance?.amount ? convertAmount(availableBalance?.amount, false) : 0)}
            </p>
          </div>
          <Gap height={8} />
          <div>
            <p className="label">Total Staked:</p>
            <p className="amount">
              {formatNativeCurrency(totalStake?.amount ? convertAmount(totalStake?.amount, false) : 0)}
            </p>
          </div>
        </div>
        {rewardAmount[0]?.amount >= 1 && !disabledButton ? (
          <FilledButton className={simulateLoading ? 'loading' : ''} onClick={claimReward}>
            {simulateLoading ? (
              <Loader
                content={
                  <span style={{ fontWeight: 600 }}>
                    Claim Reward:{' '}
                    {formatNativeCurrency(rewardAmount[0] ? convertAmount(rewardAmount[0]?.amount, false) : 0)}
                  </span>
                }
              />
            ) : (
              <span style={{ fontWeight: 600 }}>
                Claim Reward:{' '}
                {formatNativeCurrency(rewardAmount[0] ? convertAmount(rewardAmount[0]?.amount, false) : 0)}
              </span>
            )}
          </FilledButton>
        ) : (
          <div></div>
        )}
      </div>
      {data && data?.length > 0 && (
        <div className="staked-validator">
          <DenseTable headers={['Name', 'Amount Staked', 'Pending Reward', '']}>
            {data?.map((row, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell component="th" scope="row">
                  <div className="validator-cell">
                    <img style={{ marginRight: 5 }} src={row?.description?.picture} />
                    <div>{row.validator}</div>
                  </div>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <div>{formatNativeCurrency(convertAmount(row?.balance?.amount, false))}</div>
                </StyledTableCell>
                <StyledTableCell align="left">
                  {row?.reward?.length > 0 && +row?.reward?.[0]?.amount >= 1 ? 'Yes' : 'No'}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {!disabledButton && (
                    <OutlinedButton className="small" onClick={() => handleModal(row)}>
                      Manage
                    </OutlinedButton>
                  )}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </DenseTable>
        </div>
      )}
    </Wrapper>
  )
}
