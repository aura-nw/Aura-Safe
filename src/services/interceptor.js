import axios from 'axios'
import * as _ from 'lodash'
import { _getChainId } from 'src/config/index'
import session from 'src/utils/storage/session'
import { JWT_TOKEN_KEY } from './constant/common'
import { getBaseUrl } from './index'

const getOrigin = (url) => {
  try {
    return new URL(url, window.location.href).origin
  } catch (e) {
    return null
  }
}

// Only attach the JWT to requests targeting the API gateway, never to third-party hosts (LCD/RPC, gas oracle, Safe Apps...)
const isApiGatewayRequest = (config) => {
  const baseUrl = getBaseUrl()
  if (!baseUrl) return false
  const gatewayOrigin = getOrigin(baseUrl)
  const requestUrl =
    config.baseURL && !/^[a-z][a-z\d+\-.]*:\/\//i.test(config.url || '')
      ? `${config.baseURL.replace(/\/+$/, '')}/${(config.url || '').replace(/^\/+/, '')}`
      : config.url
  const requestOrigin = getOrigin(requestUrl || '')
  return !!gatewayOrigin && gatewayOrigin === requestOrigin
}

axios.interceptors.request.use(
  async (config) => {
    if (isApiGatewayRequest(config)) {
      const chainId = _getChainId()
      const arrayTemp = session.getItem(JWT_TOKEN_KEY) || []
      const token = _.find(arrayTemp, ['name', chainId])?.token
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token
      }
    }
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
