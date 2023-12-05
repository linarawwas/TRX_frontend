import { CLEAR_AREA_ID, CLEAR_PRODUCT_ID, CLEAR_PRODUCT_NAME, SET_PRODUCT_ID, CLEAR_CUSTOMER_ID, SET_AREA_ID, SET_CUSTOMER_ID, SET_PRODUCT_NAME, SET_PRODUCT_PRICE, CLEAR_PRODUCT_PRICE } from './actionTypes.js'; // Adjust the import path

const initialState = {
  area_Id: null,
  customer_Id: null,
  product_id: null,
  product_name: "",
  product_price: 0,
};

const orderReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case SET_AREA_ID:
      return {
        ...state,
        area_Id: action.payload,
      };
    case SET_PRODUCT_PRICE:
      return {
        ...state,
        product_price: action.payload,
      };
    case SET_CUSTOMER_ID:
      return {
        ...state,
        customer_Id: action.payload,
      };
    case SET_PRODUCT_ID:
      return {
        ...state,
        product_id: action.payload,
      };
    case SET_PRODUCT_NAME:
      return {
        ...state,
        product_name: action.payload,
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
    case CLEAR_PRODUCT_ID:
      return {
        ...state,
        customer_Id: null,
      };
    case CLEAR_PRODUCT_NAME:
      return {
        ...state,
        product_name: "",
      }; case CLEAR_PRODUCT_PRICE:
      return {
        ...state,
        product_price: 0,
      };
    default:
      return state;
  }
};

export default orderReducer;
