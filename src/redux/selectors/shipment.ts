// redux/selectors/shipment.ts
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import type { ShipmentState } from "../Shipment/types";

const EMPTY_SHIPMENT = {} as ShipmentState;
const EMPTY_ROUND = {} as NonNullable<ShipmentState["round"]>;
const EMPTY_STRING_ARRAY: string[] = [];

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
