import { Keplr } from '@keplr-wallet/types'
import * as _ from 'lodash'
import { Dispatch } from 'redux'

import { store } from 'src/logic/safe/store'
import { JWT_TOKEN_KEY } from 'src/services/constant/common'
import { getGatewayUrl } from 'src/services/data/environment'
import { saveToStorage } from 'src/utils/storage'
import session from 'src/utils/storage/session'
import { _getChainId, getChainInfo, getInternalChainId } from '../../config'
import { WALLET_EVENTS, trackAnalyticsEvent } from '../../utils/googleAnalytics'
import { NOTIFICATIONS, enhanceSnackbarForAction } from '../notifications'
import enqueueSnackbar from '../notifications/store/actions/enqueueSnackbar'
import { handleConnectWallet } from '../providers/index'
import { WALLETS_NAME } from '../wallets/constant/wallets'
import { addProvider } from '../wallets/store/actions'
import { LAST_USED_PROVIDER_KEY } from '../wallets/store/middlewares/providerWatcher'
import { ProviderProps, makeProvider } from '../wallets/store/model/provider'
export type WalletKey = {
  myAddress: string
  myPubkey: string
}

enum KeplrErrors {
  Success = 'OK',
  Failed = 'FAILED',
  NoChainInfo = 'THERE IS NO CHAIN INFO FOR',
  SameChain = 'SAME CHAIN IS ALREADY REGISTERED',
  NotRegistered = 'CHAIN IS NOT REGISTERED',
  RequestRejected = 'REQUEST REJECTED',
  NotInstall = 'NOT INSTALL',
}

export async function getKeplr(): Promise<Keplr | undefined> {
  if (window.keplr) {
    return window.keplr
  }

  if (document.readyState === 'complete') {
    return window.keplr
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (event.target && (event.target as Document).readyState === 'complete') {
        resolve(window.keplr)
        document.removeEventListener('readystatechange', documentStateChange)
      }
    }

    document.addEventListener('readystatechange', documentStateChange)
  })
}

export async function connectKeplr(): Promise<KeplrErrors> {
  const chainInfo = getChainInfo()
  const internalChainId = getInternalChainId()
  const chainId = _getChainId()
  const keplr = await getKeplr()

  if (!keplr) {
    alert('Please install keplr extension')
    return KeplrErrors.NotInstall
  }
  let error = KeplrErrors.Success
  try {
    await keplr
      .enable(chainId)
      .then(() => keplr.getKey(chainId))
      .then((key: any) => {
        let providerInfo: ProviderProps
        if (!key) {
          store.dispatch(fetchProvider(_getDefaultProvider(internalChainId)))
        } else {
          providerInfo = {
            account: key.bech32Address,
            available: true,
            hardwareWallet: false,
            loaded: true,
            name: WALLETS_NAME.Keplr,
            network: chainInfo.chainId,
            smartContractWallet: false,
            internalChainId,
          }

          const tokenList = session.getItem<
            {
              name: string
              address: string
              token: string
            }[]
          >(JWT_TOKEN_KEY)

          const current = tokenList?.find((e) => e.address === key.bech32Address && e.name === chainId)

          if (current) {
            store.dispatch(fetchProvider(providerInfo))

            saveToStorage(LAST_USED_PROVIDER_KEY, providerInfo.name)
          } else {
            return handleConnectWallet(keplr, chainInfo, key, chainId, internalChainId, providerInfo)
          }
        }
      })
  } catch (e) {
    const message = e.message.toUpperCase()

    if (message.includes(KeplrErrors.NoChainInfo)) {
      // suggestChain()
      error = KeplrErrors.NoChainInfo
    } else {
      error = KeplrErrors.Failed
      store.dispatch(fetchProvider(_getDefaultProvider(internalChainId)))
    }
  }

  return error
}

function _getDefaultProvider(internalChainId: number): ProviderProps {
  return {
    account: '',
    available: false,
    hardwareWallet: false,
    loaded: false,
    name: '',
    network: '',
    smartContractWallet: false,
    internalChainId,
  }
}

const processProviderResponse = (dispatch: Dispatch, provider: ProviderProps): void => {
  const walletRecord = makeProvider(provider)
  dispatch(addProvider(walletRecord))
}

const handleProviderNotification = (provider: ProviderProps, dispatch: Dispatch<any>): void => {
  const { available, loaded } = provider

  if (!loaded) {
    console.error('error loading provider')
    dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.CONNECT_WALLET_ERROR_MSG)))
    return
  }

  if (available) {
    trackAnalyticsEvent({
      ...WALLET_EVENTS.CONNECT_WALLET,
      label: provider.name,
    })
  } else {
    dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.UNLOCK_WALLET_MSG)))
  }
}

export async function suggestChain(chainId = 'aura-testnet'): Promise<any> {
  return getGatewayUrl().then((res: any) => {
    const chainInfo = _.find(res.chainInfo, ['chainId', chainId])
    if (chainInfo) {
      return window['keplr']?.experimentalSuggestChain(chainInfo)
    } else {
      const result = confirm(`Please add the ${chainId} chain to your Wallet!`)

      if (result) {
        window.open(
          'https://github.com/aura-nw/Aura-Safe/blob/dev/CONNECT_KEPLR.md#i-connect-keplr-wallet-to-aura-testnet',
        )
      }

      return null
    }
  })
}

function fetchProvider(providerInfo: ProviderProps): (dispatch: Dispatch<any>) => Promise<void> {
  return async (dispatch: Dispatch<any>) => {
    handleProviderNotification(providerInfo, dispatch)
    processProviderResponse(dispatch, providerInfo)
  }
}
