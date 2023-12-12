import { SET_LANGUAGE } from "./actionTypes";

const initialState = {
  language: 'en'
};

const languageReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_LANGUAGE:
      return {
        ...state,
        area_Id: action.payload,
      };

    default:
      return state;
  }
};

export default languageReducer;
