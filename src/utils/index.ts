import { GasPrice, calculateFee } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getChainDefaultGasPrice, getChainInfo, getNativeCurrency } from 'src/config'
import { getChains } from 'src/config/cache/chains'
import { MChainInfo } from 'src/services'

export const beutifyJson = (data) => {
  if (!data) return ''
  const prettyJson = JSON.stringify(data, undefined, 4)
  const json = prettyJson.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const formattedJson = json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = 'number'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key'
        } else {
          cls = 'string'
          if (match.length > 900) {
            match = match.slice(0, 900) + '..."'
          }
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean'
      } else if (/null/.test(match)) {
        cls = 'null'
      }
      return '<span class="' + cls + '">' + match + '</span>'
    },
  )
  return formattedJson
}

export const formatNumber = (value: any): string => {
  const nativeCurrency = getNativeCurrency()

  if (value == '' || value == 0) return value
  const valueString = String(value)
  const [integer, fractional] = valueString.split('.')
  if (!fractional) return value
  const parsedNumber = [integer, '.', fractional.slice(0, nativeCurrency.decimals || 6)].join('')
  return parsedNumber
  // return value == '' || value == 0 ? value : parseFloat((+value).toFixed(6)).toString()
}
export const shortAddress = (address: string): string => {
  return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length)
}
export const isNumberKeyPress = (event): boolean => {
  if (event.key == '.') {
    return true
  }
  if (!isFinite(event.key) || event.key === ' ') {
    event.preventDefault()
    return false
  }
  return true
}

export const convertAmount = (amount: string | number, isMulti = false, decimal?: number) => {
  const nativeCurrency = getNativeCurrency()
  if (isNaN(+amount)) return '0'
  return isMulti
    ? new BigNumber(amount).times(new BigNumber(10).pow(decimal || nativeCurrency.decimals)).toFixed()
    : new BigNumber(
        new BigNumber(amount)
          .div(new BigNumber(10).pow(decimal || nativeCurrency.decimals))
          .toFixed(decimal || nativeCurrency.decimals),
      ).toFixed()
}

export const formatNativeToken = (amount) => {
  const nativeCurrency = getNativeCurrency()
  return `${formatWithComma(
    Number(
      new BigNumber(
        new BigNumber(amount).div(new BigNumber(10).pow(nativeCurrency.decimals)).toFixed(+nativeCurrency.decimals),
      ).toFixed(),
    ),
  )} ${nativeCurrency.symbol}`
}
export const formatNativeCurrency = (amount) => {
  const nativeCurrency = getNativeCurrency()
  return `${formatWithComma(
    Number(new BigNumber(new BigNumber(+amount).toFixed(+nativeCurrency.decimals)).toFixed()),
  )} ${nativeCurrency.symbol}`
}

export const humanReadableValue = (value: number | string, decimals = 18): string => {
  return new BigNumber(value).times(`1e-${decimals}`).toFixed()
}

export const formatWithComma = (amount): string => {
  if (+amount > 1) {
    const intl = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 6,
    })
    return intl.format(amount)
  } else {
    return amount?.toString()
  }
}

export const calcFee = (gasAmount) => {
  const chainInfo = getChainInfo()
  const listChain = getChains()
  const chainDefaultGasPrice = getChainDefaultGasPrice()
  const mChainInfo = listChain.find((x) => x.chainId === chainInfo.chainId) as MChainInfo
  const denom = mChainInfo?.denom || ''
  const _gasPrice = GasPrice.fromString(String(chainDefaultGasPrice).concat(denom))
  const _sendFee = calculateFee(Number(gasAmount), _gasPrice)
  return _sendFee
}

export const useQuery = () => {
  const { search } = useLocation()

  return useMemo(() => new URLSearchParams(search), [search])
}
