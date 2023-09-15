import { createAction } from 'redux-actions'
import { TermPayload } from '../reducer/term'

export const SET_TERM = 'SET_TERM'

export const SET_VALUE_TERM = 'SET_VALUE_TERM'

export const setTerm = createAction<TermPayload>(SET_TERM)
