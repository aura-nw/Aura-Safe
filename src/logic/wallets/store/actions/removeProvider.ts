import { Dispatch } from 'src/logic/safe/store/actions/types.d'
import { createAction } from 'redux-actions'

export const REMOVE_PROVIDER = 'REMOVE_PROVIDER'

const removeProvider = createAction(REMOVE_PROVIDER)

export default (payload?: { keepStorageKey: boolean }) =>
  (dispatch: Dispatch): void => {
    // onboard().walletReset()
    // resetWeb3()

    dispatch(removeProvider(payload))
  }
