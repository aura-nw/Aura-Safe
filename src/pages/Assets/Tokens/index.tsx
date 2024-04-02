import { ChangeEvent, ReactElement, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import sendIcon from 'src/assets/icons/ArrowUpRight.svg'
import { FilledButton, OutlinedNeutralButton } from 'src/components/Button'
import SearchInput from 'src/components/Input/Search'
import SendingPopup from 'src/components/Popup/SendingPopup'
import DenseTable, { StyledTableCell, StyledTableRow } from 'src/components/Table/DenseTable'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import { Token } from 'src/logic/tokens/store/model/token'
import { formatWithComma } from 'src/utils'
import { extendedSafeTokensSelector } from 'src/utils/safeUtils/selector'
import styled from 'styled-components'
import ImportTokenPopup from './ImportTokenPopup'
import ManageTokenPopup from './ManageTokenPopup'
import Checkbox from 'src/components/Input/Checkbox'
import { updateSafe } from 'src/logic/safe/store/actions/updateSafe'
import { loadFromLocalStorage } from 'src/utils/storage/local'
import { LS_TOKEN_CONFIG } from 'src/utils/constants'
import useSafeActions from 'src/logic/safe/hooks/useSafeActions'
import Modal from 'src/components/Modal'
import { extractSafeAddress } from 'src/routes/routes'
import ReceiveModal from 'src/App/ReceiveModal'

const Wrap = styled.div`
  background: ${(props) => props.theme.backgroundPrimary};
  border-radius: 8px;
  overflow: hidden;
  margin-top: 24px;
  > .header {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    > div:nth-child(2) {
      display: flex;
      gap: 32px;
    }
    > .title {
      font-weight: 600;
      font-size: 22px;
      line-height: 28px;
    }
    .search-input {
      min-width: 300px;
    }
  }
`
const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 18px;
  text-transform: uppercase;
  img {
    width: 24px;
    height: 24px;
    border-radius: 12px;
  }
`
const TokenType = styled.div`
  padding: 8px 16px;
  border-radius: 8px;
  width: fit-content;
  text-transform: uppercase;
  &.ibc {
    background: #273033;
    color: #67c091;
  }
  &.CW20,
  &.cw20 {
    color: #ffba69;
    background: #3d3730;
  }
`
const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  .label {
    margin-left: 8px;
  }
`
let updatedListTokens
function Tokens(props): ReactElement {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [manageTokenPopupOpen, setManageTokenPopupOpen] = useState(false)
  const [keepMountedManagePopup, setKeepMoutedManagePopup] = useState(true)
  const [importTokenPopup, setImportTokenPopup] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const safeTokens: any = useSelector(extendedSafeTokensSelector)
  const { name: safeName, address, isHideZeroBalance, coinConfig: coinConfigState } = useSelector(currentSafeWithNames)
  const [hideZeroBalance, setHideZeroBalance] = useState(isHideZeroBalance)
  const coinConfigStorage = loadFromLocalStorage(LS_TOKEN_CONFIG) as any[]
  const coinConfig = coinConfigStorage ?? coinConfigState
  const { onShow, onHide, safeActionsState } = useSafeActions()
  const safeAddress = extractSafeAddress()

  const onReceiveShow = () => onShow('Receive')
  const onReceiveHide = () => onHide('Receive')

  const getDefaultTokenConfig = (token) => ({
    address: token.address,
    balance: { tokenBalance: 0 },
    cosmosDenom: token?.cosmosDenom,
    decimals: token?.decimals ?? 6,
    denom: token?.tokenType === 'cw20' ? token.symbol : token.minCoinDenom,
    logoUri: (token?.icon || token?.logoUri) ?? 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/aura.png',
    name: token.name,
    symbol: token?.tokenType === 'cw20' ? token.symbol : token.coinDenom,
    type: token?.tokenType,
  })

  const filteredTokens = coinConfig
    ?.filter(
      (configToken) =>
        configToken.enable &&
        !safeTokens.some(
          (token) => token.address === configToken.address || token.address === configToken.tokenAddress,
        ),
    )
    .map((token) => getDefaultTokenConfig(token))

  const tokenConfig = [...safeTokens, ...(filteredTokens ?? [])].filter((token) => token.type === 'native' || coinConfig?.find((coin) => coin.address === token.address)?.enable)

  const [listToken, setListToken] = useState(
    isHideZeroBalance ? tokenConfig.filter((token) => token.balance.tokenBalance > 0) : tokenConfig,
  )

  useEffect(() => {
    updatedListTokens = hideZeroBalance ? tokenConfig.filter((token) => token.balance.tokenBalance > 0) : tokenConfig
    setListToken(
      updatedListTokens?.filter((token) => {
        return token?.name?.toLowerCase().includes(search) || token?.address?.toLowerCase().includes(search)
      }),
    )
  }, [safeTokens, hideZeroBalance, coinConfigState])

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase()
    setSearch(searchTerm)
    const filteredTokens = updatedListTokens?.filter((token) => {
      return (
        token?.name?.toLowerCase().includes(searchTerm.trim()) ||
        token?.address?.toLowerCase().includes(searchTerm.trim())
      )
    })
    setListToken(filteredTokens)
  }

  const handleFilterListToken = () => {
    setHideZeroBalance(!hideZeroBalance)
    dispatch(
      updateSafe({
        address,
        isHideZeroBalance: !hideZeroBalance,
      }),
    )
  }

  return (
    <Wrap>
      <div className="header">
        <div className="title">Token list</div>
        <div>
          <CheckboxWrapper>
            <Checkbox checked={hideZeroBalance} onChange={handleFilterListToken} />
            <div className="label">Hide zero balances</div>
          </CheckboxWrapper>

          <SearchInput placeholder="Search by name/Token ID" onChange={handleSearch} />
          <FilledButton
            className="small"
            onClick={() => {
              setManageTokenPopupOpen(true)
              setKeepMoutedManagePopup(true)
            }}
          >
            Manage token
          </FilledButton>
        </div>
      </div>
      <DenseTable headers={['Name', 'Token Type', 'Balance', ' ']} showPagination={true}>
        {listToken.map((token: Token, index: number) => {
          return (
            <StyledTableRow key={index}>
              <StyledTableCell style={{ width: '30%' }}>
                <TokenInfo>
                  <img src={token?.logoUri || ''} alt="" />
                  {token.name || 'Unkonwn token'}
                </TokenInfo>
              </StyledTableCell>
              <StyledTableCell>
                <TokenType className={token.type}>{token.type == 'native' ? '' : token.type}</TokenType>
              </StyledTableCell>
              <StyledTableCell>{formatWithComma(token.balance.tokenBalance)}</StyledTableCell>
              <StyledTableCell align="right">
                <div>
                  <OutlinedNeutralButton
                    className="small"
                    onClick={() => {
                      setOpen(true)
                      setSelectedToken(token?.address)
                    }}
                  >
                    <img src={sendIcon} alt="" />
                    Send
                  </OutlinedNeutralButton>
                  <OutlinedNeutralButton className="small" style={{ marginLeft: 8 }} onClick={onReceiveShow}>
                    <img style={{ transform: 'rotate(180deg)' }} src={sendIcon} alt="" />
                    Receive
                  </OutlinedNeutralButton>
                </div>
              </StyledTableCell>
            </StyledTableRow>
          )
        })}
      </DenseTable>
      <SendingPopup defaultToken={selectedToken} open={open} onOpen={() => { }} onClose={() => setOpen(false)} />
      {keepMountedManagePopup && (
        <ManageTokenPopup
          open={manageTokenPopupOpen}
          onImport={() => {
            setImportTokenPopup(true)
          }}
          onClose={() => {
            setManageTokenPopupOpen(false)
          }}
          keepMountedManagePopup={keepMountedManagePopup}
          setKeepMoutedManagePopup={setKeepMoutedManagePopup}
        />
      )}
      <ImportTokenPopup
        open={importTokenPopup}
        onBack={() => {
          setImportTokenPopup(false)
          setManageTokenPopupOpen(true)
          setKeepMoutedManagePopup(true)
        }}
        onClose={() => {
          setImportTokenPopup(false)
          setKeepMoutedManagePopup(false)
        }}
      />
      <Modal
        description="Receive Tokens Form"
        handleClose={onReceiveHide}
        open={safeActionsState.showReceive}
        paperClassName="receive-modal"
        title="Receive Tokens"
      >
        <ReceiveModal onClose={onReceiveHide} safeAddress={safeAddress} safeName={safeName} />
      </Modal>
    </Wrap>
  )
}

export default Tokens
