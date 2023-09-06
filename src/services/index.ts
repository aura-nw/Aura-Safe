import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import axios from 'axios'
import { getChainInfo } from 'src/config'
import { WalletKey } from 'src/logic/keplr/keplr'
import { CHAIN_THEMES, THEME_DF } from 'src/services/constant/chainThemes'
import { getExplorerUrl, getGatewayUrl } from 'src/services/data/environment'
import { IProposal } from 'src/types/proposal'
import { ICreateSafeTransaction, ITransactionListItem, ITransactionListQuery } from 'src/types/transaction'
import { IMSafeInfo, IMSafeResponse, OwnedMSafes } from '../types/safe'

let baseUrl = ''
let githubPageTokenRegistryUrl = ''
let env = 'development'

export interface ISafeCreate {
  creatorAddress: string
  creatorPubkey: string
  otherOwnersAddress: string[]
  threshold: number
  internalChainId: number
}
export interface ISafeCancel {
  myAddress: string
}
interface IResponse<T> {
  AdditionalData: any[]
  Data: any
  data: any
  ErrorCode: string
  Message: string
}

type _ChainInfo = {
  internalChainId: number
  denom: string
  symbol: string
  explorer: string
  defaultGasPrice: string
  defaultGas: GasPriceDefault[]
}

type GasPriceDefault = {
  typeUrl: string
  gasAmount: string
  multiplier: number
}

export type MChainInfo = ChainInfo & _ChainInfo

export function setBaseUrl(url: string): void {
  baseUrl = url
}
export function setGithubPageTokenRegistryUrl(url: string): void {
  githubPageTokenRegistryUrl = url
}
export function setEnv(e: string): void {
  env = e
}

export function getMChainsConfig(): Promise<MChainInfo[]> {
  return axios.post(`${baseUrl}/general/network-list`).then((response) => {
    const chainList: MChainInfo[] = response.data.Data.map(
      (e: {
        chainId: any
        name: any
        rpc: any
        id: number
        prefix: string
        denom: string
        symbol: string
        indexerV2: string
        explorer: string
        coinDecimals: string
        gasPrice: string
        defaultGas: GasPriceDefault[]
        tokenImg: string
        rest: string
        coinConfig?: any[]
      }) => {
        return {
          transactionService: null,
          internalChainId: e.id,
          denom: e.denom,
          explorer: e.explorer,
          chainId: e.chainId,
          chainName: e.name,
          shortName: e.prefix,
          l2: false,
          description: '',
          rpcUri: {
            authentication: '',
            value: e.rpc,
          },
          lcd: e.rest,
          indexerV2: e.indexerV2,
          safeAppsRpcUri: {
            authentication: '',
            value: e.rpc,
          },
          publicRpcUri: {
            authentication: '',
            value: e.rpc,
          },
          blockExplorerUriTemplate: {
            address: getExplorerUrl(e.chainId, e.explorer, 'address'), //`${e.explorer.endsWith('/') ? e.explorer : e.explorer + '/'}account/{{address}}`,
            txHash: getExplorerUrl(e.chainId, e.explorer, 'txHash'),
            api: getExplorerUrl(e.chainId, e.explorer, 'api'),
            proposals: getExplorerUrl(e.chainId, e.explorer, 'proposals'),
            contract: getExplorerUrl(e.chainId, e.explorer, 'contract'),
          },
          nativeCurrency: {
            name: e.prefix.charAt(0).toUpperCase() + e.prefix.slice(1, e.prefix.length).toLowerCase(),
            symbol: e.symbol,
            decimals: e.coinDecimals,
            logoUri: e.tokenImg,
          },
          theme: CHAIN_THEMES[e.chainId] || THEME_DF,
          ensRegistryAddress: '',
          gasPrice: [],
          defaultGas: e.defaultGas,
          defaultGasPrice: e.gasPrice,
          disabledWallets: [],
          features: [
            // 'CONTRACT_INTERACTION',
            // 'DOMAIN_LOOKUP',
            // 'EIP1559',
            // 'ERC721',
            // 'SAFE_TX_GAS_OPTIONAL',
            // 'SPENDING_LIMIT',
          ],
          coinConfig: e?.coinConfig || [],
        }
      },
    )
    return chainList
  })
}

export function fetchMSafesByOwner(addressOwner: string, internalChainId: number): Promise<OwnedMSafes> {
  return axios
    .get(`${baseUrl}/owner/${addressOwner}/safes`, {
      params: {
        internalChainId,
      },
    })
    .then((res) => res.data.Data)
}

export function createMSafe(safes: ISafeCreate): Promise<IResponse<IMSafeResponse>> {
  return axios.post(`${baseUrl}/multisigwallet`, safes).then((res) => res.data)
}

export async function cancelMSafe(safeId: number, payload: ISafeCancel): Promise<IResponse<any>> {
  return axios
    .delete(`${baseUrl}/multisigwallet/${safeId}`, {
      data: payload,
    })
    .then((res) => res.data)
}

export async function getMSafeInfo(safeId: number): Promise<IMSafeInfo> {
  return axios.get(`${baseUrl}/multisigwallet/${safeId}`).then((res) => res.data.Data)
}

export async function getAccountAsset(safeAddress: string): Promise<any> {
  const chainInfo = getChainInfo() as any
  return axios.post(chainInfo.indexerV2, {
    query: `query QueryAccountAsset($address: String = "") {
      ${chainInfo.environment} {
        cw20_holder(where: {address: {_eq: $address}}) {
          amount
          cw20_contract {
            decimal
            name
            symbol
            smart_contract {
              address
            }
          }
        }
        cw721_token(where: {owner: {_eq: $address}}, limit: 10) {
          media_info(path: "offchain")
          cw721_contract {
            smart_contract {
              address
            }
          }
        }
      }
    }`,
    variables: {
      address: safeAddress
    },
    operationName: 'QueryAccountAsset',
  }).then((res) => res.data.data[chainInfo.environment])
}

export async function getMSafeInfoWithAdress(query: string, internalChainId: number): Promise<IMSafeInfo> {
  return axios
    .get(`${baseUrl}/multisigwallet/${query}`, {
      params: {
        internalChainId,
      },
    })
    .then((res) => res.data.Data)
}

export async function allowMSafe(safeId: number, walletKey: WalletKey): Promise<IResponse<IMSafeResponse>> {
  return axios.post(`${baseUrl}/multisigwallet/${safeId}`, walletKey).then((res) => res.data)
}

export function createSafeTransaction(transactionInfo: ICreateSafeTransaction): Promise<IResponse<number>> {
  return axios.post(`${baseUrl}/transaction/create`, transactionInfo).then((res) => res.data)
}

export const getTxDetailById = async (
  safeAddress: string,
  txId?: string,
  auraTxId?: string,
): Promise<IResponse<any>> => {
  let url = `${baseUrl}/transaction/transaction-details?safeAddress=${safeAddress}`
  if (auraTxId) {
    url += `&auraTxId=${auraTxId}`
  }
  if (txId) {
    url += `&multisigTxId=${txId}`
  }
  return axios.get(url).then((res) => res.data)
}

export const deleteTransactionById = async (payload: any): Promise<IResponse<any>> => {
  return axios.delete(`${baseUrl}/transaction/delete`, { data: payload }).then((res) => res.data)
}
export const changeTransactionSequenceById = async (payload: any): Promise<IResponse<any>> => {
  return axios.post(`${baseUrl}/transaction/change-seq`, payload).then((res) => res.data)
}
export const rejectTransactionById = async (payload: any): Promise<IResponse<any>> => {
  return axios.post(`${baseUrl}/transaction/reject`, payload).then((res) => res.data)
}

export async function getAllTx(payload: ITransactionListQuery): Promise<IResponse<Array<ITransactionListItem>>> {
  return axios.post(`${baseUrl}/transaction/get-all-txs`, payload).then((res) => res.data)
}

export function sendSafeTransaction(payload: any): Promise<IResponse<any>> {
  return axios.post(`${baseUrl}/transaction/send`, payload).then((res) => res.data)
}

export function confirmSafeTransaction(payload: any): Promise<IResponse<any>> {
  return axios.post(`${baseUrl}/transaction/confirm`, payload).then((res) => res.data)
}

export async function getAddress(safeAddress: string): Promise<IResponse<any>> {
  return axios.get(`${baseUrl}/user/${safeAddress}`).then((res) => res.data)
}

export async function getAllNotifications(): Promise<IResponse<any>> {
  return axios.get(`${baseUrl}/notification`).then((res) => res.data)
}
export async function markNotificationAsRead(payload: string[]): Promise<IResponse<any>> {
  return axios.post(`${baseUrl}/notification`, { notifications: payload }).then((res) => res.data)
}
export function auth(payload: any): Promise<IResponse<any>> {
  return axios.post(`${baseUrl}/auth`, payload).then((res) => res.data)
}
export async function simulate(payload: any): Promise<IResponse<any>> {
  return axios.post(`${baseUrl}/transaction/simulate`, payload).then((res) => res.data)
}

//STAKING

export async function getAllValidators(): Promise<IResponse<any>> {
  const chainInfo = getChainInfo() as any

  return axios.post(chainInfo.indexerV2, {
    query: `query GetAllValidator {
      ${chainInfo.environment || ''} {
        validator(limit: 1000) {
          account_address
          commission
          description
          operator_address
          status
          tokens
          percent_voting_power
          delegators_count
          uptime
          image_url 
        }
      }
    }`,
    variables: {},
    operationName: 'GetAllValidator',
  }).then((res) => res.data?.data[chainInfo.environment])
}


export async function getAllDelegateOfUser(internalChainId: any, delegatorAddress: any): Promise<IResponse<any>> {
  return axios.get(`${baseUrl}/distribution/${internalChainId}/${delegatorAddress}/delegations`).then((res) => res.data)
}

export async function getAllDelegations(chainLcd: string, delegatorAddress: any): Promise<any> {
  return axios
    .get(`${chainLcd}/cosmos/staking/v1beta1/delegations/${delegatorAddress}`)
    .then((res) => res.data)
}

export async function getAllUnDelegateOfUser(chainLcd: string, delegatorAddress: any): Promise<any> {
  return axios
    .get(`${chainLcd}/cosmos/staking/v1beta1/delegators/${delegatorAddress}/unbonding_delegations`)
    .then((res) => res.data)
}

export async function getAllReward(chainLcd: string, delegatorAddress: any): Promise<any> {
  return axios
    .get(`${chainLcd}/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`)
    .then((res) => res.data)
}

export async function getAccountInfo(contractAddress: string): Promise<any> {
  const chainInfo = getChainInfo() as any

  return axios
    .post(chainInfo.indexerV2, {
      query: `query QueryAccountInfo($address: String = "") {
        ${chainInfo.environment} {
          account(where: {address: {_eq: $address}}) {
            account_number
            sequence
            balances
          }
        }
      }
    `,
      variables: {
        address: contractAddress,
      },
      operationName: 'QueryAccountInfo',
    })
    .then((res) => res.data.data[chainInfo.environment])
}

export async function getAccountInfoByLcd(contractAddress: string): Promise<any> {
  const currentChainInfo = getChainInfo() as any
  return axios
    .get(`${currentChainInfo.lcd}/cosmos/auth/v1beta1/accounts/${contractAddress}`)
    .then((res) => res.data)
}

export async function getNumberOfDelegator(validatorId: any): Promise<IResponse<any>> {
  const currentChainInfo = getChainInfo() as any
  const { chainInfo } = await getGatewayUrl()
  return axios
    .get(
      `${chainInfo.find((chain) => chain.chainId == currentChainInfo.chainId)?.rest
      }/cosmos/staking/v1beta1/validators/${validatorId}/delegations?pagination.count_total=true`,
    )
    .then((res) => res.data)
}

//VOTING

export const getProposals = async () => {
  const chainInfo = getChainInfo() as any

  return axios.post(chainInfo.indexerV2, {
    query: `query GetProposals {\n      ${chainInfo.environment} {\n        proposal(order_by: {proposal_id: desc}, limit: 10) {\n          proposer_address\n          content\n          tally\n          proposal_id\n          status\n          submit_time\n          deposit_end_time\n          total_deposit\n          voting_start_time\n          voting_end_time\n        }\n      }\n    }`,
    variables: {},
    operationName: 'GetProposals',
  }).then((res) => res.data)
}

export async function getProposalDetail(
  internalChainId: number | string,
  proposalId: number | string,
): Promise<IResponse<IProposal>> {
  return axios.get(`${baseUrl}/gov/${internalChainId}/proposals/${proposalId}`).then((res) => res.data)
}
export async function getContract(contractAddress: string): Promise<IResponse<any>> {
  const chainInfo = getChainInfo() as any
  return axios
    .post(chainInfo.indexerV2, {
      query: `query GetContractVerificationStatus($address: String = "") {
        ${chainInfo.environment || ''} {
          smart_contract(where: {address: {_eq: $address}}) {
            code {
              code_id_verifications(order_by: {updated_at: desc}) {
                compiler_version
                verified_at
                verification_status
                execute_msg_schema
              }
            }
          }
        }
      }`,
      variables: {
        address: contractAddress,
      },
      operationName: 'GetContractVerificationStatus',
    })
    .then((res) => res.data)
}

export async function getTokenDetail() {
  return fetch(githubPageTokenRegistryUrl)
}

export async function getDetailToken(address: string): Promise<IResponse<any>> {
  const currentChainInfo = getChainInfo() as any

  return axios
    .get(`${currentChainInfo.lcd}/cosmwasm/wasm/v1/contract/${address}/smart/eyAidG9rZW5faW5mbyI6IHt9IH0%3D`)
    .then((res) => res.data)
}

export async function fetchAccountInfo(safeAddress: string) {
  try {
    const response = await getAccountInfo(safeAddress);
    const accountInfo = response.account[0];
    return accountInfo;
  } catch (error) {
    try {
      const lcdResponse = await getAccountInfoByLcd(safeAddress);
      const accountInfoFromLcd = lcdResponse.account;
      return accountInfoFromLcd;
    } catch (lcdError) {
      console.error("Error while fetching account info:", lcdError);
      return null;
    }
  }
}
