import { CLEAR_TOKEN, CLEAR_COMPANY_ID, CLEAR_IS_ADMIN } from './actionTypes.js'; // Adjust the import path

const initialState = {
  token: null,
  companyId: null,
  isAdmin: false,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    case 'SET_IS_ADMIN':
      return {
        ...state,
        isAdmin: action.payload,
      };
    case 'SET_COMPANY_ID':
      return {
        ...state,
        companyId: action.payload,
      };
    case CLEAR_TOKEN:
      return {
        ...state,
        token: null,
      };
    case CLEAR_IS_ADMIN:
      return {
        ...state,
        isAdmin: null,
      };
    case CLEAR_COMPANY_ID:
      return {
        ...state,
        companyId: null,
      };
    default:
      return state;
  }
};

export default userReducer;
