import { SET_DEFAULT_LANGUAGE, SET_DEFAULT_PRODUCT } from "./actionTypes";

export const setDefaultProduct = (default_product: string) => ({
  type: SET_DEFAULT_PRODUCT,
  payload: default_product,
});

export const setDefaultLanguage = (default_languge: string) => ({
  type: SET_DEFAULT_LANGUAGE,
  payload: default_languge,
});

