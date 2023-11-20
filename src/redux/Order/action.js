// action.js

import { SET_CUSTOMER_ID, SET_AREA_ID, CLEAR_CUSTOMER_ID, CLEAR_AREA_ID } from "./actionTypes.js";

export const setCustomerId = (customer_Id) => ({
  type: SET_CUSTOMER_ID,
  payload: customer_Id,
});

export const setAreaId = (area_id) => ({
  type: SET_AREA_ID,
  payload: area_id,
});

export const clearCustomerId = () => ({
  type: CLEAR_CUSTOMER_ID,
});

export const clearAreaId = () => ({
  type: CLEAR_AREA_ID,
});
