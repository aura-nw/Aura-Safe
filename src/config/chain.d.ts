import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'

type ChainName = ChainInfo['chainName']
export type ShortName = ChainInfo['shortName']

// Remain agnostic and follow CGW by using the following
export type ChainId = ChainInfo['chainId']

// Only use the following for edge cases
export const CHAIN_ID: Record<ChainName, ChainId> = {
  // AURA_TESTNET: 'aura-testnet',
  // AURA_SERENITY: 'serenity-testnet-001',
  // AURA_HALO: 'halo-testnet-001',
  // JUNO_TESTNET: 'uni-3',
  // OSMOSIS_TESTNET: 'osmo-test-4',
  // GAIA_TESTNET: 'theta-testnet-001',
  // TERRA_TESTNET: 'bombay-12',
}

// Values match that required of onboard and returned by CGW
export enum WALLETS {
  KEPLR = 'keplr',
  TERRA = 'terraStation',
  COIN98 = 'coin98',
}
