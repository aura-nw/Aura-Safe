import { CURRENT_SESSION_REDUCER_ID, ViewdSafeType } from 'src/logic/currentSession/store/reducer/currentSession'
import { AppReduxState } from 'src/logic/safe/store'

export const lastViewedSafe = (state: AppReduxState['currentSession']): ViewdSafeType | null => {
  const currentSession = state[CURRENT_SESSION_REDUCER_ID]
  if (!currentSession.restored) {
    return null
  }
  return currentSession.viewedSafes[0] || ''
}
