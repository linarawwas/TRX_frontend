import { SET_DEFAULT } from "./actionTypes";

const initialState = {
  product: '',
  default:'en'
};

const defaultReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_DEFAULT:
      return {
        ...state,
        area_Id: action.payload,
      };

    default:
      return state;
  }
};

export default defaultReducer;
