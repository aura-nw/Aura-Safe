import { CONTRACT_ERRORS, CONTRACT_ERROR_CODES } from 'src/logic/contracts/contracts.d'

export const decodeMessage = (message: string): string => {
  const code = CONTRACT_ERROR_CODES.find((code) => {
    return message.toUpperCase().includes(code.toUpperCase())
  })

  return code ? `${code}: ${CONTRACT_ERRORS[code]}` : message
}
