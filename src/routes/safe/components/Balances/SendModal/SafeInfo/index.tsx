import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { getExplorerInfo, getNativeCurrency } from 'src/config'
import { currentSafeWithNames } from 'src/logic/safe/store/selectors'
import Paragraph from 'src/components/layout/Paragraph'
import Bold from 'src/components/layout/Bold'
import { border, xs } from 'src/theme/variables'
import Block from 'src/components/layout/Block'
import PrefixedEthHashInfo from 'src/components/PrefixedEthHashInfo'

const StyledBlock = styled(Block)`
  font-size: 12px;
  line-height: 1.08;
  letter-spacing: -0.5px;
  background-color: ${border};
  width: fit-content;
  padding: 5px 10px;
  margin-top: ${xs};
  margin-left: 40px;
  border-radius: 3px;
`

const SafeInfo = (): React.ReactElement => {
  const { address: safeAddress, nativeBalance, name: safeName } = useSelector(currentSafeWithNames)
  const nativeCurrency = getNativeCurrency()

  return (
    <>
      <PrefixedEthHashInfo
        hash={safeAddress}
        name={safeName}
        explorerUrl={getExplorerInfo(safeAddress)}
        showAvatar
        showCopyBtn
      />
      {nativeBalance && (
        <StyledBlock>
          <Paragraph noMargin>
            Balance:{' '}
            <Bold data-testid="current-eth-balance">{`${parseFloat(nativeBalance).toFixed(6)} ${
              nativeCurrency.symbol
            }`}</Bold>
          </Paragraph>
        </StyledBlock>
      )}
    </>
  )
}

export default SafeInfo
