import type { Page } from "@playwright/test";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? DeepPartial<T[K]>
    : T[K];
};

type AppState = {
  user: {
    token: string | null;
    companyId: string;
    isAdmin: boolean;
    username: string;
  };
  order: {
    area_Id: string | null;
    customer_Id: string | null;
    customer_name: string;
    phone: string;
    product_id: string | null;
    product_name: string;
    product_price: number;
  };
  shipment: {
    _id: string;
    dayId: string;
    year: number | null;
    exchangeRateLBP: number | null;
    month: number | null;
    day: number | null;
    target: number;
    prev_id: string;
    prev_dayId: string;
    prev_year: number | null;
    prev_month: number | null;
    prev_day: number | null;
    prev_target: number;
    delivered: number;
    prev_delivered: number;
    returned: number;
    prev_returned: number;
    dollarPayments: number;
    prev_dollarPayments: number;
    liraPayments: number;
    prev_liraPayments: number;
    expensesInLiras: number;
    profitsInLiras: number;
    expensesInUSD: number;
    profitsInUSD: number;
    prev_expensesInLiras: number;
    prev_profitsInLiras: number;
    prev_profitsInUSD: number;
    prev_expensesInUSD: number;
    CustomersWithFilledOrders: string[];
    CustomersWithEmptyOrders: string[];
    CustomersWithPendingOrders: string[];
    prev_CustomersWithFilledOrder: string[];
    prev_CustomersWithEmptyOrders: string[];
    prev_CustomersWithPendingOrders: string[];
    payments: number;
    round: {
      sequence: number | null;
      targetAdded: number;
      baseDelivered: number;
      baseReturned: number;
      baseUsd: number;
      baseLbp: number;
      baseExpUsd: number;
      baseExpLbp: number;
      baseProfUsd: number;
      baseProfLbp: number;
      startedAt: string | null;
    };
  };
  default: {
    default_product: string;
    default_language: string;
  };
};

export type SeedAuthOptions = {
  token?: string;
  companyId?: string;
  isAdmin?: boolean;
  username?: string;
  state?: DeepPartial<AppState>;
};

const baseState: AppState = {
  user: {
    token: null,
    companyId: "",
    isAdmin: false,
    username: "",
  },
  order: {
    area_Id: null,
    customer_Id: null,
    customer_name: "",
    phone: "",
    product_id: null,
    product_name: "",
    product_price: 0,
  },
  shipment: {
    _id: "",
    dayId: "",
    year: null,
    exchangeRateLBP: null,
    month: null,
    day: null,
    target: 0,
    prev_id: "",
    prev_dayId: "",
    prev_year: null,
    prev_month: null,
    prev_day: null,
    prev_target: 0,
    delivered: 0,
    prev_delivered: 0,
    returned: 0,
    prev_returned: 0,
    dollarPayments: 0,
    prev_dollarPayments: 0,
    liraPayments: 0,
    prev_liraPayments: 0,
    expensesInLiras: 0,
    profitsInLiras: 0,
    expensesInUSD: 0,
    profitsInUSD: 0,
    prev_expensesInLiras: 0,
    prev_profitsInLiras: 0,
    prev_profitsInUSD: 0,
    prev_expensesInUSD: 0,
    CustomersWithFilledOrders: [],
    CustomersWithEmptyOrders: [],
    CustomersWithPendingOrders: [],
    prev_CustomersWithFilledOrder: [],
    prev_CustomersWithEmptyOrders: [],
    prev_CustomersWithPendingOrders: [],
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
  },
  default: {
    default_product: "",
    default_language: "en",
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge<T>(target: T, source?: DeepPartial<T>): T {
  if (!source) return structuredClone(target);

  const output: Record<string, unknown> = Array.isArray(target)
    ? [...(target as unknown as unknown[])]
    : { ...(target as Record<string, unknown>) };

  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    const current = output[key];
    output[key] =
      isPlainObject(current) && isPlainObject(value)
        ? deepMerge(current, value)
        : Array.isArray(value)
          ? [...value]
          : value;
  }

  return output as T;
}

export function buildAppState(overrides?: DeepPartial<AppState>): AppState {
  return deepMerge(baseState, overrides);
}

export async function installFastTimeouts(page: Page, maxDelayMs = 25) {
  await page.addInitScript(({ maxDelay }) => {
    const originalSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
      originalSetTimeout(
        handler,
        typeof timeout === "number" && timeout >= 800 && timeout <= 15000
          ? Math.min(timeout, maxDelay)
          : timeout,
        ...args
      )) as typeof window.setTimeout;
  }, { maxDelay: maxDelayMs });
}

export async function seedAuthState(page: Page, options: SeedAuthOptions = {}) {
  const token = options.token ?? "e2e-token";
  const companyId = options.companyId ?? "company-1";
  const isAdmin = options.isAdmin ?? false;
  const username = options.username ?? (isAdmin ? "Admin E2E" : "Employee E2E");
  const state = buildAppState({
    ...options.state,
    user: {
      token,
      companyId,
      isAdmin,
      username,
      ...options.state?.user,
    },
  });

  await page.addInitScript(
    ({ seededState, seededAuth }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("reduxState", JSON.stringify(seededState));
      localStorage.setItem("token", seededAuth.token);
      localStorage.setItem("companyId", seededAuth.companyId);
      localStorage.setItem("isAdmin", JSON.stringify(seededAuth.isAdmin));
      localStorage.setItem("username", seededAuth.username);
    },
    {
      seededState: state,
      seededAuth: { token, companyId, isAdmin, username },
    }
  );
}

export async function openApp(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForLoadState("domcontentloaded");
}
