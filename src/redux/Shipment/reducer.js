import { SET_DAY_ID, SET_DATE_DAY, SET_DATE_MONTH, SET_DATE_YEAR, CLEAR_DAY_ID, CLEAR_DATE_DAY, CLEAR_DATE_MONTH, CLEAR_DATE_YEAR, SET_ID, CLEAR_SHIPMENT_INFO, SET_TARGET } from "./actionTypes";

const initialState = {
  _id: '',
  dayId: '',
  year: null,
  month: null,
  day: null,
  target:null,
};

const shipmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DAY_ID:
      return {
        ...state,
        dayId: action.payload,
      };
    case SET_ID:
      return {
        ...state,
        _id: action.payload,
      };
      case SET_TARGET:
        return {
          ...state,
          target: action.payload,
        }
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
    case CLEAR_DAY_ID:
      return {
        ...state,
        dayId: '',
      };
    case CLEAR_DATE_MONTH:
      return {
        ...state,
        month: null,
      };
    case CLEAR_DATE_YEAR:
      return {
        ...state,
        year: null,
      };
    case CLEAR_DATE_DAY:
      return {
        ...state,
        day: null,
      };
    case CLEAR_SHIPMENT_INFO:
      return initialState; // Resetting the state to initial state

    default:
      return state;
  }
};

export default shipmentReducer;
