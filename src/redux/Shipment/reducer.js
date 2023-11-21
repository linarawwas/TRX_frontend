import { SET_DAY_NAME, SET_DATE_DAY, SET_DATE_MONTH, SET_DATE_YEAR, CLEAR_DAY_NAME, CLEAR_DATE_DAY, CLEAR_DATE_MONTH, CLEAR_DATE_YEAR } from "./actionTypes";

const initialState = {
  dayName: null,
  year: '',
  month: false,
  day: '',
};

const shipmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DAY_NAME:
      return {
        ...state,
        dayName: action.payload,
      };
    case SET_DATE_DAY:
      return {
        ...state,
        day: action.payload,
      };
    case SET_DATE_MONTH:
      return {
        ...state,
        month: action.payload,
      };
    case SET_DATE_YEAR:
      return {
        ...state,
        year: action.payload,
      };
    case CLEAR_DAY_NAME:
      return {
        ...state,
        dayName: '',
      };
    case CLEAR_DATE_MONTH:
      return {
        ...state,
        month: false,
      };
    case CLEAR_DATE_YEAR:
      return {
        ...state,
        year: '',
      };
    case CLEAR_DATE_DAY:
      return {
        ...state,
        day: '',
      };
    default:
      return state;
  }
};

export default shipmentReducer;
