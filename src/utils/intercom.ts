import crypto from 'crypto'
import { CookieAttributes } from 'js-cookie'
import { COOKIES_KEY_INTERCOM } from 'src/logic/cookies/model/cookie'
import { loadFromCookie, saveCookie } from 'src/logic/cookies/utils'

let intercomLoaded = false

export const isIntercomLoaded = (): boolean => intercomLoaded

const getIntercomUserId = async () => {
  const cookiesState = await loadFromCookie(COOKIES_KEY_INTERCOM)
  if (!cookiesState) {
    const userId = crypto.randomBytes(32).toString('hex')
    const newCookieState = { userId }
    const cookieConfig: CookieAttributes = {
      expires: 365,
    }
    await saveCookie(COOKIES_KEY_INTERCOM, newCookieState, cookieConfig)
    return userId
  }
  const { userId } = cookiesState
  return userId
}

export const closeIntercom = (): void => {
  if (!isIntercomLoaded()) return
  intercomLoaded = false
  ;(window as any).Intercom('shutdown')
}
