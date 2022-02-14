import { ChainInfo } from "@gnosis.pm/safe-react-gateway-sdk";
import axios from "axios";
import { WalletKey } from "src/logic/keplr/keplr";
import { IMSafeInfo, IMSafeResponse, OwnedMSafes } from "../types/safe";
import { MSAFE_GATEWAY_URL } from "../utils/constants";

const baseUrl = MSAFE_GATEWAY_URL;

export interface ISafeCreate {
  creatorAddress: string,
  creatorPubkey: string,
  otherOwnersAddress: string[]
  threshold: number
  internalChainId: number
}
export interface ISafeCancel {
  myAddress: string
}
export interface ISafeAllow {
  safeId: string,
  myAddress: string
}

export interface IResponse<T> {
  AdditionalData: any[]
  Data: T
  ErrorCode: string
  Message: string
}


type _ChainInfo = {
  internalChainId: number
}


export type MChainInfo = ChainInfo & _ChainInfo

export function getMChainsConfig(): Promise<MChainInfo[]> {
  return axios.post(`${baseUrl}/general/network-list`)
    .then(response => {
      const chainList: MChainInfo[] = response.data.Data.map((e: {
        chainId: any; name: any; rpc: any, id: number
      }) => {
        return {
          transactionService: "https://safe-transaction.rinkeby.staging.gnosisdev.com",
          internalChainId: e.id,
          chainId: e.chainId,
          chainName: e.name,
          shortName: "aura",
          l2: false,
          description: "",
          rpcUri: {
            authentication: "API_KEY_PATH",
            value: e.rpc
          },
          safeAppsRpcUri: {
            authentication: "API_KEY_PATH",
            value: e.rpc
          },
          publicRpcUri: {
            authentication: "API_KEY_PATH",
            value: e.rpc
          },
          blockExplorerUriTemplate: {
            address: "https://rinkeby.etherscan.io/address/{{address}}",
            txHash: "https://rinkeby.etherscan.io/tx/{{txHash}}",
            api: "https://api-rinkeby.etherscan.io/api?module={{module}}&action={{action}}&address={{address}}&apiKey={{apiKey}}"
          },
          nativeCurrency: {
            name: "Aura",
            symbol: "Aura",
            decimals: 18,
            logoUri: "https://safe-transaction-assets.staging.gnosisdev.com/chains/4/currency_logo.png"
          },
          theme: {
            textColor: "#ffffff",
            backgroundColor: "#E8673C"
          },
          ensRegistryAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
          gasPrice: [
            {
              type: "ORACLE",
              uri: "https://api-rinkeby.etherscan.io/api?module=gastracker&action=gasoracle&apikey=JNFAU892RF9TJWBU3EV7DJCPIWZY8KEMY1",
              gasParameter: "FastGasPrice",
              gweiFactor: "1000000000.000000000"
            }
          ],
          disabledWallets: [
            "fortmatic",
            "lattice"
          ],
          features: [
            "CONTRACT_INTERACTION",
            "DOMAIN_LOOKUP",
            "EIP1559",
            "ERC721",
            "SAFE_TX_GAS_OPTIONAL",
            "SPENDING_LIMIT"
          ]
        }
      });
      return chainList;
    })
}

export function fetchMSafesByOwner(addressOwner: string, internalChainId: number): Promise<OwnedMSafes> {
  return axios.get(`${baseUrl}/owner/${addressOwner}/safes`, {
    params: {
      internalChainId
    }
  }).then(res => res.data.Data)
}

export function createMSafe(safes: ISafeCreate): Promise<IResponse<IMSafeResponse>> {
  return axios.post(`${baseUrl}/multisigwallet`, safes).then(res => res.data)
}


export async function cancelMSafe(safeId: number, payload: ISafeCancel): Promise<IResponse<any>> {
  return axios.delete(`${baseUrl}/multisigwallet/${safeId}`, {
    data: payload
  }).then(res => res.data)
}

export async function getMSafeInfo(safeId: number): Promise<IMSafeInfo> {
  return axios.get(`${baseUrl}/multisigwallet/${safeId}`).then(res => res.data.Data)
}

export async function allowMSafe(safeId: number, walletKey: WalletKey): Promise<IResponse<IMSafeResponse>> {
  return axios.post(`${baseUrl}/multisigwallet/${safeId}`, walletKey).then(res => res.data)
}