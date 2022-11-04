const VBLiveAPIReducer = (state, action) => {
    switch (action.type) {
        case 'GET_SESSIONS':
            return {
                ...state,
                sessions: action.payload.sessions,
                appName: action.payload.appName,
                loading: false,
            }
        case 'GET_SESSION':
            return {
                ...state,
                session: action.payload,
                loading: false,
            }
        case 'GET_LATEST':
            return {
                ...state,
                session: action.payload,
                loading: false,
            }
        case 'SET_LOADING':
            return {
                ...state,
                loading: true,
            }
        case 'CLEAR_SESSIONS':
            return {
                ...state,
                sessions: [],
            }
        default:
            return state
    }
}

export default VBLiveAPIReducer
