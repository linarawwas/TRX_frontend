import { SET_DEFAULT } from "./actionTypes";

export const setDefault = (company_default) => ({
  type: SET_DEFAULT,
  payload: company_default,
});