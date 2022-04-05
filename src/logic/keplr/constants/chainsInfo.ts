import { ChainInfo } from '@keplr-wallet/types'

export const ChainsInfo: { [chainId: string]: ChainInfo } = {
  ['aura-testnet']: {
    features: ['no-legacy-stdTx'],
    chainId: 'aura-testnet',
    chainName: 'aura testnet',
    rpc: 'https://tendermint-testnet.aura.network',
    rest: 'https://rpc-testnet.aura.network',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'aura',
      bech32PrefixAccPub: 'aura' + 'pub',
      bech32PrefixValAddr: 'aura' + 'valoper',
      bech32PrefixValPub: 'aura' + 'valoperpub',
      bech32PrefixConsAddr: 'aura' + 'valcons',
      bech32PrefixConsPub: 'aura' + 'valconspub',
    },
    currencies: [
      {
        coinDenom: 'AURA',
        coinMinimalDenom: 'uaura',
        coinDecimals: 6,
        // coinGeckoId: "aura",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'AURA',
        coinMinimalDenom: 'uaura',
        coinDecimals: 6,
        // coinGeckoId: "uaura",
      },
    ],
    stakeCurrency: {
      coinDenom: 'AURA',
      coinMinimalDenom: 'uaura',
      coinDecimals: 6,
      // coinGeckoId: "uaura",
    },
    coinType: 118,
    gasPriceStep: {
      low: 1,
      average: 2.5,
      high: 4,
    },
    walletUrlForStaking: 'https://aura.network',
  },
  ['aura-devnet']: {
    features: ['no-legacy-stdTx'],
    chainId: 'aura-devnet',
    chainName: 'aura devnet',
    rpc: 'http://34.199.79.132:26657',
    rest: 'http://34.199.79.132:1317',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'aura',
      bech32PrefixAccPub: 'aura' + 'pub',
      bech32PrefixValAddr: 'aura' + 'valoper',
      bech32PrefixValPub: 'aura' + 'valoperpub',
      bech32PrefixConsAddr: 'aura' + 'valcons',
      bech32PrefixConsPub: 'aura' + 'valconspub',
    },
    currencies: [
      {
        coinDenom: 'AURA',
        coinMinimalDenom: 'uaura',
        coinDecimals: 6,
        // coinGeckoId: "aura",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'AURA',
        coinMinimalDenom: 'uaura',
        coinDecimals: 6,
        // coinGeckoId: "uaura",
      },
    ],
    stakeCurrency: {
      coinDenom: 'AURA',
      coinMinimalDenom: 'uaura',
      coinDecimals: 6,
      // coinGeckoId: "uaura",
    },
    coinType: 118,
    gasPriceStep: {
      low: 1,
      average: 2.5,
      high: 4,
    },
    walletUrlForStaking: 'https://aura.network',
  },
  ['bombay-12']: {
    features: ['no-legacy-stdTx'],
    chainName: 'terra testnet',
    chainId: 'bombay-12',
    rpc: 'https://bombay.stakesystems.io:2053',
    rest: 'https://bombay.stakesystems.io',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'terra',
      bech32PrefixAccPub: 'terra' + 'pub',
      bech32PrefixValAddr: 'terra' + 'valoper',
      bech32PrefixValPub: 'terra' + 'valoperpub',
      bech32PrefixConsAddr: 'terra' + 'valcons',
      bech32PrefixConsPub: 'terra' + 'valconspub',
    },
    currencies: [
      {
        coinDenom: 'LUNA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        // coinGeckoId: "LUNA",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'LUNA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        // coinGeckoId: "uluna",
      },
    ],
    stakeCurrency: {
      coinDenom: 'LUNA',
      coinMinimalDenom: 'uluna',
      coinDecimals: 6,
      // coinGeckoId: "uluna",
    },
    coinType: 118,
    gasPriceStep: {
      low: 1,
      average: 2.5,
      high: 4,
    },
    walletUrlForStaking: 'https://luna.network',
  },
  ['vega-testnet']: {
    chainId: 'vega-testnet',
    chainName: 'vega',
    rpc: 'http://198.50.215.1:46657',
    rest: 'http://198.50.215.1:4317',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'cosmos',
      bech32PrefixAccPub: 'cosmos' + 'pub',
      bech32PrefixValAddr: 'cosmos' + 'valoper',
      bech32PrefixValPub: 'cosmos' + 'valoperpub',
      bech32PrefixConsAddr: 'cosmos' + 'valcons',
      bech32PrefixConsPub: 'cosmos' + 'valconspub',
    },
    currencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
      },
    ],
    stakeCurrency: {
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinDecimals: 6,
      coinGeckoId: 'cosmos',
    },
    coinType: 118,
    gasPriceStep: {
      low: 1,
      average: 1,
      high: 1,
    },
    features: ['stargate', 'ibc-transfer', 'no-legacy-stdTx'],
  },
  ['osmo-test-4']: {
    features: ['no-legacy-stdTx'],
    chainId: 'osmo-test-4',
    chainName: 'osmosis testnet',
    rpc: 'https://testnet-rpc.osmosis.zone/',
    rest: 'https://osmosistest-lcd.quickapi.com',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'osmo',
      bech32PrefixAccPub: 'osmo' + 'pub',
      bech32PrefixValAddr: 'osmo' + 'valoper',
      bech32PrefixValPub: 'osmo' + 'valoperpub',
      bech32PrefixConsAddr: 'osmo' + 'valcons',
      bech32PrefixConsPub: 'osmo' + 'valconspub',
    },
    currencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        // coinGeckoId: "aura",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        // coinGeckoId: "uaura",
      },
    ],
    stakeCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      // coinGeckoId: "uaura",
    },
    coinType: 118,
    gasPriceStep: {
      low: 1,
      average: 2.5,
      high: 4,
    },
  },
}
