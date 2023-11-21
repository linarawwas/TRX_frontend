// action.js

import { SET_DAY_NAME, SET_DATE_DAY, SET_DATE_MONTH, SET_DATE_YEAR, CLEAR_DAY_NAME, CLEAR_DATE_DAY, CLEAR_DATE_MONTH, CLEAR_DATE_YEAR } from "./actionTypes";

export const setDayName = (dayName) => ({
  type: SET_DAY_NAME,
  payload: dayName,
});

export const setDateDay = (day) => ({
  type: SET_DATE_DAY,
  payload: day,
});
export const setDateMonth = (month) => ({
  type: SET_DATE_MONTH,
  payload: month,
});

export const setDateYear = (year) => ({
  type: SET_DATE_YEAR,
  payload: year,
});

export const clearDayName = () => ({
  type: CLEAR_DAY_NAME,
});

export const clearDateDay = () => ({
  type: CLEAR_DATE_DAY,
});
export const clearDateMonth = () => ({
  type: CLEAR_DATE_MONTH,
});
export const clearDateYear = () => ({
  type: CLEAR_DATE_YEAR,
});
