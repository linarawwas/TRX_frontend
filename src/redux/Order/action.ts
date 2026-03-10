// action.ts
// Backwards-compatible re-exports of the Redux Toolkit slice actions.

import { orderSlice } from "./reducer";

export const {
  setCustomerId,
  setAreaId,
  setProductId,
  setProductName,
  setProductPrice,
  setCustomerName,
  setCustomerPhoneNb,
  clearCustomerName,
  clearCustomerId,
  clearAreaId,
  clearProductId,
  clearCustomerPhoneNb,
  clearProductPrice,
} = orderSlice.actions;

