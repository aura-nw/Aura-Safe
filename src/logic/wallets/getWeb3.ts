import Safe, { Web3Adapter } from '@gnosis.pm/safe-core-sdk'
import semverSatisfies from 'semver/functions/satisfies'
// import Web3 from 'web3'
// import { provider as Provider } from 'web3-core'
// import { ContentHash } from 'web3-eth-ens'

import { getRpcServiceUrl, _getChainId } from 'src/config'
import { ChainId, CHAIN_ID } from 'src/config/chain.d'
import { isValidCryptoDomainName } from 'src/logic/wallets/ethAddresses'
import { ZERO_ADDRESS } from './ethAddresses'
import { EMPTY_DATA } from './ethTransactions'
import { ProviderProps } from './store/model/provider'
import { getAddressFromUnstoppableDomain } from './utils/unstoppableDomains'

// This providers have direct relation with name assigned in bnc-onboard configuration
export enum WALLET_PROVIDER {
  KEPLR = 'KEPLR',
  COIN98 = 'COIN98',
}

// With some wallets from web3connect you have to use their provider instance only for signing
// And our own one to fetch data
// const httpProviderOptions = {
//   timeout: 10_000,
// }

const web3ReadOnly: any[] = []
export const getWeb3ReadOnly = (): any => {
  const chainId = _getChainId()
  if (!web3ReadOnly[chainId]) {
    // web3ReadOnly[chainId] = new Web3(
    //   process.env.NODE_ENV !== 'test'
    //     ? new Web3.providers.HttpProvider(getRpcServiceUrl(), httpProviderOptions)
    //     : 'ws://localhost:8545',
    // )
  }

  return web3ReadOnly[chainId]
}

let web3: any
export const getWeb3 = (): any => web3
export const setWeb3 = (provider: any): void => {
  // web3 = new Web3(provider)
}
export const setWeb3ReadOnly = (): void => {
  web3 = getWeb3ReadOnly()
}
export const resetWeb3 = (): void => {
  web3 = web3ReadOnly[_getChainId()]
}

export const getAccountFrom = async (web3Provider: any): Promise<string | null> => {
  const accounts = await web3Provider.eth.getAccounts()
  return accounts && accounts.length > 0 ? accounts[0] : null
}

export const getChainIdFrom = (web3Provider: any): Promise<number> => {
  return web3Provider.eth.getChainId()
}

const isHardwareWallet = (walletName: string) => false
// sameAddress(WALLET_PROVIDER.LEDGER, walletName) || sameAddress(WALLET_PROVIDER.TREZOR, walletName)

export const isSmartContractWallet = async (web3Provider: any, account: string): Promise<boolean> => {
  if (!account) {
    return false
  }
  let contractCode = ''
  try {
    contractCode = await web3Provider.eth.getCode(account)
  } catch (e) {
    // ignore
  }
  return !!contractCode && contractCode.replace(EMPTY_DATA, '').replace(/0/g, '') !== ''
}

export const getProviderInfo = async (web3Instance: any, providerName = 'Wallet'): Promise<ProviderProps> => {
  const account = (await getAccountFrom(web3Instance)) || ''
  const network = await getChainIdFrom(web3Instance)
  const smartContractWallet = await isSmartContractWallet(web3Instance, account)
  const hardwareWallet = isHardwareWallet(providerName)
  const available = Boolean(account)

  return {
    name: providerName,
    available,
    loaded: true,
    account,
    network: network.toString() as ChainId,
    smartContractWallet,
    hardwareWallet,
  }
}

export const getAddressFromDomain = (name: string): Promise<string> => {
  if (isValidCryptoDomainName(name)) {
    return getAddressFromUnstoppableDomain(name)
  }
  return getWeb3ReadOnly().eth.ens.getAddress(name)
}

// export const getContentFromENS = (name: string): Promise<any> => web3.eth.ens.getContenthash(name)

export const isTxPendingError = (err: Error): boolean => {
  const WEB3_TX_NOT_MINED_ERROR = 'Transaction was not mined within'
  return (err.message || '').startsWith(WEB3_TX_NOT_MINED_ERROR)
}

export const getSDKWeb3Adapter = (signerAddress: string): Web3Adapter => {
  return new Web3Adapter({
    web3: getWeb3(),
    signerAddress,
  })
}

export const getSDKWeb3ReadOnly = (): Web3Adapter => {
  return new Web3Adapter({
    web3: getWeb3ReadOnly(),
    signerAddress: ZERO_ADDRESS,
  })
}

export const getSafeSDK = async (signerAddress: string, safeAddress: string, safeVersion: string): Promise<Safe> => {
  const networkId = (await getChainIdFrom(web3)).toString() as ChainId
  const ethAdapter = getSDKWeb3Adapter(signerAddress)

  let isL1SafeMasterCopy: boolean
  if (semverSatisfies(safeVersion, '<1.3.0')) {
    isL1SafeMasterCopy = true
  } else {
    isL1SafeMasterCopy = networkId === CHAIN_ID.ETHEREUM
  }

  return await Safe.create({
    ethAdapter,
    safeAddress,
    isL1SafeMasterCopy,
  })
}
