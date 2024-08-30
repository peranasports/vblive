const VBLiveAPIReducer = (state, action) => {
  switch (action.type) {
    case "GET_SESSIONS":
      return {
        ...state,
        sessions: action.payload.sessions,
        appName: action.payload.appName,
        loading: false,
      };
    case "GET_SESSION_INFO_FOR_SERVER":
      return {
        ...state,
        sessions: action.payload.sessions,
        loading: false,
      };
    case "GET_SESSION":
      return {
        ...state,
        session: action.payload,
        loading: false,
      };
    case "GET_LATEST":
      return {
        ...state,
        session: action.payload,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: true,
      };
    case "CLEAR_SESSIONS":
      return {
        ...state,
        sessions: [],
      };
    case "LOAD_SESSION":
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
};

export default VBLiveAPIReducer;
