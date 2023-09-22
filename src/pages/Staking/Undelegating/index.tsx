import { ReactElement, useEffect, useState } from 'react'
import Col from 'src/components/layout/Col'
import DenseTable, { StyledTableCell, StyledTableRow } from 'src/components/Table/DenseTable'
import { getNativeCurrency } from 'src/config'
import { convertAmount, formatNativeCurrency } from 'src/utils'
import { formatTimeInWords, getUTCStartOfDate } from 'src/utils/date'
import styled from 'styled-components'

const BoxCardStaking = styled.div`
  margin: 16px 0px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: #363843;
  align-items: flex-start;
`
const TotalDelegate = styled.div`
  display: flex;
`

const ImgStyled = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`

const BoxImg = styled.div`
  display: flex;
  align-self: center;
  > .validator-name {
    margin: 0px 0px 0px 8px;
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0.01em;
    color: #2cb1f5;
  }
`

function Undelegating(props): ReactElement {
  const { unValidatorOfUser, allValidator } = props
  const [data, setData] = useState([])

  useEffect(() => {
    const dataTemp: any = []
    allValidator?.map((item) => {
      unValidatorOfUser?.map((i) => {
        if (item.operatorAddress === i.operatorAddress) {
          dataTemp.push({
            ...item,
            completionTime: i.completionTime,
            balance: i.balance,
          })
        }
      })
    })
    setData(dataTemp)
  }, [allValidator])

  return (
    <BoxCardStaking>
      <DenseTable headers={['Undelegating', 'Amount']}>
        {data?.map((item: any, index) => {
          return (
            <StyledTableRow key={index}>
              <StyledTableCell component="th" scope="row">
                <Col sm={2} xs={12}>
                  <BoxImg>
                    <ImgStyled src={item?.description?.picture} alt="DokiaCapital" />

                    <div className="validator-name">{item.validator}</div>
                  </BoxImg>
                </Col>
              </StyledTableCell>
              <StyledTableCell align="left">
                <Col end="lg" sm={2} xs={12}>
                  <div>
                    <TotalDelegate>
                      <div>{formatNativeCurrency(convertAmount(item?.balance || 0, false))}</div>
                    </TotalDelegate>
                    <div style={{ fontSize: 12, color: '#868A97' }}>
                      {formatTimeInWords(getUTCStartOfDate(item?.completionTime))}
                    </div>
                  </div>
                </Col>
              </StyledTableCell>
            </StyledTableRow>
          )
        })}
      </DenseTable>
    </BoxCardStaking>
  )
}

export default Undelegating
