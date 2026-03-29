import type { RootState } from "../../../../redux/store";

/**
 * Minimal full RootState for Employee Home hook/integration tests.
 * Prefer overrides for user + shipment; other slices match store defaults enough for selectors.
 */
export function makeEmployeeHomeRootState(
  overrides?: Partial<RootState>
): RootState {
  return {
    user: {
      token: "token",
      companyId: "company-1",
      isAdmin: false,
      username: "Lina",
      ...(overrides?.user || {}),
    },
    order: {
      area_Id: null,
      customer_Id: null,
      customer_name: "",
      phone: "",
      product_id: null,
      product_name: "",
      product_price: 0,
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
      CustomersWithFilledOrders: [],
      CustomersWithEmptyOrders: [],
      CustomersWithPendingOrders: [],
      payments: 0,
      round: {
        sequence: null,
        targetAdded: 0,
        baseDelivered: 0,
        baseReturned: 0,
        baseUsd: 0,
        baseLbp: 0,
        baseExpUsd: 0,
        baseExpLbp: 0,
        baseProfUsd: 0,
        baseProfLbp: 0,
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
      ...(overrides?.trxApi || {}),
    },
  } as RootState;
}
