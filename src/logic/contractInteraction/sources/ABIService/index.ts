// import { AbiItem, keccak256 } from 'web3-utils'

// interface AllowedAbiItem {
//   name: string
//   type: 'function'
// }

// export interface AbiItemExtended extends AllowedAbiItem {
//   action: string
//   methodSignature: string
//   signatureHash: string
// }

const getMethodSignature = ({ inputs, name }: any): string => {
  const params = inputs?.map((x) => x.type).join(',')
  return `${name}(${params})`
}

const getSignatureHash = (signature: string): string => {
  // return keccak256(signature).toString()
  return ''
}

const getMethodSignatureAndSignatureHash = (method: any): { methodSignature: string; signatureHash: string } => {
  const methodSignature = getMethodSignature(method)
  const signatureHash = getSignatureHash(methodSignature)
  return { methodSignature, signatureHash }
}

const isAllowedMethod = ({ name, type }: any): boolean => {
  return type === 'function' && !!name
}

const getMethodAction = ({ stateMutability }: any): 'read' | 'write' => {
  if (!stateMutability) {
    return 'write'
  }

  return ['view', 'pure'].includes(stateMutability) ? 'read' : 'write'
}

export const extractUsefulMethods = (abi: any[]): any[] => {
  const allowedAbiItems = abi.filter(isAllowedMethod) as any[]

  return allowedAbiItems
    .map((method): any => ({
      action: getMethodAction(method),
      ...getMethodSignatureAndSignatureHash(method),
      ...method,
    }))
    .sort(({ name: a }, { name: b }) => {
      return a.toLowerCase() > b.toLowerCase() ? 1 : -1
    })
}

export const isPayable = (method: any | any): boolean => {
  return Boolean(method?.payable) || method.stateMutability === 'payable'
}
