import { EthHashInfo } from '@gnosis.pm/safe-react-components'
import { ReactElement } from 'react'
import { useSelector } from 'react-redux'
import { getChainInfo } from 'src/config'
import { copyShortNameSelector, showShortNameSelector } from 'src/logic/appearance/selectors'
import { extractShortChainName } from 'src/routes/routes'
import { getMChainsConfig } from 'src/services'
import { parsePrefixedAddress } from 'src/utils/prefixedAddress'

type Props = Omit<Parameters<typeof EthHashInfo>[0], 'shouldShowShortName' | 'shouldCopyShortName'>

const PrefixedEthHashInfo = ({ hash, ...rest }: Props): ReactElement => {
  const showChainPrefix = useSelector(showShortNameSelector)
  const copyChainPrefix = useSelector(copyShortNameSelector)
  const { address } = parsePrefixedAddress(hash)
  const chainInfo = getChainInfo()

  return (
    <EthHashInfo
      hash={address}
      shortName={chainInfo.shortName}
      shouldShowShortName={showChainPrefix}
      shouldCopyShortName={copyChainPrefix}
      {...rest}
    />
  )
}

export default PrefixedEthHashInfo
