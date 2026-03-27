import reducer, { initialState } from "./reducer";
import {
  addCustomerWithEmptyOrder,
  addCustomerWithFilledOrder,
  addPendingOrder,
  clearRoundInfo,
  clearShipmentInfo,
  removePendingOrder,
  setDateDay,
  setDateMonth,
  setDateYear,
  setDayId,
  setExchangeRateLBP,
  setRoundInfo,
  setShipmentDelivered,
  setShipmentExpensesInLiras,
  setShipmentExpensesInUSD,
  setShipmentId,
  setShipmentPayments,
  setShipmentPaymentsInDollars,
  setShipmentPaymentsInLiras,
  setShipmentProfitsInLiras,
  setShipmentProfitsInUSD,
  setShipmentReturned,
  setShipmentTarget,
} from "./action";

describe("shipment reducer", () => {
  test("stores compatibility payments without any casts", () => {
    const next = reducer(initialState, setShipmentPayments(150));
    expect(next.payments).toBe(150);
  });

  test("updates shipment identity, date, and exchange-rate metadata", () => {
    let next = reducer(initialState, setShipmentId("shipment-1"));
    next = reducer(next, setDayId("day-1"));
    next = reducer(next, setDateYear(2026));
    next = reducer(next, setDateMonth(3));
    next = reducer(next, setDateDay(14));
    next = reducer(next, setExchangeRateLBP(89500));
    next = reducer(next, setShipmentTarget(24));

    expect(next._id).toBe("shipment-1");
    expect(next.dayId).toBe("day-1");
    expect(next.year).toBe(2026);
    expect(next.month).toBe(3);
    expect(next.day).toBe(14);
    expect(next.exchangeRateLBP).toBe(89500);
    expect(next.target).toBe(24);
  });

  test("sets totals across delivery, payments, profits, and expenses", () => {
    let next = reducer(initialState, setShipmentDelivered(12));
    next = reducer(next, setShipmentReturned(2));
    next = reducer(next, setShipmentPaymentsInDollars(30));
    next = reducer(next, setShipmentPaymentsInLiras(1500000));
    next = reducer(next, setShipmentExpensesInUSD(5));
    next = reducer(next, setShipmentExpensesInLiras(100000));
    next = reducer(next, setShipmentProfitsInUSD(3));
    next = reducer(next, setShipmentProfitsInLiras(50000));

    expect(next.delivered).toBe(12);
    expect(next.returned).toBe(2);
    expect(next.dollarPayments).toBe(30);
    expect(next.liraPayments).toBe(1500000);
    expect(next.expensesInUSD).toBe(5);
    expect(next.expensesInLiras).toBe(100000);
    expect(next.profitsInUSD).toBe(3);
    expect(next.profitsInLiras).toBe(50000);
  });

  test("normalizes customer ids to strings", () => {
    const filled = reducer(initialState, addCustomerWithFilledOrder(123));
    const empty = reducer(initialState, addCustomerWithEmptyOrder(456));

    expect(filled.CustomersWithFilledOrders).toEqual(["123"]);
    expect(empty.CustomersWithEmptyOrders).toEqual(["456"]);
  });

  test("deduplicates pending orders and removes them by id", () => {
    const withPending = reducer(
      reducer(initialState, addPendingOrder("customer-1")),
      addPendingOrder("customer-1")
    );

    expect(withPending.CustomersWithPendingOrders).toEqual(["customer-1"]);

    const cleared = reducer(withPending, removePendingOrder("customer-1"));
    expect(cleared.CustomersWithPendingOrders).toEqual([]);
  });

  test("stores round setup explicitly and clears it by snapshotting current totals", () => {
    const withRound = reducer(
      initialState,
      setRoundInfo({
        sequence: 2,
        targetAdded: 10,
        startedAt: "2026-03-14T08:00:00.000Z",
      })
    );

    expect(withRound.round.sequence).toBe(2);
    expect(withRound.round.targetAdded).toBe(10);
    expect(withRound.round.startedAt).toBe("2026-03-14T08:00:00.000Z");

    const state = {
      ...withRound,
      delivered: 10,
      returned: 3,
      dollarPayments: 40,
      liraPayments: 900000,
      expensesInUSD: 4,
      expensesInLiras: 50000,
      profitsInUSD: 2,
      profitsInLiras: 10000,
    };

    const next = reducer(state, clearRoundInfo());

    expect(next.round).toEqual({
      sequence: null,
      targetAdded: 0,
      baseDelivered: 10,
      baseReturned: 3,
      baseUsd: 40,
      baseLbp: 900000,
      baseExpUsd: 4,
      baseExpLbp: 50000,
      baseProfUsd: 2,
      baseProfLbp: 10000,
      startedAt: null,
    });
  });

  test("clearRoundInfo snapshots the current shipment state into round base values", () => {
    const state = {
      ...initialState,
      delivered: 10,
      returned: 3,
      dollarPayments: 40,
      liraPayments: 900000,
      expensesInUSD: 4,
      expensesInLiras: 50000,
      profitsInUSD: 2,
      profitsInLiras: 10000,
    };

    const next = reducer(state, clearRoundInfo());

    expect(next.round).toEqual({
      sequence: null,
      targetAdded: 0,
      baseDelivered: 10,
      baseReturned: 3,
      baseUsd: 40,
      baseLbp: 900000,
      baseExpUsd: 4,
      baseExpLbp: 50000,
      baseProfUsd: 2,
      baseProfLbp: 10000,
      startedAt: null,
    });
  });

  test("clearShipmentInfo preserves previous snapshot and resets live shipment state", () => {
    const populated = {
      ...initialState,
      _id: "shipment-1",
      dayId: "day-1",
      year: 2026,
      month: 3,
      day: 13,
      target: 20,
      delivered: 12,
      returned: 2,
      dollarPayments: 30,
      liraPayments: 1500000,
      expensesInUSD: 5,
      expensesInLiras: 100000,
      profitsInUSD: 3,
      profitsInLiras: 50000,
      CustomersWithFilledOrders: ["c1"],
      CustomersWithEmptyOrders: ["c2"],
      CustomersWithPendingOrders: ["c3"],
      payments: 99,
    };

    const next = reducer(populated, clearShipmentInfo());

    expect(next._id).toBe("");
    expect(next.dayId).toBe("");
    expect(next.delivered).toBe(0);
    expect(next.returned).toBe(0);
    expect(next.dollarPayments).toBe(0);
    expect(next.liraPayments).toBe(0);
    expect(next.CustomersWithFilledOrders).toEqual([]);
    expect(next.CustomersWithEmptyOrders).toEqual([]);
    expect(next.CustomersWithPendingOrders).toEqual([]);
    expect(next.payments).toBe(0);
  });
});
