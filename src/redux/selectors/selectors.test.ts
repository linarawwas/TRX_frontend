import {
  selectCustomersWithFilledOrders,
  selectShipmentLiveTotals,
  selectShipmentMeta,
  selectRoundProgress,
  selectTodayProgress,
} from "./shipment";
import { selectOrder as selectOrderState } from "./order";
import { selectUser as selectUserState } from "./user";
import type { RootState } from "../store";

function makeState(overrides?: Partial<RootState>): RootState {
  return {
    user: {
      token: "token",
      companyId: "company-1",
      isAdmin: true,
      username: "Lina",
      ...(overrides?.user || {}),
    },
    order: {
      area_Id: "area-1",
      customer_Id: "customer-1",
      customer_name: "Alice",
      phone: "70123456",
      product_id: "product-1",
      product_name: "Water",
      product_price: 10,
      ...(overrides?.order || {}),
    },
    shipment: {
      _id: "shipment-1",
      dayId: "day-1",
      year: 2026,
      month: 3,
      day: 13,
      exchangeRateLBP: 89000,
      target: 20,
      delivered: 12,
      returned: 2,
      dollarPayments: 30,
      liraPayments: 1500000,
      expensesInLiras: 100000,
      profitsInLiras: 50000,
      expensesInUSD: 5,
      profitsInUSD: 3,
      CustomersWithFilledOrders: ["customer-1"],
      CustomersWithEmptyOrders: [],
      CustomersWithPendingOrders: ["customer-2"],
      payments: 0,
      round: {
        sequence: 2,
        targetAdded: 10,
        baseDelivered: 8,
        baseReturned: 1,
        baseUsd: 20,
        baseLbp: 1000000,
        baseExpUsd: 1,
        baseExpLbp: 10000,
        baseProfUsd: 0,
        baseProfLbp: 5000,
        startedAt: null,
      },
      ...(overrides?.shipment || {}),
    },
    default: {
      default_product: "",
      default_language: "ar",
      ...(overrides?.default || {}),
    },
    trxApi: {
      queries: {},
      mutations: {},
      provided: {},
      subscriptions: {},
      config: {
        online: true,
        focused: true,
        middlewareRegistered: true,
        refetchOnFocus: false,
        refetchOnReconnect: false,
        refetchOnMountOrArgChange: false,
        keepUnusedDataFor: 60,
        reducerPath: "trxApi",
        invalidationBehavior: "delayed",
      },
    },
  } as RootState;
}

describe("memoized redux selectors", () => {
  test("selectUser returns a stable reference", () => {
    const state = makeState();
    const first = selectUserState(state);
    const second = selectUserState(state);

    expect(first).toEqual({
      token: "token",
      companyId: "company-1",
      isAdmin: true,
      username: "Lina",
    });
    expect(second).toBe(first);
  });

  test("selectOrder returns a stable reference", () => {
    const state = makeState();
    const first = selectOrderState(state);
    const second = selectOrderState(state);

    expect(first.productPrice).toBe(10);
    expect(first.customerName).toBe("Alice");
    expect(second).toBe(first);
  });

  test("selectTodayProgress derives totals and memoizes", () => {
    const state = makeState();
    const first = selectTodayProgress(state);
    const second = selectTodayProgress(state);

    expect(first).toEqual({
      target: 20,
      delivered: 12,
      returned: 2,
      paidUSD: 30,
      paidLBP: 1500000,
      expUSD: 5,
      expLBP: 100000,
      profUSD: 3,
      profLBP: 50000,
    });
    expect(second).toBe(first);
  });

  test("shipment meta and live totals selectors return stable boundary objects", () => {
    const state = makeState();

    const metaFirst = selectShipmentMeta(state);
    const metaSecond = selectShipmentMeta(state);
    const totalsFirst = selectShipmentLiveTotals(state);
    const totalsSecond = selectShipmentLiveTotals(state);

    expect(metaFirst).toEqual({ id: "shipment-1", dayId: "day-1" });
    expect(metaSecond).toBe(metaFirst);
    expect(totalsFirst.delivered).toBe(12);
    expect(totalsFirst.liraPayments).toBe(1500000);
    expect(totalsSecond).toBe(totalsFirst);
  });

  test("selectRoundProgress computes round-only deltas", () => {
    const state = makeState();

    expect(selectRoundProgress(state)).toEqual({
      sequence: 2,
      targetRound: 10,
      deliveredThisRound: 4,
      returnedThisRound: 1,
      usdThisRound: 10,
      lbpThisRound: 500000,
      expUsdThisRound: 4,
      expLbpThisRound: 90000,
      profUsdThisRound: 3,
      profLbpThisRound: 45000,
      remainingRound: 6,
    });
  });

  test("customer list selectors reuse the same empty array fallback", () => {
    const state = makeState({
      shipment: {
        ...makeState().shipment,
        CustomersWithFilledOrders: undefined as unknown as string[],
      },
    });

    const first = selectCustomersWithFilledOrders(state);
    const second = selectCustomersWithFilledOrders(state);

    expect(first).toEqual([]);
    expect(second).toBe(first);
  });
});
