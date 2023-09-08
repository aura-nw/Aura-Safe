import { getNativeCurrency } from 'src/config'
import ListIcon from 'src/layout/Sidebar/ListIcon'
import { convertAmount } from 'src/utils'

type TxAmountProps = {
  amount: number
  token?: any
}
export default function TxAmount({ amount = 0, token }: TxAmountProps) {
  const nativeCurrency = getNativeCurrency()
  return (
    <div className="tx-amount">
      {amount ? (
        <>
          {token?.isNotExist ? (
            <ListIcon type="assestAura" />
          ) : (
            <img className="native-token-img" src={token?.logoUri ?? nativeCurrency.logoUri} alt="native-url-icon" />
          )}

          <p>
            {convertAmount(amount, false, token?.decimals)} {token?.symbol ?? token?.coinDenom ?? nativeCurrency.symbol}
          </p>
        </>
      ) : (
        `-`
      )}
    </div>
  )
}
