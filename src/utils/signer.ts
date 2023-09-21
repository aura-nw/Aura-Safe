import { Dispatch } from 'redux'
import { getChainInfo, getInternalChainId } from 'src/config'

import { encodeSecp256k1Pubkey, makeSignDoc as makeSignDocAmino } from '@cosmjs/amino'
import { createWasmAminoConverters } from '@cosmjs/cosmwasm-stargate'
import { fromBase64, toBase64, toUtf8 } from '@cosmjs/encoding'
import { Int53 } from '@cosmjs/math'
import { Registry, TxBodyEncodeObject, encodePubkey, makeAuthInfoBytes } from '@cosmjs/proto-signing'
import {
  AminoTypes,
  SequenceResponse,
  SignerData,
  StdFee,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFreegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
} from '@cosmjs/stargate'
import { KeplrIntereactionOptions } from '@keplr-wallet/types'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { generatePath } from 'react-router-dom'
import { ERROR, NOTIFICATIONS, enhanceSnackbarForAction } from 'src/logic/notifications'
import enqueueSnackbar from 'src/logic/notifications/store/actions/enqueueSnackbar'
import { getProvider } from 'src/logic/providers/utils/wallets'
import fetchTransactions from 'src/logic/safe/store/actions/transactions/fetchTransactions'
import { WALLETS_NAME } from 'src/logic/wallets/constant/wallets'
import { loadLastUsedProvider } from 'src/logic/wallets/store/middlewares/providerWatcher'
import {
  SAFE_ADDRESS_SLUG,
  SAFE_ROUTES,
  extractSafeAddress,
  extractShortChainName,
  getPrefixedSafeAddressSlug,
  history,
} from 'src/routes/routes'
import {
  changeTransactionSequenceById,
  confirmSafeTransaction,
  createSafeTransaction,
  fetchAccountInfo,
} from 'src/services'
import { MESSAGES_CODE } from 'src/services/constant/message'
import { ICreateSafeTransaction } from 'src/types/transaction'
import { calcFee } from 'src/utils'
import { TxTypes } from './txTypes'
export const signAndCreateTransaction =
  (
    message: any[],
    gasLimit: string,
    sequence: string,
    toAddress?: string,
    beforeSigningCallback?: () => void,
    successSigningCallback?: () => void,
    errorSigningCallback?: (error: any) => void,
  ) =>
  async (dispatch: Dispatch<any>): Promise<any> => {
    try {
      const chainInfo = getChainInfo() as any
      const safeAddress = extractSafeAddress()
      const sendFee = calcFee(gasLimit)
      const chainId = chainInfo.chainId
      const msgs = message.map((msg: any) => {
        if (
          [
            '/cosmwasm.wasm.v1.MsgInstantiateContract',
            '/cosmwasm.wasm.v1.MsgExecuteContract',
            '/cosmwasm.wasm.v1.MsgMigrateContract',
          ].includes(msg.typeUrl as never)
        ) {
          return {
            ...msg,
            value: {
              ...msg.value,
              msg: toUtf8(JSON.stringify(msg.value.msg)),
            },
          }
        }

        if (['/cosmwasm.wasm.v1.MsgStoreCode'].includes(msg.typeUrl as never)) {
          return {
            ...msg,
            value: {
              ...msg.value,
              wasmByteCode: fromBase64(msg.value.wasmByteCode),
            },
          }
        }

        return msg
      })
      beforeSigningCallback && beforeSigningCallback()
      dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.SIGN_TX_MSG)))

      const signResult = await signMessage(chainId, chainInfo.environment, safeAddress, msgs, sendFee, sequence)
      if (!signResult) throw new Error()
      const signatures = toBase64(signResult.signatures[0])
      const bodyBytes = toBase64(signResult.bodyBytes)
      const authInfoBytes = toBase64(signResult.authInfoBytes)
      const data: ICreateSafeTransaction = {
        internalChainId: getInternalChainId(),
        creatorAddress: signResult.signerAddress,
        signature: signatures,
        bodyBytes: bodyBytes,
        authInfoBytes: authInfoBytes,
        from: safeAddress,
        accountNumber: signResult.accountNumber,
        sequence: signResult.sequence,
      }
      if (toAddress) {
        data.to = toAddress
      }
      const result = await createSafeTransaction(data)
      const { ErrorCode } = result
      if (ErrorCode === MESSAGES_CODE.SUCCESSFUL.ErrorCode) {
        const chainId = chainInfo.chainId
        dispatch(fetchTransactions(chainId, safeAddress))
        const prefixedSafeAddress = getPrefixedSafeAddressSlug({ shortName: extractShortChainName(), safeAddress })
        const txRoute = generatePath(SAFE_ROUTES.TRANSACTIONS_QUEUE, {
          [SAFE_ADDRESS_SLUG]: prefixedSafeAddress,
        })
        successSigningCallback && successSigningCallback()
        history.push(txRoute + `?transactionId=${result.Data.transactionId}`)
      } else {
        errorSigningCallback && errorSigningCallback(result?.Message)
        dispatch(
          enqueueSnackbar(
            enhanceSnackbarForAction(
              result?.Message
                ? {
                    message: result?.Message,
                    options: { variant: 'error', persist: false, autoHideDuration: 5000, preventDuplicate: true },
                  }
                : NOTIFICATIONS.TX_FAILED_MSG,
            ),
          ),
        )
      }
    } catch (error) {
      errorSigningCallback && errorSigningCallback(error)
      dispatch(
        enqueueSnackbar(
          enhanceSnackbarForAction({
            message: error.message || 'Transaction request failed',
            options: { variant: ERROR, persist: false, autoHideDuration: 5000, preventDuplicate: true },
          }),
        ),
      )
    }
  }
export const signAndConfirmTransaction =
  (
    transactionId: string,
    message: any[],
    sendFee: any,
    sequence: string,
    beforeSigningCallback?: () => void,
    successSigningCallback?: () => void,
    errorSigningCallback?: (error: any) => void,
  ) =>
  async (dispatch: Dispatch<any>): Promise<any> => {
    try {
      const chainInfo = getChainInfo() as any
      const safeAddress = extractSafeAddress()
      const chainId = chainInfo.chainId
      const msgs = message.map((msg: any) => {
        if (
          [
            '/cosmwasm.wasm.v1.MsgInstantiateContract',
            '/cosmwasm.wasm.v1.MsgExecuteContract',
            '/cosmwasm.wasm.v1.MsgMigrateContract',
          ].includes(msg.typeUrl as never)
        ) {
          return {
            ...msg,
            value: {
              ...msg.value,
              msg: toUtf8(msg.value.msg),
            },
          }
        }
        if (['/cosmwasm.wasm.v1.MsgStoreCode'].includes(msg.typeUrl as never)) {
          return {
            ...msg,
            value: {
              ...msg.value,
              wasmByteCode: fromBase64(msg.value.wasmByteCode),
            },
          }
        }

        return msg
      })
      beforeSigningCallback && beforeSigningCallback()
      dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.SIGN_TX_MSG)))
      const signResult = await signMessage(chainId, chainInfo.environment, safeAddress, msgs, sendFee, sequence)
      if (!signResult) throw new Error(signResult)
      const signatures = toBase64(signResult.signatures[0])
      const bodyBytes = toBase64(signResult.bodyBytes)
      const authInfoBytes = toBase64(signResult.authInfoBytes)
      const data: ICreateSafeTransaction = {
        internalChainId: getInternalChainId(),
        creatorAddress: signResult.signerAddress,
        signature: signatures,
        bodyBytes: bodyBytes,
        authInfoBytes: authInfoBytes,
        from: safeAddress,
        accountNumber: signResult.accountNumber,
        sequence: signResult.sequence,
        transactionId,
      }
      const result = await confirmSafeTransaction(data)
      const { ErrorCode } = result
      if (ErrorCode === MESSAGES_CODE.SUCCESSFUL.ErrorCode) {
        const chainId = chainInfo.chainId
        dispatch(fetchTransactions(chainId, safeAddress, true))
        const prefixedSafeAddress = getPrefixedSafeAddressSlug({ shortName: extractShortChainName(), safeAddress })
        const txRoute = generatePath(SAFE_ROUTES.TRANSACTIONS_QUEUE, {
          [SAFE_ADDRESS_SLUG]: prefixedSafeAddress,
        })
        successSigningCallback && successSigningCallback()
        history.push(txRoute)
      } else {
        errorSigningCallback && errorSigningCallback(result?.Message)
        dispatch(
          enqueueSnackbar(
            enhanceSnackbarForAction(
              result?.Message
                ? {
                    message: result?.Message,
                    options: { variant: 'error', persist: false, autoHideDuration: 5000, preventDuplicate: true },
                  }
                : NOTIFICATIONS.TX_FAILED_MSG,
            ),
          ),
        )
      }
    } catch (error) {
      errorSigningCallback && errorSigningCallback(error)
      console.error(error)
      dispatch(
        enqueueSnackbar(
          enhanceSnackbarForAction({
            message: error.message || 'Transaction request failed',
            options: { variant: ERROR, persist: false, autoHideDuration: 5000, preventDuplicate: true },
          }),
        ),
      )
    }
  }

export const signAndChangeTransactionSequence =
  (
    oldTxId: string,
    message: any[],
    sendFee: any,
    sequence: string,
    beforeSigningCallback?: () => void,
    successSigningCallback?: () => void,
    errorSigningCallback?: (error: any) => void,
  ) =>
  async (dispatch: Dispatch<any>): Promise<any> => {
    try {
      const chainInfo = getChainInfo() as any
      const safeAddress = extractSafeAddress()
      const chainId = chainInfo.chainId
      const msgs = message.map((msg: any) => {
        if (
          [
            '/cosmwasm.wasm.v1.MsgInstantiateContract',
            '/cosmwasm.wasm.v1.MsgExecuteContract',
            '/cosmwasm.wasm.v1.MsgMigrateContract',
          ].includes(msg.typeUrl as never)
        ) {
          return {
            ...msg,
            value: {
              ...msg.value,
              msg: toUtf8(msg.value.msg),
            },
          }
        }
        if (['/cosmwasm.wasm.v1.MsgStoreCode'].includes(msg.typeUrl as never)) {
          return {
            ...msg,
            value: {
              ...msg.value,
              wasmByteCode: fromBase64(msg.value.wasmByteCode),
            },
          }
        }

        return msg
      })
      beforeSigningCallback && beforeSigningCallback()
      dispatch(enqueueSnackbar(enhanceSnackbarForAction(NOTIFICATIONS.SIGN_TX_MSG)))
      const signResult = await signMessage(chainId, chainInfo.environment, safeAddress, msgs, sendFee, sequence)
      if (!signResult) throw new Error()
      const signatures = toBase64(signResult.signatures[0])
      const bodyBytes = toBase64(signResult.bodyBytes)
      const authInfoBytes = toBase64(signResult.authInfoBytes)
      const data: ICreateSafeTransaction = {
        internalChainId: getInternalChainId(),
        creatorAddress: signResult.signerAddress,
        signature: signatures,
        bodyBytes: bodyBytes,
        authInfoBytes: authInfoBytes,
        from: safeAddress,
        accountNumber: signResult.accountNumber,
        sequence: signResult.sequence,
        oldTxId,
      }
      const result = await changeTransactionSequenceById(data)
      const { ErrorCode } = result
      if (ErrorCode === MESSAGES_CODE.SUCCESSFUL.ErrorCode) {
        const chainId = chainInfo.chainId
        dispatch(fetchTransactions(chainId, safeAddress))
        const prefixedSafeAddress = getPrefixedSafeAddressSlug({ shortName: extractShortChainName(), safeAddress })
        const txRoute = generatePath(SAFE_ROUTES.TRANSACTIONS_QUEUE, {
          [SAFE_ADDRESS_SLUG]: prefixedSafeAddress,
        })
        successSigningCallback && successSigningCallback()
        history.push(txRoute)
      } else {
        errorSigningCallback && errorSigningCallback(result?.Message)
        dispatch(
          enqueueSnackbar(
            enhanceSnackbarForAction(
              result?.Message
                ? {
                    message: result?.Message,
                    options: { variant: 'error', persist: false, autoHideDuration: 5000, preventDuplicate: true },
                  }
                : NOTIFICATIONS.TX_FAILED_MSG,
            ),
          ),
        )
      }
    } catch (error) {
      errorSigningCallback && errorSigningCallback(error)
      dispatch(
        enqueueSnackbar(
          enhanceSnackbarForAction({
            message: error.message || 'Transaction request failed',
            options: { variant: ERROR, persist: false, autoHideDuration: 5000, preventDuplicate: true },
          }),
        ),
      )
    }
  }

const getDefaultOptions = (): KeplrIntereactionOptions => ({
  sign: {
    preferNoSetMemo: true,
    preferNoSetFee: true,
    disableBalanceCheck: true,
  },
})

const signMessage = async (
  chainId: string,
  chainEnv: string,
  safeAddress: string,
  messages: any,
  fee: StdFee,
  sequence?: string | undefined,
  memo?: string,
): Promise<any> => {
  try {
    const loadLastUsedProviderResult = await loadLastUsedProvider()
    const provider = loadLastUsedProviderResult
      ? await getProvider(loadLastUsedProviderResult as WALLETS_NAME)
      : undefined
    if (!provider)
      throw new Error(`An error occurred while loading wallet provider. Please disconnect your wallet and try again.`)
    provider.defaultOptions = getDefaultOptions()
    const offlineSignerOnlyAmino = (window as any).getOfflineSignerOnlyAmino
    if (offlineSignerOnlyAmino) {
      const signer = await offlineSignerOnlyAmino(chainId)
      if (!signer)
        throw new Error(`An error occurred while loading signer. Please disconnect your wallet and try again.`)
      const account = await signer.getAccounts()
      const accountInfo = await fetchAccountInfo(safeAddress)
      const onlineData: SequenceResponse = {
        accountNumber: accountInfo?.account_number,
        sequence: accountInfo?.sequence,
      }

      const signerData: SignerData = {
        accountNumber: onlineData.accountNumber,
        sequence: sequence ? +sequence : onlineData?.sequence,
        chainId,
      }
      const signerAddress = account[0].address
      if (!(signerAddress && messages && fee && signerData)) {
        throw new Error(`An error occurred while loading signing payload. Please disconnect your wallet and try again.`)
      }
      ;(window as any).signObject = { signerAddress, messages, fee, memo, signerData }
      const registry = new Registry(TxTypes)
      const aminoTypes = new AminoTypes({
        ...createBankAminoConverters(),
        ...createStakingAminoConverters(getChainInfo().shortName),
        ...createDistributionAminoConverters(),
        ...createGovAminoConverters(),
        ...createWasmAminoConverters(),
        ...createAuthzAminoConverters(),
        ...createFreegrantAminoConverters(),
        ...createIbcAminoConverters(),
      })

      const pubkey = encodePubkey(encodeSecp256k1Pubkey(account[0].pubkey))
      const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON
      const msgs = messages.map((msg) => {
        return aminoTypes.toAmino(msg)
      })
      const signDoc = makeSignDocAmino(msgs, fee, chainId, memo, signerData.accountNumber, signerData.sequence)
      const { signature, signed } = await signer.signAmino(signerAddress, signDoc)
      const signedTxBody = {
        messages: signed.msgs.map((msg) => aminoTypes.fromAmino(msg)),
        memo: signed.memo,
      }
      const signedTxBodyEncodeObject: TxBodyEncodeObject = {
        typeUrl: '/cosmos.tx.v1beta1.TxBody',
        value: signedTxBody,
      }
      const signedTxBodyBytes = registry.encode(signedTxBodyEncodeObject)
      const signedGasLimit = Int53.fromString(signed.fee.gas).toNumber()
      const signedSequence = Int53.fromString(signed.sequence).toNumber()
      const signedAuthInfoBytes = makeAuthInfoBytes(
        [{ pubkey, sequence: signedSequence }],
        signed.fee.amount,
        signedGasLimit,
        signMode,
      )
      const respone = TxRaw.fromPartial({
        bodyBytes: signedTxBodyBytes,
        authInfoBytes: signedAuthInfoBytes,
        signatures: [fromBase64(signature.signature)],
      })
      return {
        ...respone,
        accountNumber: onlineData.accountNumber,
        sequence: sequence ? +sequence : onlineData?.sequence,
        signerAddress,
      }
    }
    return undefined
  } catch (error) {
    throw new Error(error)
  }
}
