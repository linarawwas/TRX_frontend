// action.js

import { SET_CUSTOMER_ID,SET_PRODUCT_PRICE, SET_PRODUCT_NAME,SET_AREA_ID,SET_PRODUCT_ID,CLEAR_PRODUCT_ID, CLEAR_CUSTOMER_ID, CLEAR_AREA_ID } from "./actionTypes.js";

export const setCustomerId = (customer_Id) => ({
  type: SET_CUSTOMER_ID,
  payload: customer_Id,
});

export const setAreaId = (area_id) => ({
  type: SET_AREA_ID,
  payload: area_id,
});
export const setProductId =(product_id)=>({
  type: SET_PRODUCT_ID,
  payload:product_id,
})
export const setProductName =(productName)=>({
  type: SET_PRODUCT_NAME,
  payload:productName,
})
export const setProductPrice =(product_price)=>({
  type: SET_PRODUCT_PRICE,
  payload:product_price,
})

export const clearCustomerId = () => ({
  type: CLEAR_CUSTOMER_ID,
});

export const clearAreaId = () => ({
  type: CLEAR_AREA_ID,
});
export const clearProductId = () => ({
  type: CLEAR_PRODUCT_ID,
});
