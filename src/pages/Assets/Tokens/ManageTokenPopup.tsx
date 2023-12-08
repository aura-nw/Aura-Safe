import { Button, Tooltip } from '@material-ui/core'
import { ChangeEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ic_close from 'src/assets/icons/ic_close.svg'
import ic_empty from 'src/assets/icons/ic_empty.svg'
import { FilledButton, OutlinedButton } from 'src/components/Button'
import ButtonHelper from 'src/components/ButtonHelper'
import Checkbox from 'src/components/Input/Checkbox'
import SearchInput from 'src/components/Input/Search'
import { Popup } from 'src/components/Popup'
import Header from 'src/components/Popup/Header'
import { updateSafe } from 'src/logic/safe/store/actions/updateSafe'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import styled from 'styled-components'
import { loadFromLocalStorage, saveToLocalStorage } from 'src/utils/storage/local'
import { LS_TOKEN_CONFIG } from 'src/utils/constants'

const Wrap = styled.div`
  width: 480px;
  > div {
    padding: 24px;
  }
  > div:first-child {
    border-bottom: 1px solid #404047;
  }
  .token-list {
    margin-top: 18px;
    .title {
      font-weight: 600;
      font-size: 16px;
      line-height: 20px;
    }
    .list {
      margin-top: 16px;
      border-radius: 8px;
      padding: 0px 16px;
      background: #363843;
      max-height: 60vh;
      overflow: auto;
    }
  }
  .note {
    margin-top: 8px;
  }
`
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export default function ManageTokenPopup({
  open,
  onImport,
  onClose,
  keepMountedManagePopup,
  setKeepMoutedManagePopup,
}) {
  const dispatch = useDispatch()
  const { address, coinConfig } = useSelector(currentSafeWithNames)
  const coinConfigSetting = loadFromLocalStorage(LS_TOKEN_CONFIG) as any[]
  const [config, setConfig] = useState(coinConfigSetting || coinConfig)

  const applyHandler = () => {
    if (config && config?.length > 0) {
      saveToLocalStorage(LS_TOKEN_CONFIG, config)
      dispatch(
        updateSafe({
          address,
          coinConfig: config,
        }),
      )
    }
    onClose()
    setKeepMoutedManagePopup(false)
  }

  useEffect(() => {
    setConfig(coinConfigSetting || coinConfig)
  }, [address])

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase()
    const filteredTokens = coinConfigSetting?.filter((token) => {
      return (
        token?.symbol?.toLowerCase().includes(searchTerm.trim()) ||
        token?.name?.toLowerCase().includes(searchTerm.trim()) ||
        token?.address?.toLowerCase().includes(searchTerm.trim())
      )
    })
    setConfig(filteredTokens)
  }

  const handleDeleteCoin = (address: string) => {
    const updatedConfig = config?.filter((coin) => coin.address !== address)
    setConfig(updatedConfig)
  }

  return (
    <Popup open={open} title="Manage token" keepMounted={keepMountedManagePopup}>
      <Header
        title="Manage token"
        onClose={() => {
          onClose()
          setConfig(coinConfigSetting)
          setKeepMoutedManagePopup(false)
        }}
        hideNetwork={true}
      />
      <Wrap>
        <div>
          <SearchInput onChange={handleSearch} placeholder="Search by token name, symbol or address" />
          <div className="token-list">
            <Row>
              <div className="title">Token list</div>
              <Button
                color="secondary"
                variant="text"
                onClick={() => {
                  onClose()
                  onImport()
                }}
              >
                Import CW-20 Token
              </Button>
            </Row>
            <div className="list">
              {config && config?.length > 0 ? (
                <>
                  {config?.map((c, i) => {
                    return (
                      <CoinConfig
                        key={i}
                        coin={c}
                        onDelete={handleDeleteCoin}
                        setToggle={() =>
                          setConfig(config.map((cf, id) => (i == id ? { ...cf, enable: !cf.enable } : cf)))
                        }
                      />
                    )
                  })}
                </>
              ) : (
                <Empty
                  onImport={() => {
                    onClose()
                    onImport()
                  }}
                />
              )}
            </div>
            <div className="note">
              Note: Zero balances are auto-hidden & You can only delete the tokens that you have imported manually
            </div>
          </div>
        </div>
        <div style={{ float: 'right' }}>
          <FilledButton onClick={() => applyHandler()}>Apply</FilledButton>
        </div>
      </Wrap>
    </Popup>
  )
}

const CoinWrapper = styled.div`
  margin: 8px 0px;
  min-height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  > div {
    text-transform: uppercase;
  }
  .info {
    display: flex;
    align-items: center;
    .icon {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
  }
  .actions {
    display: flex;
    align-items: center;
    .btn-delete {
      margin-right: 8px;
    }
  }
`
const CoinConfig = ({ setToggle, coin, onDelete }) => {
  return (
    <CoinWrapper>
      <div className="info">
        <img className="icon" src={coin?.logoUri ?? coin.icon} />
        <div>{coin.name}</div>
      </div>
      <div className="actions">
        {coin.isAddedToken ? (
          <div className="btn-delete">
            <ButtonHelper onClick={() => onDelete(coin.address)}>
              <Tooltip arrow placement="top" title="Remove">
                <img src={ic_close} alt="Trash Icon" />
              </Tooltip>
            </ButtonHelper>
          </div>
        ) : (
          <></>
        )}
        {coin.type !== 'native' ? <Checkbox checked={coin.enable || false} onChange={() => setToggle()} /> : <></>}
      </div>
    </CoinWrapper>
  )
}

const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 8px;
  .title {
    font-weight: 600;
    font-size: 14px;
    line-height: 18px;
  }
  .sub-title {
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
  }
  .btn-import {
    margin-top: 8px;
    margin-bottom: 24px;
  }
`
const Empty = ({ onImport }) => {
  return (
    <EmptyWrapper>
      <img src={ic_empty} />
      <div className="title">This token hasn’t been imported</div>
      <div className="sub-title">Do you want to import this token?</div>
      <OutlinedButton className="small btn-import" onClick={onImport}>
        Import
      </OutlinedButton>
    </EmptyWrapper>
  )
}
