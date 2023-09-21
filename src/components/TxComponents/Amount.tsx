import BigNumber from 'bignumber.js'
import { getNativeCurrency } from 'src/config'
import { Token } from 'src/logic/tokens/store/model/token'
import { IFund } from '../JsonschemaForm/FundForm'

const OtherToken = ({ token, hideLogo, nativeCurrency }) => {
  return (
    <div className="amount" key={token.denom}>
      {!hideLogo && <img alt={'nonnativeCurrencyLogoUri'} height={25} src={token?.logoUri || nativeCurrency.logoUri} />}
      <p>
        {+token.amount} {token.symbol}
      </p>
    </div>
  )
}

export default function Amount({
  label = 'Amount',
  amount = '0',
  token,
  listTokens,
  hideLogo,
  nativeFee = 0,
}: {
  label?: string
  amount?: string
  token?: Token
  listTokens?: IFund[]
  hideLogo?: boolean
  nativeFee?: number
}) {
  const nativeCurrency = getNativeCurrency()
  const nativeToken = listTokens?.find((token) => token.type === 'native')
  const otherToken = listTokens?.filter((token: IFund) => token.type !== 'native')

  return (
    <div className="total-amount">
      <p className="title"> {label}</p>
      {listTokens ? (
        <>
          <div className="amount">
            {!hideLogo && <img alt={'nativeCurrencyLogoUri'} height={25} src={nativeCurrency.logoUri} />}
            {nativeToken ? (
              <p>
                {new BigNumber(nativeFee).plus(new BigNumber(+nativeToken.amount)).toString()} {nativeToken.symbol}
              </p>
            ) : (
              <p>{amount}</p>
            )}
          </div>
          {otherToken?.map((token: IFund) => (
            // eslint-disable-next-line react/jsx-key
            <OtherToken token={token} hideLogo={hideLogo} nativeCurrency={nativeCurrency} />
          ))}
        </>
      ) : (
        <div className="amount">
          {!hideLogo && (
            <img alt={'nativeCurrencyLogoUri'} height={25} src={token?.logoUri || nativeCurrency.logoUri} />
          )}
          <p>{amount}</p>
        </div>
      )}
    </div>
  )
}
