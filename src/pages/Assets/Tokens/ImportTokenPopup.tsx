import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'
import Gap from 'src/components/Gap'
import TextField from 'src/components/Input/TextField'
import Loader from 'src/components/Loader'
import { Popup } from 'src/components/Popup'
import Header from 'src/components/Popup/Header'
import { updateSafe } from 'src/logic/safe/store/actions/updateSafe'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { getDetailToken } from 'src/services'
import { isValidAddress } from 'src/utils/isValidAddress'
import styled from 'styled-components'

const Wrap = styled.div`
  width: 480px;
  > div {
    padding: 24px;
  }
  .err-mess {
    color: #d5625e;
  }
`

export const Footer = styled.div`
  padding: 24px;
  border-top: 1px solid #404047;
  display: flex;
  justify-content: end;
  > button:nth-child(1) {
    margin-right: 24px;
  }
`

type IToken = {
  address: string
  symbol: string
  name: string
  isAddedToken: boolean
  enable: boolean
  decimals: number
}
const defaultToken = {
  address: '',
  symbol: '',
  name: '',
  enable: false,
  isAddedToken: true,
  decimals: 0,
}

const ImportTokenPopup = ({ open, onBack, onClose }) => {
  const dispatch = useDispatch()
  const [token, setToken] = useState<IToken>(defaultToken)
  const { coinConfig, address } = useSelector(currentSafeWithNames)
  const [isVerifiedContract, setIsVerifiedContract] = useState<string | null>(null)

  const getContractDetail = async () => {
    setIsVerifiedContract('loading')
    try {
      const { data } = await getDetailToken(token.address)
      if (data) {
        setIsVerifiedContract('true')
        setToken({ ...token, name: data.name, symbol: data.symbol, decimals: data.decimals })
      }
    } catch (error) {
      setIsVerifiedContract('false')
    }
  }

  useEffect(() => {
    setIsVerifiedContract(null)
    if (!token.address) {
      return
    }
    const isValid = isValidAddress(token.address)
    if (isValid) {
      getContractDetail()
    } else {
      setIsVerifiedContract('false')
    }
  }, [token.address])

  const getContractStatus = () => {
    if (isVerifiedContract === 'loading') {
      return <Loader size={14} />
    }
  }

  const handleImport = () => {
    let newCoinConfig
    if (coinConfig) {
      newCoinConfig = [...coinConfig]
      if (!newCoinConfig.some((item) => item.address === token.address)) {
        newCoinConfig.push(token)
      }
    }
    dispatch(
      updateSafe({
        address,
        coinConfig: newCoinConfig ?? coinConfig,
      }),
    )
    onClose()
    setToken(defaultToken)
  }

  return (
    <Popup open={open} title="Import CW-20 Token">
      <Header
        title="Import CW-20 Token"
        onClose={() => {
          onClose()
          setToken(defaultToken)
        }}
        hideNetwork={true}
      />
      <Wrap>
        <div>
          <TextField
            placeholder="Contract address"
            label="Contract address"
            value={token.address}
            onChange={(value) => setToken({ ...token, address: value.trim() })}
            endIcon={isVerifiedContract != null ? getContractStatus() : null}
            autoFocus={true}
            errorMsg={isVerifiedContract === 'false' ? 'Invalid Token contract address' : ''}
          />
          <Gap height={16} />
          {isVerifiedContract === 'true' ? (
            <>
              <TextField disabled placeholder="" label="Symbol" value={token.symbol} autoFocus={true} />
              <Gap height={16} />
              <TextField disabled placeholder="" label="Denominator" value={token.decimals} autoFocus={true} />
            </>
          ) : (
            <></>
          )}
        </div>

        <Footer>
          <OutlinedNeutralButton
            onClick={() => {
              onBack()
              setToken(defaultToken)
            }}
          >
            Back
          </OutlinedNeutralButton>
          <FilledButton disabled={!(isVerifiedContract === 'true')} onClick={handleImport}>
            Import
          </FilledButton>
        </Footer>
      </Wrap>
    </Popup>
  )
}

export default ImportTokenPopup
