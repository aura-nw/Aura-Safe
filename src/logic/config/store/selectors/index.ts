import { createSelector } from 'reselect'

import { AppReduxState } from 'src/logic/safe/store'
import { ChainId } from 'src/config/chain.d'
import { CONFIG_REDUCER_ID } from '../reducer'
import { ConfigState } from '../reducer/reducer.d'

const configState = (state: AppReduxState): ConfigState => state[CONFIG_REDUCER_ID]

export const currentChainId = createSelector([configState], (config): ChainId => {
  return config.chainId
})
export const currentEnvironment = createSelector([configState], (config): string => {
  return config.environment
})
