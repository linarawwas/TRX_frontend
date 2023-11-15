// action.js

import { SET_TOKEN, SET_COMPANY_ID, CLEAR_TOKEN, CLEAR_COMPANY_ID } from "./actionTypes";

export const setToken = (token) => ({
  type: SET_TOKEN,
  payload: token,
});

export const setCompanyId = (companyId) => ({
  type: SET_COMPANY_ID,
  payload: companyId,
});

export const clearToken = () => ({
  type: CLEAR_TOKEN,
});

export const clearCompanyId = () => ({
  type: CLEAR_COMPANY_ID,
});
