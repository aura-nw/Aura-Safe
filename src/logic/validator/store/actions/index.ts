import { Action, createAction } from 'redux-actions'
import { ThunkDispatch } from 'redux-thunk'
import { AppReduxState } from 'src/logic/safe/store'
import { getAllValidators } from 'src/services'
import { ValidatorType } from '../reducer'
import { defValidatorImage } from 'src/pages/Staking'

export const FETCH_ALL_VALIDATORS = 'FETCH_ALL_VALIDATORS'

export const fetchAllValidator =
  () =>
  async (dispatch: ThunkDispatch<AppReduxState, undefined, Action<ValidatorType[]>>): Promise<void> => {
    try {
      const listValidators: any = (await getAllValidators()) || []
      const validators = listValidators.validator.map((val) => {
        return {
          commission: val.commission,
          description: {
            moniker: val.description.moniker,
            picture: val.image_url.includes('http') ? val.image_url : defValidatorImage,
          },
          operatorAddress: val.operator_address,
          status: val.status,
          uptime: val.uptime,
          validator: val.description.moniker,
          votingPower: {
            number: val.tokens,
            percentage: val.percent_voting_power,
          },
        }
      })
      if (validators) {
        const formatedData: ValidatorType[] = validators.map(
          (validator: any): ValidatorType => ({
            name: validator.description.moniker,
            operatorAddress: validator.operatorAddress,
            picture: validator.description.picture,
            votingPower: { number: validator.votingPower.number, percentage: validator.votingPower.percentage },
          }),
        )
        dispatch(setAllValidator(formatedData))
      }
    } catch (err) {
      console.error('fetch validator error', err)
    }
    return Promise.resolve()
  }
const setAllValidator = createAction<ValidatorType[]>(FETCH_ALL_VALIDATORS)
