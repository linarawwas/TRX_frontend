import { CLEAR_TOKEN, CLEAR_COMPANY_ID, CLEAR_IS_ADMIN, CLEAR_USERNAME } from './actionTypes.js'; // Adjust the import path

const initialState = {
  token: null,
  companyId: '',
  isAdmin: false,
  username: '',
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    case 'SET_USERNAME':
      return {
        ...state,
        username: action.payload,
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
        token: '',
      };
    case CLEAR_IS_ADMIN:
      return {
        ...state,
        isAdmin: false,
      };
    case CLEAR_COMPANY_ID:
      return {
        ...state,
        companyId: '',
      };
    case CLEAR_USERNAME:
      return {
        ...state,
        username: '',
      };
    default:
      return state;
  }
};

export default userReducer;
