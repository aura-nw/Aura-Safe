import { BigNumber } from 'bignumber.js'
import ReactDOM from 'react-dom'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import Root from 'src/layout/Root'
import { SENTRY_DSN } from './utils/constants'
import { disableMMAutoRefreshWarning } from './utils/mm_warnings'
import 'src/services/interceptor'
disableMMAutoRefreshWarning()

BigNumber.set({ EXPONENTIAL_AT: [-7, 255] })

Sentry.init({
  dsn: SENTRY_DSN,
  release: `aura-safe@${process.env.REACT_APP_APP_VERSION}`,
  integrations: [new Integrations.BrowserTracing()],
  sampleRate: 0.1,
  // ignore MetaMask errors we don't control
  ignoreErrors: ['Internal JSON-RPC error', 'JsonRpcEngine', 'Non-Error promise rejection captured with keys: code'],
})

const root = document.getElementById('root')

if (root !== null) {
  ReactDOM.render(<Root />, root)
}
