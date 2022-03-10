import { store } from 'src/store'
import { Keplr } from "@keplr-wallet/types";
import { getChainInfo, getInternalChainId, _getChainId } from "../../config";
import { makeProvider, ProviderProps } from '../wallets/store/model/provider';
import { Dispatch } from 'redux';
import { addProvider, removeProvider } from '../wallets/store/actions';
import enqueueSnackbar from '../notifications/store/actions/enqueueSnackbar';
import { enhanceSnackbarForAction, NOTIFICATIONS } from '../notifications';
import { trackAnalyticsEvent, WALLET_EVENTS } from '../../utils/googleAnalytics';
import { saveToStorage } from 'src/utils/storage';
import { LAST_USED_PROVIDER_KEY } from '../wallets/store/middlewares/providerWatcher';
import { parseToAdress } from 'src/utils/parseByteAdress';
import { ChainsInfo } from './constants/chainsInfo';


export type WalletKey = {
  myAddress: string,
  myPubkey: string
}

export enum KeplrErrors {
  Success = 'OK',
  Failed = 'FAILED',
  NoChainInfo = 'THERE IS NO CHAIN INFO FOR',
  SameChain = 'SAME CHAIN IS ALREADY REGISTERED',
  NotRegistered = 'CHAIN IS NOT REGISTERED',
  RequestRejected = 'REQUEST REJECTED',
  NotInstall = 'NOT INSTALL'
}

export async function getKeplr(): Promise<Keplr | undefined> {
  if (window.keplr) {
    return window.keplr;
  }

  if (document.readyState === "complete") {
    return window.keplr;
  }


  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve(window.keplr);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
}

export async function getKeplrKey(chainId: string): Promise<WalletKey | undefined> {
  const keplr = await getKeplr()

  if (!keplr) return

  const key = await keplr.getKey(chainId)

  return {
    myAddress: String(key.bech32Address),
    myPubkey: parseToAdress(key.pubKey)
  }
}


export async function connectKeplr(): Promise<KeplrErrors> {
  const chainInfo = await getChainInfo()
  const internalChainId = getInternalChainId()
  const chainId = _getChainId()

  const keplr = await getKeplr()
  if (!keplr) {
    alert("Please install keplr extension");
    return KeplrErrors.NotInstall;
  }

  let error = KeplrErrors.Success


  try {
    await keplr.enable(chainId)
      .then(e => keplr.getKey(chainId))
      .then(key => {
        let providerInfo: ProviderProps;
        if (!key) {
          providerInfo = {
            account: '',
            available: false,
            hardwareWallet: false,
            loaded: false,
            name: '',
            network: '',
            smartContractWallet: false,
            internalChainId
          }
        } else {
          providerInfo = {
            account: key.bech32Address,
            available: true,
            hardwareWallet: false,
            loaded: true,
            name: 'Keplr',
            network: chainInfo.chainId,
            smartContractWallet: false,
            internalChainId
          }

          store.dispatch(removeProvider({ keepStorageKey: true }))

          store.dispatch(fetchProvider(providerInfo))
          saveToStorage(LAST_USED_PROVIDER_KEY, providerInfo.name)
        }
      });

  } catch (e) {
    const message = e.message.toUpperCase()

    if (message.includes(KeplrErrors.NoChainInfo)) {
      // suggestChain()
      error = KeplrErrors.NoChainInfo
    } else {
      error = KeplrErrors.Failed
      store.dispatch(fetchProvider({
        account: '',
        available: false,
        hardwareWallet: false,
        loaded: false,
        name: '',
        network: '',
        smartContractWallet: false,
        internalChainId
      }))
    }

  }

  // await keplr
  //   ?.enable(chainId)
  //   .then((e) => {
  //     return keplr.getKey(chainId)
  //   })
  //   .then((key) => {
  //     let providerInfo: ProviderProps;

  //     if (!key) {
  //       providerInfo = {
  //         account: '',
  //         available: false,
  //         hardwareWallet: false,
  //         loaded: false,
  //         name: '',
  //         network: '',
  //         smartContractWallet: false,
  //         internalChainId
  //       }
  //     } else {
  //       providerInfo = {
  //         account: key.bech32Address,
  //         available: true,
  //         hardwareWallet: false,
  //         loaded: true,
  //         name: 'Keplr',
  //         network: chainInfo.chainId,
  //         smartContractWallet: false,
  //         internalChainId
  //       }

  //       store.dispatch(fetchProvider(providerInfo))
  //       saveToStorage(LAST_USED_PROVIDER_KEY, providerInfo.name)
  //     }

  //   })
  //   .catch((err: Error) => {
  //     store.dispatch(fetchProvider({
  //       account: '',
  //       available: false,
  //       hardwareWallet: false,
  //       loaded: false,
  //       name: '',
  //       network: '',
  //       smartContractWallet: false,
  //       internalChainId
  //     }))

  //     const message = err.message.toUpperCase()

  //     if (message.includes(KeplrErrors.NoChainInfo)) {
  //       error = KeplrErrors.NoChainInfo
  //     } else if (message.includes(KeplrErrors.RequestRejected)) {
  //       error = KeplrErrors.RequestRejected
  //     } else { error = KeplrErrors.Failed }
  //   })

  return error
}


const processProviderResponse = (dispatch: Dispatch, provider: ProviderProps): void => {
  const walletRecord = makeProvider(provider)
  dispatch(addProvider(walletRecord))
}

const handleProviderNotification = (provider: ProviderProps, dispatch: Dispatch<any>): void => {
  const { available, loaded } = provider

  if (!loaded) {
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
  if (ChainsInfo[chainId]) {
    await window['keplr']?.experimentalSuggestChain(ChainsInfo[chainId]);
  } else {
    const result = confirm(`Please add the ${chainId} chain to your Wallet!`)

    if (result) {
      window.open('https://github.com/aura-nw/Aura-Safe/blob/dev/CONNECT_KEPLR.md#i-connect-keplr-wallet-to-aura-testnet')
    }
  }
}

function fetchProvider(providerInfo: ProviderProps): (dispatch: Dispatch<any>) => Promise<void> {
  return async (dispatch: Dispatch<any>) => {
    handleProviderNotification(providerInfo, dispatch)
    processProviderResponse(dispatch, providerInfo)
  }
}