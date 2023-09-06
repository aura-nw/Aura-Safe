import { FallbackRender } from '@sentry/react/dist/errorboundary'
import { useState } from 'react'
import Astronaut from 'src/assets/images/astronaut.png'
import Space from 'src/assets/images/bg-space.png'
import { ROOT_ROUTE } from 'src/routes/routes'
import { IS_PRODUCTION } from 'src/utils/constants'
import { loadFromSessionStorage, removeFromSessionStorage, saveToSessionStorage } from 'src/utils/storage/session'
import styled from 'styled-components'
import { LinkButton } from '../Button'
const Wrapper = styled.div`
  width: 100vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10vh;
  > .content {
    display: flex;
    align-items: flex-start;
    > div {
      width: 480px;
      margin-top: 32px;
    }
  }
  .astronaut-image {
    width: 300px;
    animation-name: flo;
    animation-duration: 10s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;

    @keyframes flo {
      25% {
        transform: translate(-5px, 10px);
      }
      50% {
        transform: translate(10px, 10px);
      }
      75% {
        transform: translate(7px, 0px);
      }
    }
  }
  p {
    font-size: 16px;
    color: #ccdcdc;
  }
  a {
    text-decoration: none;
    font-weight: 700;
    color: #fff;
    font-size: 18px;
  }
  .bg-space {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
  }
  .title {
    font-size: 20px;
    letter-spacing: 0.08em;
    font-weight: 700;
    color: #fff;
  }
  .error-stack {
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.05em;
    max-height: 45vh;
    overflow: auto;
  }
  .discord-anchor {
    color: #7289da;
  }
  .homepage-anchor {
    color: #5ee6d0;
  }
`

//  When loading app during release, chunk load failure may occur
export const handleChunkError = (error: Error): boolean => {
  const LAST_CHUNK_FAILURE_RELOAD_KEY = 'lastChunkFailureReload'
  const MIN_RELOAD_TIME = 10_000

  const chunkFailedMessage = /Loading chunk [\d]+ failed/
  const isChunkError = error?.message && chunkFailedMessage.test(error.message)

  if (!isChunkError) return false

  const lastReload = loadFromSessionStorage<number>(LAST_CHUNK_FAILURE_RELOAD_KEY)

  const isTimestamp = typeof lastReload === 'number' && !isNaN(lastReload)

  // Not a number in the sessionStorage
  if (!isTimestamp) {
    removeFromSessionStorage(LAST_CHUNK_FAILURE_RELOAD_KEY)
    return false
  }

  const now = new Date().getTime()

  const hasJustReloaded = lastReload + MIN_RELOAD_TIME > now

  if (hasJustReloaded) return false

  saveToSessionStorage(LAST_CHUNK_FAILURE_RELOAD_KEY, now.toString())
  window.location.reload()
  return true
}
const ErrorDetail = ({ error, componentStack }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <LinkButton onClick={() => setOpen(!open)}>{open ? 'Hide details' : 'Show details'}</LinkButton>
      {open && (
        <div className="error-detail">
          <p>{error.toString()}</p>
          <div className="error-stack">{componentStack}</div>
        </div>
      )}
    </>
  )
}
const GlobalErrorBoundaryFallback: FallbackRender = ({ error, componentStack }) => {
  if (handleChunkError(error)) {
    // FallbackRender type does not allow null to be returned
    return <></>
  }

  return (
    <Wrapper>
      <img className="bg-space" src={Space} alt="" />
      <div className="content">
        <img className="astronaut-image" src={Astronaut} alt="" />
        <div>
          <p className="title">OH NO! SOMETHING WENT WRONG!!</p>
          <p>Don't be alone wanderer. Let us help you.</p>
          <p>
            Please contact us via{' '}
            <a className="discord-anchor" href="https://discord.gg/bzm3dyxJxR">
              Discord
            </a>{' '}
            or{' '}
            <a className="homepage-anchor" href={ROOT_ROUTE}>
              Return Homepage
            </a>
          </p>
          {!IS_PRODUCTION && <ErrorDetail error={error} componentStack={componentStack} />}
        </div>
      </div>
    </Wrapper>
  )
}

export default GlobalErrorBoundaryFallback
