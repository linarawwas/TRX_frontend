// redux/selectors/shipment.ts
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import type { ShipmentState } from "../Shipment/types";

const EMPTY_SHIPMENT = {} as ShipmentState;
const EMPTY_STRING_ARRAY: string[] = [];

export const selectShipment = createSelector(
  [(s: RootState) => s.shipment],
  (shipment): ShipmentState => shipment ?? EMPTY_SHIPMENT
);
export const selectRound = createSelector(
  [(s: RootState) => s.shipment?.round],
  (round) => round ?? ({} as NonNullable<ShipmentState["round"]>)
);

export const selectShipmentMeta = createSelector(
  [(s: RootState) => s.shipment?._id ?? "", (s: RootState) => s.shipment?.dayId ?? ""],
  (id, dayId) => ({ id, dayId })
);

export const selectTodayProgress = createSelector(
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
  (target, delivered, returned, paidUSD, paidLBP, expUSD, expLBP, profUSD, profLBP) => ({
    target,
    delivered,
    returned,
    paidUSD,
    paidLBP,
    expUSD,
    expLBP,
    profUSD,
    profLBP,
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
