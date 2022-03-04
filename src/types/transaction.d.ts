import { TransactionListItem, TransactionSummary } from "@gnosis.pm/safe-react-gateway-sdk";

export type MTransactionListItem = TransactionListItem & {
    transaction: TransactionSummary & { txHash?: string }
}
export interface ITransactionInfoResponse {
  from: string
  to: string
  amount: number
  fee: number
  gasLimit: number
  internalChainId: number,
  transactionId: number,
  id: number
}

export interface ICreateSafeTransaction {
    from: string,
    to: string,
    amount: string,
    gasLimit: string,
    internalChainId: number,
    fee: number,
    creatorAddress: string,
    signature: string,
    bodyBytes: string
}

export interface ITransactionListQuery {
    safeAddress: string,
    pageSize: number,
    isHistory: boolean,
    pageIndex: number
}

export interface ITransactionListItem {
    Id: number,
    CreatedAt: string,
    UpdatedAt: string,
    FromAddress: string,
    ToAddress: string,
    TxHash: string,
    Amount: number,
    Denom: string,
    Status: string,
    Signatures: string[],
    Direction: string
}

export interface ISignature {
    id: number;
    createdAt: string;
    updatedAt: string;
    ownerAddress: string;
}
export interface ISigner {
    OwnerAddress: string;
}

export interface IExecutor {
    id: number;
    createdAt: string;
    updatedAt: string;
    ownerAddress: string;
    signature: string;
    status: string;
}

export interface IConfirmation {
    id: number;
    createdAt: string;
    updatedAt: string;
    ownerAddress: string;
    signature: string;
    status: string;
}

export interface ITransactionDetail {
    Id: number;
    CreatedAt: string;
    UpdatedAt: string;
    FromAddress: string;
    ToAddress: string;
    TxHash?: any;
    Amount: number;
    Denom: string;
    GasUsed: string;
    GasWanted: number;
    GasPrice: number;
    ChainId: string;
    Status: string;
    ConfirmationsRequired: number;
    Signers: Signer[];
    Direction: string;
    Confirmations: Confirmation[];
    Rejectors: any[];
    Executor: IExecutor[];
}

export interface ISignSafeTransaction {
    fromAddress: string
    transactionId: number
    bodyBytes: string
    signature: string
    internalChainId: number
}
