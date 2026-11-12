import axios from 'axios'

const GATEWAY = 'https://safe-api.example.com/api'
const TOKEN = 'jwt-token-123'
let mockBaseUrl = GATEWAY

jest.mock('src/config/index', () => ({ _getChainId: () => 'aura-testnet' }))
jest.mock('src/utils/storage/session', () => ({
  __esModule: true,
  default: { getItem: () => [{ name: 'aura-testnet', token: 'jwt-token-123' }] },
}))
jest.mock('src/services/index', () => ({ getBaseUrl: () => mockBaseUrl }))

require('src/services/interceptor')

const sentHeaders = async (url, config = {}) => {
  let captured
  await axios.get(url, {
    ...config,
    adapter: async (cfg) => {
      captured = cfg.headers
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config: cfg }
    },
  })
  return captured
}

describe('axios request interceptor', () => {
  beforeEach(() => {
    mockBaseUrl = GATEWAY
  })

  it('attaches JWT to API gateway requests', async () => {
    const headers = await sentHeaders(`${GATEWAY}/multisigwallet/1`)
    expect(headers.Authorization).toBe(`Bearer ${TOKEN}`)
  })

  it('attaches JWT when gateway is addressed via config.baseURL', async () => {
    const headers = await sentHeaders('/transaction/create', { baseURL: GATEWAY })
    expect(headers.Authorization).toBe(`Bearer ${TOKEN}`)
  })

  it.each([
    'https://lcd.aura.network/cosmos/staking/v1beta1/delegations/aura1xyz',
    'https://gas-oracle.example.org/price',
    'https://evil-app.example/manifest.json',
    'https://safe-api.example.com.evil.io/api/auth',
    'http://safe-api.example.com/api/auth',
  ])('does not attach JWT to non-gateway URL %s', async (url) => {
    const headers = await sentHeaders(url)
    expect(headers.Authorization).toBeUndefined()
  })

  it('does not attach JWT before base URL is configured', async () => {
    mockBaseUrl = ''
    const headers = await sentHeaders(`${GATEWAY}/auth`)
    expect(headers.Authorization).toBeUndefined()
  })

  it('propagates request interceptor errors instead of swallowing them', async () => {
    const { handlers } = axios.interceptors.request
    const onRejected = handlers[handlers.length - 1].rejected
    const err = new Error('boom')
    await expect(onRejected(err)).rejects.toBe(err)
  })
})
