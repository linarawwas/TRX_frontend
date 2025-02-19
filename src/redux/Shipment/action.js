// action.js

import { SET_DAY_ID, SET_SHIPMENT_FROM_PREV, SET_TOTAL_PAYMENTS, SET_RETURNED, SET_DELIVERED, SET_LIRA_PAYMENTS, SET_USD_PAYMENTS, SET_ID, SET_DATE_DAY, SET_DATE_MONTH, SET_DATE_YEAR, CLEAR_DAY_ID, CLEAR_DATE_DAY, CLEAR_DATE_MONTH, CLEAR_DATE_YEAR, CLEAR_ID, SET_TARGET, CLEAR_ALL_SHIPMENT_INFO, SET_SHIPMENT_PROFITS, SET_SHIPMENT_EXPENSES, CLEAR_SHIPMENT_EXPENSES, CLEAR_SHIPMENT_PROFITS, SET_SHIPMENT_PROFITS_IN_LIRAS, SET_SHIPMENT_EXPENSES_IN_LIRAS, SET_SHIPMENT_PROFITS_IN_USD, SET_SHIPMENT_EXPENSES_IN_USD, CLEAR_SHIPMENT_PROFITS_IN_LIRAS, CLEAR_SHIPMENT_EXPENSES_IN_LIRAS, CLEAR_SHIPMENT_EXPENSES_IN_USD, CLEAR_SHIPMENT_PROFITS_IN_USD, ADD_CUSTOMER_WITH_FILLED_ORDER, ADD_CUSTOMER_WITH_EMPTY_ORDER, ADD_PENDING_ORDER, REMOVE_PENDING_ORDER } from "./actionTypes";
// Action Creators
export const addPendingOrder = (customerId) => ({
  type: ADD_PENDING_ORDER,
  payload: customerId,
});

export const removePendingOrder = (customerId) => ({
  type: REMOVE_PENDING_ORDER,
  payload: customerId,
});
export const setDayId = (dayId) => ({
  type: SET_DAY_ID,
  payload: dayId,
});
export const setShipmentFromPrev = () => {
  return {
    type: SET_SHIPMENT_FROM_PREV,
  };
};
export const addCustomerWithFilledOrder = (customerId) => ({
  type: ADD_CUSTOMER_WITH_FILLED_ORDER,
  payload: customerId
});

export const addCustomerWithEmptyOrder = (customerId) => ({
  type: ADD_CUSTOMER_WITH_EMPTY_ORDER,
  payload: customerId
});

export const setShipmentProfitsInLiras = (profitsInLiras) => {
  return {
    type: SET_SHIPMENT_PROFITS_IN_LIRAS,
    payload: profitsInLiras,

  };
};
export const setShipmentExpensesInLiras = (expensesInLiras) => {
  return {
    type: SET_SHIPMENT_EXPENSES_IN_LIRAS,
    payload: expensesInLiras,

  };
};
export const setShipmentProfitsInUSD = (profitsInUSD) => {
  return {
    type: SET_SHIPMENT_PROFITS_IN_USD,
    payload: profitsInUSD,

  };
};
export const setShipmentExpensesInUSD = (expensesInUSD) => {
  return {
    type: SET_SHIPMENT_EXPENSES_IN_USD,
    payload: expensesInUSD,

  };
};
export const setShipmentTarget = (target) => ({
  type: SET_TARGET,
  payload: target,
})
export const setShipmentDelivered = (delivered) => ({
  type: SET_DELIVERED,
  payload: delivered,
});
export const setShipmentReturned = (returned) => ({
  type: SET_RETURNED,
  payload: returned,
});
export const setShipmentPayments = (payments) => ({
  type: SET_TOTAL_PAYMENTS,
  payload: payments,
});
export const setShipmentPaymentsInLiras = (liraPayments) => ({
  type: SET_LIRA_PAYMENTS,
  payload: liraPayments,
});
export const setShipmentPaymentsInDollars = (dollarPayments) => ({
  type: SET_USD_PAYMENTS,
  payload: dollarPayments,
});


export const setShipmentId = (_id) => ({
  type: SET_ID,
  payload: _id,
})
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