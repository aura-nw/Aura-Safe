import { Action, createAction } from 'redux-actions'
import { ThunkDispatch } from 'redux-thunk'
import { getChainInfo } from 'src/config'
import { AppReduxState } from 'src/logic/safe/store'
import { extractSafeAddress } from 'src/routes/routes'
import { getAllDelegations, getAllReward } from 'src/services'
import { DelegationType } from '../reducer'

export const FETCH_ALL_DELEGATIONS = 'FETCH_ALL_DELEGATIONS'

export const fetchAllDelegations =
  () =>
  async (dispatch: ThunkDispatch<AppReduxState, undefined, Action<DelegationType[]>>): Promise<void> => {
    try {
      const safeAddress = extractSafeAddress()
      const currentChainInfo = getChainInfo() as any
      const allDelegation = await getAllDelegations(currentChainInfo.lcd, safeAddress)
      const allReward = await getAllReward(currentChainInfo.lcd, safeAddress)

      const formatDataDelegations =
        allDelegation?.delegation_responses?.map((delegation: any) => {
          const reward = allReward?.rewards?.find(
            (rw: any) => rw.validator_address === delegation.delegation.validator_address,
          ) as any
          return {
            balance: delegation.balance,
            operatorAddress: delegation.delegation.validator_address,
            reward: reward?.reward ?? [],
          }
        }) ?? []

      const formatedData: DelegationType[] = formatDataDelegations.map(
        (delegation: any): DelegationType => ({
          operatorAddress: delegation.operatorAddress,
          reward: delegation.reward[0]?.amount,
          staked: delegation.balance?.amount,
        }),
      )
      dispatch(setAllDelegation(formatedData))
    } catch (err) {
      console.error('fetch delegation error', err)
    }
    return Promise.resolve()
  }
const setAllDelegation = createAction<DelegationType[]>(FETCH_ALL_DELEGATIONS)
