import { createContext, useState } from 'react'

interface AppContextInterface {
  term: boolean
  valueTerm: null
  SetTerm: any
  SetValueTerm: any
}
const TermContext = createContext<AppContextInterface | null>(null)

export const TermProvider = ({ children }) => {
  const [term, setTerm] = useState(false)
  const [valueTerm, setValueTerm] = useState(null)

  const SetTerm = (value: any) => {
    setTerm(value)
  }

  const SetValueTerm = (value: any) => {
    setValueTerm(value)
  }

  return <TermContext.Provider value={{ term, valueTerm, SetTerm, SetValueTerm }}>{children}</TermContext.Provider>
}

export default TermContext
