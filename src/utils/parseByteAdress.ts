import { fromByteArray } from 'base64-js'

export function parseToAddress(arr: Uint8Array): string {
  return fromByteArray(arr)
}
