// redux/reducer.js
const initialState = {
    token: null,
    companyId: null,
  };
  
  const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_TOKEN':
        return {
          ...state,
          token: action.payload,
        };
      case 'SET_COMPANY_ID':
        return {
          ...state,
          companyId: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default userReducer;
  