import { SET_LANGUAGE } from "./actionTypes";

export const setLanguage = (language) => ({
  type: SET_LANGUAGE,
  payload: language,
});