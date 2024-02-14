import { SET_DEFAULT_LANGUAGE, SET_DEFAULT_PRODUCT } from "./actionTypes";

const initialState = {
  default_product: '',
  default_language:'en'
};

const defaultReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_DEFAULT_PRODUCT:
      return {
        ...state,
        default_product: action.payload,
      };
      case SET_DEFAULT_LANGUAGE:
        return {
          ...state,
          default_language: action.payload,
        };
  
    default:
      return state;
  }
};

export default defaultReducer;
