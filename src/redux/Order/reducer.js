import { CLEAR_AREA_ID, CLEAR_CUSTOMER_ID } from './actionTypes.js'; // Adjust the import path

const initialState = {
  area_Id: null,
  customer_Id: null,
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_AREA_ID':
      return {
        ...state,
        area_Id: action.payload,
      };
    case 'SET_CUSTOMER_ID':
      return {
        ...state,
        customer_Id: action.payload,
      };
    case CLEAR_AREA_ID:
      return {
        ...state,
        area_Id: null,
      };
    case CLEAR_CUSTOMER_ID:
      return {
        ...state,
        customer_Id: null,
      };
    default:
      return state;
  }
};

export default orderReducer;
