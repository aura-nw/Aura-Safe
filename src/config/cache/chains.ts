import { ChainInfo, RPC_AUTHENTICATION } from '@gnosis.pm/safe-react-gateway-sdk'
import { getMChainsConfig } from '../../services'

// Cache is required as loading Redux store directly is an anit-pattern
let chains: ChainInfo[] = []

export const getChains = (): ChainInfo[] => chains

export const loadChains = async () => {
  const networkList: ChainInfo[] = await getMChainsConfig()
  chains = networkList.map((chain) => {
    return {
      ...chain,
      environment: chain.indexerDb,
    }
  })
  // const { results = [] } = await getChainsConfig(GATEWAY_URL, { limit: 100 })
  // chains = results
  // Set the initail web3 provider after loading chains
  // setWeb3ReadOnly()
}

// An empty template is required because `getChain()` uses `find()` on load
export const emptyChainInfo: ChainInfo = {
  transactionService: '',
  chainId: '',
  chainName: '',
  shortName: '',
  l2: false,
  description: '',
  rpcUri: { authentication: '' as RPC_AUTHENTICATION, value: '' },
  publicRpcUri: { authentication: '' as RPC_AUTHENTICATION, value: '' },
  safeAppsRpcUri: { authentication: '' as RPC_AUTHENTICATION, value: '' },
  blockExplorerUriTemplate: {
    address: '',
    txHash: '',
    api: '',
  },
  nativeCurrency: {
    name: '',
    symbol: '',
    decimals: 0,
    logoUri: '',
  },
  theme: { textColor: '', backgroundColor: '' },
  ensRegistryAddress: '',
  gasPrice: [],
  disabledWallets: [],
  features: [],
  indexerDb: ''
}
