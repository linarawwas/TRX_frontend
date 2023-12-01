import { SET_DAY_ID, SET_DATE_DAY, SET_DATE_MONTH, SET_DATE_YEAR, CLEAR_DAY_ID, CLEAR_DATE_DAY, CLEAR_DATE_MONTH, CLEAR_DATE_YEAR, SET_ID, CLEAR_SHIPMENT_INFO, SET_TARGET, SET_RETURNED, SET_DELIVERED, SET_TOTAL_PAYMENTS, SET_USD_PAYMENTS, SET_LIRA_PAYMENTS } from "./actionTypes";

const initialState = {
  _id: '',
  dayId: '',
  year: null,
  month: null,
  day: null,
  target:0,
  delivered:0,
  returned:0,
  payments:0,
dollarPayments:0,
liraPayments:0
};

const shipmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DAY_ID:
      return {
        ...state,
        dayId: action.payload,
      };    
      case SET_TOTAL_PAYMENTS:
      return {
        ...state,
        payments: action.payload,
      };
      case SET_USD_PAYMENTS:
        return {
          ...state,
          dollarPayments: action.payload,
        };
        case SET_LIRA_PAYMENTS:
          return {
            ...state,
            liraPayments: action.payload,
          };  
      case SET_RETURNED:
      return {
        ...state,
        returned: action.payload,
      };    
      case SET_DELIVERED:
      return {
        ...state,
        delivered: action.payload,
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
