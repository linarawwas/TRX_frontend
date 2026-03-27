// action.ts
// Backwards-compatible re-exports of the Redux Toolkit slice actions.

import { shipmentSlice } from "./reducer";

export const {
  addPendingOrder,
  removePendingOrder,
  setDayId,
  addCustomerWithFilledOrder,
  addCustomerWithEmptyOrder,
  setShipmentProfitsInLiras,
  setShipmentExpensesInLiras,
  setShipmentProfitsInUSD,
  setShipmentExpensesInUSD,
  setTarget: setShipmentTarget,
  setDelivered: setShipmentDelivered,
  setReturned: setShipmentReturned,
  setTotalPayments: setShipmentPayments,
  setLiraPayments: setShipmentPaymentsInLiras,
  setUsdPayments: setShipmentPaymentsInDollars,
  setRoundInfo,
  clearRoundInfo,
  setExchangeRateLBP,
  setShipmentId,
  setDateDay,
  setDateMonth,
  setDateYear,
  clearDayId: clearDayName,
  clearDateDay,
  clearDateMonth,
  clearDateYear,
  clearShipmentExpensesInLiras,
  clearShipmentProfitsInLiras,
  clearShipmentExpensesInUSD,
  clearShipmentProfitsInUSD,
  clearAllShipmentInfo: clearShipmentInfo,
} = shipmentSlice.actions;

