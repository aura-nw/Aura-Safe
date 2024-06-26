enum KeplrErrors {
  Success = 'OK',
  Failed = 'FAILED',
  NoChainInfo = 'THERE IS NO CHAIN INFO FOR',
  SameChain = 'SAME CHAIN IS ALREADY REGISTERED',
  NotRegistered = 'CHAIN IS NOT REGISTERED',
  RequestRejected = 'REQUEST REJECTED',
  NotInstall = 'NOT INSTALL',
}

enum WalletProviders {
  Keplr = 'keplr',
  Coin98 = 'coin98',
}

enum MsgTypeUrl {
  IBCTransfer = '/ibc.applications.transfer.v1.MsgTransfer',
  IBCReceived = '/ibc.core.channel.v1.MsgRecvPacket',
  IBCAcknowledgement = '/ibc.core.channel.v1.MsgAcknowledgement',
  IBCUpdateClient = '/ibc.core.client.v1.MsgUpdateClient',
  IBCTimeout = '/ibc.core.channel.v1.MsgTimeout',
  Send = '/cosmos.bank.v1beta1.MsgSend',
  MultiSend = '/cosmos.bank.v1beta1.MsgMultiSend',
  Delegate = '/cosmos.staking.v1beta1.MsgDelegate',
  Undelegate = '/cosmos.staking.v1beta1.MsgUndelegate',
  Redelegate = '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  GetReward = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  SwapWithinBatch = '/tendermint.liquidity.v1beta1.MsgSwapWithinBatch',
  DepositWithinBatch = '/tendermint.liquidity.v1beta1.MsgDepositWithinBatch',
  EditValidator = '/cosmos.staking.v1beta1.MsgEditValidator',
  CreateValidator = '/cosmos.staking.v1beta1.MsgCreateValidator',
  Unjail = '/cosmos.slashing.v1beta1.MsgUnjail',
  StoreCode = '/cosmwasm.wasm.v1.MsgStoreCode',
  InstantiateContract = '/cosmwasm.wasm.v1.MsgInstantiateContract',
  ExecuteContract = '/cosmwasm.wasm.v1.MsgExecuteContract',
  ModifyWithdrawAddress = '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress',
  JoinPool = '/osmosis.gamm.v1beta1.MsgJoinPool',
  LockTokens = '/osmosis.lockup.MsgLockTokens',
  JoinSwapExternAmountIn = '/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn',
  SwapExactAmountIn = '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn',
  BeginUnlocking = '/osmosis.lockup.MsgBeginUnlocking',
  Vote = '/cosmos.gov.v1beta1.MsgVote',
  Vesting = '/cosmos.vesting.v1beta1.MsgCreateVestingAccount',
  Deposit = '/cosmos.gov.v1beta1.MsgDeposit',
  SubmitProposalTx = '/cosmos.gov.v1beta1.MsgSubmitProposal',
  GetRewardCommission = '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
  Fail = 'FAILED',
}

export { KeplrErrors, MsgTypeUrl }
