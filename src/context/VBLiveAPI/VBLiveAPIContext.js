import { createContext, useReducer } from 'react'
import VBLiveAPIReducer from './VBLiveAPIReducer'

const VBLiveAPIContext = createContext()

export const VBLiveAPIProvider = ({ children }) => {
  const initialState = {
    sessions: [],
    session: {},
    appName: null,
    loading: false,
  }

  const [state, dispatch] = useReducer(VBLiveAPIReducer, initialState)

  return (
    <VBLiveAPIContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </VBLiveAPIContext.Provider>
  )
}

export default VBLiveAPIContext
