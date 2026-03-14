// redux/selectors/shipment.ts
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import type { ShipmentState } from "../Shipment/types";

const EMPTY_SHIPMENT = {} as ShipmentState;
const EMPTY_ROUND = {} as NonNullable<ShipmentState["round"]>;
const EMPTY_STRING_ARRAY: string[] = [];
const EMPTY_PREVIOUS_SNAPSHOT = {
  id: "",
  dayId: "",
  year: null,
  month: null,
  day: null,
  target: 0,
  delivered: 0,
  returned: 0,
  dollarPayments: 0,
  liraPayments: 0,
  expensesInUSD: 0,
  expensesInLiras: 0,
  profitsInUSD: 0,
  profitsInLiras: 0,
  filledOrders: EMPTY_STRING_ARRAY,
  emptyOrders: EMPTY_STRING_ARRAY,
  pendingOrders: EMPTY_STRING_ARRAY,
} as const;

export const selectShipment = (s: RootState): ShipmentState =>
  s.shipment ?? EMPTY_SHIPMENT;
export const selectRound = (s: RootState): NonNullable<ShipmentState["round"]> =>
  s.shipment?.round ?? EMPTY_ROUND;

export const selectShipmentMeta = createSelector(
  [(s: RootState) => s.shipment?._id ?? "", (s: RootState) => s.shipment?.dayId ?? ""],
  (id, dayId) => ({ id, dayId })
);

export const selectShipmentDate = createSelector(
  [
    (s: RootState) => s.shipment?.year ?? null,
    (s: RootState) => s.shipment?.month ?? null,
    (s: RootState) => s.shipment?.day ?? null,
  ],
  (year, month, day) => ({ year, month, day })
);

export const selectShipmentExchangeRateLBP = (s: RootState): number | null =>
  s.shipment?.exchangeRateLBP ?? null;

export const selectShipmentLiveTotals = createSelector(
  [
    (s: RootState) => s.shipment?.target ?? 0,
    (s: RootState) => s.shipment?.delivered ?? 0,
    (s: RootState) => s.shipment?.returned ?? 0,
    (s: RootState) => s.shipment?.dollarPayments ?? 0,
    (s: RootState) => s.shipment?.liraPayments ?? 0,
    (s: RootState) => s.shipment?.expensesInUSD ?? 0,
    (s: RootState) => s.shipment?.expensesInLiras ?? 0,
    (s: RootState) => s.shipment?.profitsInUSD ?? 0,
    (s: RootState) => s.shipment?.profitsInLiras ?? 0,
  ],
  (
    target,
    delivered,
    returned,
    dollarPayments,
    liraPayments,
    expensesInUSD,
    expensesInLiras,
    profitsInUSD,
    profitsInLiras
  ) => ({
    target,
    delivered,
    returned,
    dollarPayments,
    liraPayments,
    expensesInUSD,
    expensesInLiras,
    profitsInUSD,
    profitsInLiras,
  })
);

export const selectTodayProgress = createSelector(
  [selectShipmentLiveTotals],
  ({
    target,
    delivered,
    returned,
    dollarPayments,
    liraPayments,
    expensesInUSD,
    expensesInLiras,
    profitsInUSD,
    profitsInLiras,
  }) => ({
    target,
    delivered,
    returned,
    paidUSD: dollarPayments,
    paidLBP: liraPayments,
    expUSD: expensesInUSD,
    expLBP: expensesInLiras,
    profUSD: profitsInUSD,
    profLBP: profitsInLiras,
  })
);

export const selectShipmentCustomerBuckets = createSelector(
  [
    (s: RootState) => s.shipment?.CustomersWithFilledOrders,
    (s: RootState) => s.shipment?.CustomersWithEmptyOrders,
    (s: RootState) => s.shipment?.CustomersWithPendingOrders,
  ],
  (filledOrders, emptyOrders, pendingOrders) => ({
    filledOrders: Array.isArray(filledOrders) ? filledOrders : EMPTY_STRING_ARRAY,
    emptyOrders: Array.isArray(emptyOrders) ? emptyOrders : EMPTY_STRING_ARRAY,
    pendingOrders: Array.isArray(pendingOrders) ? pendingOrders : EMPTY_STRING_ARRAY,
  })
);

export const selectShipmentPreviousSnapshot = createSelector(
  [
    (s: RootState) => s.shipment?.prev_id ?? "",
    (s: RootState) => s.shipment?.prev_dayId ?? "",
    (s: RootState) => s.shipment?.prev_year ?? null,
    (s: RootState) => s.shipment?.prev_month ?? null,
    (s: RootState) => s.shipment?.prev_day ?? null,
    (s: RootState) => s.shipment?.prev_target ?? 0,
    (s: RootState) => s.shipment?.prev_delivered ?? 0,
    (s: RootState) => s.shipment?.prev_returned ?? 0,
    (s: RootState) => s.shipment?.prev_dollarPayments ?? 0,
    (s: RootState) => s.shipment?.prev_liraPayments ?? 0,
    (s: RootState) => s.shipment?.prev_expensesInUSD ?? 0,
    (s: RootState) => s.shipment?.prev_expensesInLiras ?? 0,
    (s: RootState) => s.shipment?.prev_profitsInUSD ?? 0,
    (s: RootState) => s.shipment?.prev_profitsInLiras ?? 0,
    (s: RootState) => s.shipment?.prev_CustomersWithFilledOrder,
    (s: RootState) => s.shipment?.prev_CustomersWithEmptyOrders,
    (s: RootState) => s.shipment?.prev_CustomersWithPendingOrders,
  ],
  (
    id,
    dayId,
    year,
    month,
    day,
    target,
    delivered,
    returned,
    dollarPayments,
    liraPayments,
    expensesInUSD,
    expensesInLiras,
    profitsInUSD,
    profitsInLiras,
    filledOrders,
    emptyOrders,
    pendingOrders
  ) => ({
    ...(EMPTY_PREVIOUS_SNAPSHOT as object),
    id,
    dayId,
    year,
    month,
    day,
    target,
    delivered,
    returned,
    dollarPayments,
    liraPayments,
    expensesInUSD,
    expensesInLiras,
    profitsInUSD,
    profitsInLiras,
    filledOrders: Array.isArray(filledOrders) ? filledOrders : EMPTY_STRING_ARRAY,
    emptyOrders: Array.isArray(emptyOrders) ? emptyOrders : EMPTY_STRING_ARRAY,
    pendingOrders: Array.isArray(pendingOrders) ? pendingOrders : EMPTY_STRING_ARRAY,
  })
);

export const selectRoundProgress = createSelector(
  [
    (s: RootState) => s.shipment?.round?.sequence ?? null,
    (s: RootState) => Number(s.shipment?.round?.targetAdded || 0),
    (s: RootState) => Number(s.shipment?.round?.baseDelivered ?? s.shipment?.delivered ?? 0),
    (s: RootState) => Number(s.shipment?.round?.baseReturned ?? s.shipment?.returned ?? 0),
    (s: RootState) => Number(s.shipment?.round?.baseUsd ?? s.shipment?.dollarPayments ?? 0),
    (s: RootState) => Number(s.shipment?.round?.baseLbp ?? s.shipment?.liraPayments ?? 0),
    (s: RootState) => Number(s.shipment?.round?.baseExpUsd ?? s.shipment?.expensesInUSD ?? 0),
    (s: RootState) => Number(s.shipment?.round?.baseExpLbp ?? s.shipment?.expensesInLiras ?? 0),
    (s: RootState) => Number(s.shipment?.round?.baseProfUsd ?? s.shipment?.profitsInUSD ?? 0),
    (s: RootState) => Number(s.shipment?.round?.baseProfLbp ?? s.shipment?.profitsInLiras ?? 0),
    (s: RootState) => Number(s.shipment?.delivered || 0),
    (s: RootState) => Number(s.shipment?.returned || 0),
    (s: RootState) => Number(s.shipment?.dollarPayments || 0),
    (s: RootState) => Number(s.shipment?.liraPayments || 0),
    (s: RootState) => Number(s.shipment?.expensesInUSD || 0),
    (s: RootState) => Number(s.shipment?.expensesInLiras || 0),
    (s: RootState) => Number(s.shipment?.profitsInUSD || 0),
    (s: RootState) => Number(s.shipment?.profitsInLiras || 0),
  ],
  (
    sequence,
    targetRound,
    baseDelivered,
    baseReturned,
    baseUsd,
    baseLbp,
    baseExpUsd,
    baseExpLbp,
    baseProfUsd,
    baseProfLbp,
    deliveredDay,
    returnedDay,
    paidUsdDay,
    paidLbpDay,
    expUsdDay,
    expLbpDay,
    profUsdDay,
    profLbpDay
  ) => {
    const deliveredThisRound = Math.max(0, deliveredDay - baseDelivered);
    const returnedThisRound = Math.max(0, returnedDay - baseReturned);
    const usdThisRound = Math.max(0, paidUsdDay - baseUsd);
    const lbpThisRound = Math.max(0, paidLbpDay - baseLbp);
    const expUsdThisRound = Math.max(0, expUsdDay - baseExpUsd);
    const expLbpThisRound = Math.max(0, expLbpDay - baseExpLbp);
    const profUsdThisRound = Math.max(0, profUsdDay - baseProfUsd);
    const profLbpThisRound = Math.max(0, profLbpDay - baseProfLbp);
    const remainingRound = Math.max(0, targetRound - deliveredThisRound);
    return {
      sequence,
      targetRound,
      deliveredThisRound,
      returnedThisRound,
      usdThisRound,
      lbpThisRound,
      expUsdThisRound,
      expLbpThisRound,
      profUsdThisRound,
      profLbpThisRound,
      remainingRound,
    };
  }
);

export const selectCustomersWithFilledOrders = createSelector(
  [(s: RootState) => s.shipment?.CustomersWithFilledOrders],
  (arr): string[] => (Array.isArray(arr) ? arr : EMPTY_STRING_ARRAY)
);
export const selectCustomersWithEmptyOrders = createSelector(
  [(s: RootState) => s.shipment?.CustomersWithEmptyOrders],
  (arr): string[] => (Array.isArray(arr) ? arr : EMPTY_STRING_ARRAY)
);
export const selectCustomersWithPendingOrders = createSelector(
  [(s: RootState) => s.shipment?.CustomersWithPendingOrders],
  (arr): string[] => (Array.isArray(arr) ? arr : EMPTY_STRING_ARRAY)
);
