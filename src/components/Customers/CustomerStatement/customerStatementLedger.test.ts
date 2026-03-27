import {
  buildSelectableOrderOptions,
  buildStatementLedger,
  computePaidUsdForOrder,
  fmtUSD,
} from "./customerStatementLedger";
import type { LedgerOrderInput } from "./customerStatementLedger";

describe("customerStatementLedger", () => {
  test("computePaidUsdForOrder sums USD and converts LBP with rate", () => {
    const o: LedgerOrderInput = {
      _id: "1",
      timestamp: "2024-01-01T00:00:00.000Z",
      checkout: 100,
      payments: [
        { amount: 10, currency: "USD" },
        { amount: 150000, currency: "LBP", rateAtPaymentLBP: 150000 },
      ],
    };
    expect(computePaidUsdForOrder(o)).toBeCloseTo(11, 5);
  });

  test("computePaidUsdForOrder falls back to paid when payments yield zero", () => {
    const o: LedgerOrderInput = {
      _id: "1",
      timestamp: "2024-01-01T00:00:00.000Z",
      checkout: 50,
      payments: [],
      paid: 20,
    };
    expect(computePaidUsdForOrder(o)).toBe(20);
  });

  test("buildStatementLedger orders rows by timestamp and aggregates meta", () => {
    const orders: LedgerOrderInput[] = [
      {
        _id: "b",
        timestamp: "2024-02-01T00:00:00.000Z",
        delivered: 2,
        returned: 1,
        checkout: 10,
        payments: [{ amount: 10, currency: "USD" }],
      },
      {
        _id: "a",
        timestamp: "2024-01-01T00:00:00.000Z",
        delivered: 3,
        returned: 0,
        checkout: 20,
        payments: [],
        paid: 5,
      },
    ];
    const opening = {
      bottlesLeft: 1,
      balanceUSD: 2,
      at: null,
      orderId: null,
    };
    const ledger = buildStatementLedger(orders, opening);
    expect(ledger.rows.map((r) => r.orderId)).toEqual(["a", "b"]);
    expect(ledger.meta.openingBottles).toBe(1);
    expect(ledger.meta.ordersBottles).toBe(4);
    expect(ledger.meta.statementBottlesLeft).toBe(5);
    expect(ledger.totals.total).toBe(30);
  });

  test("buildSelectableOrderOptions sorts by remaining descending", () => {
    const orders: LedgerOrderInput[] = [
      {
        _id: "x",
        timestamp: "2024-01-01T00:00:00.000Z",
        checkout: 10,
        payments: [{ amount: 10, currency: "USD" }],
      },
      {
        _id: "y",
        timestamp: "2024-01-02T00:00:00.000Z",
        checkout: 20,
        payments: [],
        paid: 5,
      },
    ];
    const opts = buildSelectableOrderOptions(orders);
    expect(opts[0].id).toBe("y");
    expect(opts[1].remaining).toBe(0);
  });

  test("fmtUSD formats zero", () => {
    expect(fmtUSD(0)).toMatch(/0\.00/);
  });
});
