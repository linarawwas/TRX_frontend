import reducer, { initialState, shipmentSlice } from "./reducer";

const {
  setTotalPayments,
  addCustomerWithFilledOrder,
  addCustomerWithEmptyOrder,
  addPendingOrder,
  removePendingOrder,
  clearRoundInfo,
  clearAllShipmentInfo,
  setShipmentDelivered,
  setShipmentReturned,
  setShipmentPaymentsInDollars,
  setShipmentPaymentsInLiras,
  setShipmentExpensesInUSD,
  setShipmentExpensesInLiras,
  setShipmentProfitsInUSD,
  setShipmentProfitsInLiras,
  setShipmentId,
  setDayId,
  setShipmentTarget,
} = shipmentSlice.actions as any;

describe("shipment reducer", () => {
  test("stores total payments without any casts", () => {
    const next = reducer(initialState, setTotalPayments(150));
    expect(next.payments).toBe(150);
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

    const next = reducer(populated, clearAllShipmentInfo());

    expect(next.prev_id).toBe("shipment-1");
    expect(next.prev_dayId).toBe("day-1");
    expect(next.prev_target).toBe(20);
    expect(next.prev_delivered).toBe(12);
    expect(next.prev_returned).toBe(2);
    expect(next.prev_dollarPayments).toBe(30);
    expect(next.prev_liraPayments).toBe(1500000);
    expect(next.prev_expensesInUSD).toBe(5);
    expect(next.prev_expensesInLiras).toBe(100000);
    expect(next.prev_profitsInUSD).toBe(3);
    expect(next.prev_profitsInLiras).toBe(50000);

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

  test("setShipmentFromPrev restores previous snapshot values", () => {
    const state = {
      ...initialState,
      _id: "live",
      dayId: "live-day",
      target: 1,
      delivered: 1,
      returned: 1,
      dollarPayments: 1,
      liraPayments: 1,
      prev_id: "prev-shipment",
      prev_dayId: "prev-day",
      prev_year: 2025,
      prev_month: 12,
      prev_day: 30,
      prev_target: 25,
      prev_delivered: 20,
      prev_returned: 5,
      prev_dollarPayments: 100,
      prev_liraPayments: 2000000,
      prev_expensesInUSD: 4,
      prev_expensesInLiras: 50000,
      prev_profitsInUSD: 6,
      prev_profitsInLiras: 70000,
      prev_CustomersWithFilledOrder: ["old-filled"],
      prev_CustomersWithEmptyOrders: ["old-empty"],
    };

    const next = reducer(state, shipmentSlice.actions.setShipmentFromPrev());

    expect(next._id).toBe("prev-shipment");
    expect(next.dayId).toBe("prev-day");
    expect(next.target).toBe(25);
    expect(next.delivered).toBe(20);
    expect(next.returned).toBe(5);
    expect(next.dollarPayments).toBe(100);
    expect(next.liraPayments).toBe(2000000);
    expect(next.CustomersWithFilledOrders).toEqual(["old-filled"]);
    expect(next.CustomersWithEmptyOrders).toEqual(["old-empty"]);
  });
});
