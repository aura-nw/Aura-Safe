import styled from 'styled-components'

export const Wrapper = styled.div`
  border-radius: 12px;
  overflow: hidden;
  > .stake-management {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #24262e;
    padding: 24px;
    > div.balance {
      width: 100%;
      max-width: 444px;
      margin-right: 16px;
      > div {
        align-items: center;
        display: flex;
        justify-content: space-between;
        p {
          margin: 0;
        }
        > .label {
          font-weight: 500;
          font-size: 14px;
          line-height: 16px;
          color: #b4b8c0;
        }
        > .amount {
          font-size: 16px;
          line-height: 24px;
        }
      }
    }
  }
  .staked-validator {
    background: #24262e;
  }
  .validator-cell {
    display: flex;
    align-items: center;
    > img {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
    > div {
      margin: 0px 0px 0px 8px;
      font-weight: 600;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0.01em;
      color: #2cb1f5;
    }
  }
`
