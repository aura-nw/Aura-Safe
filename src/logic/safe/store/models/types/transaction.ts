import { Operation } from '@gnosis.pm/safe-react-gateway-sdk'
// import { GnosisSafe } from 'src/types/contracts/gnosis_safe.d'

export type TxArgs = {
  baseGas: string
  data: string
  gasPrice: string
  gasToken: string
  nonce: number
  operation: Operation
  refundReceiver: string
  safeInstance: any
  safeTxGas: string
  sender?: string
  sigs: string
  to: string
  valueInWei: string
}
