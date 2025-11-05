// action.ts

import {
  SET_DAY_ID,
  SET_SHIPMENT_FROM_PREV,
  SET_TOTAL_PAYMENTS,
  SET_RETURNED,
  SET_ROUND_INFO,
  CLEAR_ROUND_INFO,
  SET_DELIVERED,
  SET_LIRA_PAYMENTS,
  SET_USD_PAYMENTS,
  SET_ID,
  SET_DATE_DAY,
  SET_DATE_MONTH,
  SET_DATE_YEAR,
  CLEAR_DAY_ID,
  CLEAR_DATE_DAY,
  CLEAR_DATE_MONTH,
  CLEAR_DATE_YEAR,
  CLEAR_ID,
  SET_TARGET,
  CLEAR_ALL_SHIPMENT_INFO,
  SET_SHIPMENT_PROFITS_IN_LIRAS,
  SET_SHIPMENT_EXPENSES_IN_LIRAS,
  SET_SHIPMENT_PROFITS_IN_USD,
  SET_SHIPMENT_EXPENSES_IN_USD,
  CLEAR_SHIPMENT_PROFITS_IN_LIRAS,
  CLEAR_SHIPMENT_EXPENSES_IN_LIRAS,
  CLEAR_SHIPMENT_EXPENSES_IN_USD,
  CLEAR_SHIPMENT_PROFITS_IN_USD,
  ADD_CUSTOMER_WITH_FILLED_ORDER,
  ADD_CUSTOMER_WITH_EMPTY_ORDER,
  ADD_PENDING_ORDER,
  REMOVE_PENDING_ORDER,
  SET_EXCHANGE_RATE_LBP,
} from "./actionTypes";

// Action Creators
export const addPendingOrder = (customerId: string) => ({
  type: ADD_PENDING_ORDER,
  payload: customerId,
});

export const removePendingOrder = (customerId: string) => ({
  type: REMOVE_PENDING_ORDER,
  payload: customerId,
});

export const setDayId = (dayId: string) => ({
  type: SET_DAY_ID,
  payload: dayId,
});

export const setShipmentFromPrev = () => {
  return {
    type: SET_SHIPMENT_FROM_PREV,
  };
};

export const addCustomerWithFilledOrder = (customerId: string) => ({
  type: ADD_CUSTOMER_WITH_FILLED_ORDER,
  payload: customerId,
});

export const addCustomerWithEmptyOrder = (customerId: string) => ({
  type: ADD_CUSTOMER_WITH_EMPTY_ORDER,
  payload: customerId,
});

export const setShipmentProfitsInLiras = (profitsInLiras: number) => {
  return {
    type: SET_SHIPMENT_PROFITS_IN_LIRAS,
    payload: profitsInLiras,
  };
};

export const setShipmentExpensesInLiras = (expensesInLiras: number) => {
  return {
    type: SET_SHIPMENT_EXPENSES_IN_LIRAS,
    payload: expensesInLiras,
  };
};

export const setShipmentProfitsInUSD = (profitsInUSD: number) => {
  return {
    type: SET_SHIPMENT_PROFITS_IN_USD,
    payload: profitsInUSD,
  };
};

export const setShipmentExpensesInUSD = (expensesInUSD: number) => {
  return {
    type: SET_SHIPMENT_EXPENSES_IN_USD,
    payload: expensesInUSD,
  };
};

export const setShipmentTarget = (target: number) => ({
  type: SET_TARGET,
  payload: target,
});

export const setShipmentDelivered = (delivered: number) => ({
  type: SET_DELIVERED,
  payload: delivered,
});

export const setShipmentReturned = (returned: number) => ({
  type: SET_RETURNED,
  payload: returned,
});

export const setShipmentPayments = (payments: number) => ({
  type: SET_TOTAL_PAYMENTS,
  payload: payments,
});

export const setShipmentPaymentsInLiras = (liraPayments: number) => ({
  type: SET_LIRA_PAYMENTS,
  payload: liraPayments,
});

export const setShipmentPaymentsInDollars = (dollarPayments: number) => ({
  type: SET_USD_PAYMENTS,
  payload: dollarPayments,
});

export const setRoundInfo = (payload: {
  sequence: number; // round #
  targetAdded: number; // bottles added in this round
  baseDelivered?: number;
  baseReturned?: number;
  baseUsd?: number;
  baseLbp?: number;
  baseExpUsd?: number;
  baseExpLbp?: number;
  baseProfUsd?: number;
  baseProfLbp?: number;
  startedAt?: string; // ISO timestamp (optional)
}) => ({ type: SET_ROUND_INFO, payload });

export const clearRoundInfo = () => ({ type: CLEAR_ROUND_INFO });

export const setExchangeRateLBP = (rate: number) => ({
  type: SET_EXCHANGE_RATE_LBP,
  payload: rate,
});

export const setShipmentId = (_id: string) => ({
  type: SET_ID,
  payload: _id,
});

export const setDateDay = (day: number) => ({
  type: SET_DATE_DAY,
  payload: day,
});

export const setDateMonth = (month: number) => ({
  type: SET_DATE_MONTH,
  payload: month,
});

export const setDateYear = (year: number) => ({
  type: SET_DATE_YEAR,
  payload: year,
});

export const clearDayName = () => ({
  type: CLEAR_DAY_ID,
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

export const clearShipmentId = () => ({
  type: CLEAR_ID,
});

export const clearShipmentExpensesInLiras = () => ({
  type: CLEAR_SHIPMENT_EXPENSES_IN_LIRAS,
});

export const clearShipmentProfitsInLiras = () => ({
  type: CLEAR_SHIPMENT_PROFITS_IN_LIRAS,
});

export const clearShipmentExpensesInUSD = () => ({
  type: CLEAR_SHIPMENT_EXPENSES_IN_USD,
});

export const clearShipmentProfitsInUSD = () => ({
  type: CLEAR_SHIPMENT_PROFITS_IN_USD,
});

export const clearShipmentInfo = () => ({
  type: CLEAR_ALL_SHIPMENT_INFO,
});

