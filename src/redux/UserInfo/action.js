// action.js

import { SET_TOKEN, SET_IS_ADMIN, SET_COMPANY_ID, SET_USERNAME, CLEAR_TOKEN, CLEAR_IS_ADMIN, CLEAR_COMPANY_ID, CLEAR_USERNAME } from "./actionTypes";

export const setToken = (token) => ({
  type: SET_TOKEN,
  payload: token,
});

export const setIsAdmin = (isAdmin) => ({
  type: SET_IS_ADMIN,
  payload: isAdmin,
});
export const setUsername = (username) => ({
  type: SET_USERNAME,
  payload: username,
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
export const clearIsAdmin = () => ({
  type: CLEAR_IS_ADMIN,
});
export const clearUsername = () => ({
  type: CLEAR_USERNAME,
});
