import { 
  SET_TOKEN, 
  SET_USERNAME, 
  SET_IS_ADMIN, 
  SET_COMPANY_ID,
  CLEAR_TOKEN, 
  CLEAR_COMPANY_ID, 
  CLEAR_IS_ADMIN, 
  CLEAR_USERNAME 
} from './actionTypes';

interface UserState {
  token: string | null;
  companyId: string;
  isAdmin: boolean;
  username: string;
}

const initialState: UserState = {
  token: null,
  companyId: '',
  isAdmin: false,
  username: '',
};

interface Action {
  type: string;
  payload?: any;
}

const userReducer = (state = initialState, action: Action): UserState => {
  switch (action.type) {
    case SET_TOKEN:
      return {
        ...state,
        token: action.payload,
      };
    case SET_USERNAME:
      return {
        ...state,
        username: action.payload,
      };
    case SET_IS_ADMIN:
      return {
        ...state,
        isAdmin: action.payload,
      };
    case SET_COMPANY_ID:
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

