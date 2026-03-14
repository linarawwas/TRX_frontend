import { expect, test, type Page } from "@playwright/test";
import { installFastTimeouts, openApp, seedAuthState } from "./support/app";
import { apiPath, mockApiJson } from "./support/network";

async function mockAdminHomeApis(page: Page) {
  await mockApiJson(
    page,
    apiPath("/api/shipments/range"),
    {
      shipments: [
        {
          carryingForDelivery: 12,
          calculatedDelivered: 7,
          calculatedReturned: 1,
          shipmentLiraPayments: 4500000,
          shipmentUSDPayments: 90,
          shipmentLiraExtraProfits: 0,
          shipmentUSDExtraProfits: 10,
          shipmentLiraExpenses: 1000000,
          shipmentUSDExpenses: 5,
        },
      ],
    },
    "POST"
  );

  await mockApiJson(
    page,
    /.*\/api\/finances\/summary\/daily.*/,
    {
      shipments: { usd: 90, lbp: 4500000, normalizedUSD: 140 },
      finance: {
        income: { USD: 10, LBP: 0, normUSD: 10 },
        expense: { USD: 5, LBP: 1000000, normUSD: 16 },
      },
      net: { byCurrency: { USD: 95, LBP: 3500000 }, normalizedUSD: 134 },
    },
    "GET"
  );

  await mockApiJson(
    page,
    /.*\/api\/finances\/summary\/monthly.*/,
    [
      {
        d: 7,
        shipments: { usd: 90, lbp: 4500000, normUSD: 140 },
        income: { USD: 10, LBP: 0, normUSD: 10 },
        expense: { USD: 5, LBP: 1000000, normUSD: 16 },
        net: { normalizedUSD: 134 },
      },
    ],
    "GET"
  );

  await mockApiJson(
    page,
    apiPath("/api/finance-categories"),
    [
      { _id: "cat-income", name: "income_misc", kind: "income" },
      { _id: "cat-expense", name: "fuel", kind: "expense" },
    ],
    "GET"
  );
}

test("loads the employee shell from seeded auth state", async ({ page }) => {
  await installFastTimeouts(page);
  await seedAuthState(page, {
    isAdmin: false,
    username: "موظف الاختبار",
  });

  await mockApiJson(
    page,
    apiPath("/api/users/me"),
    { companyId: "company-1", isAdmin: false, name: "موظف الاختبار" },
    "GET"
  );

  await openApp(page, "/");

  await expect(page.getByText("مرحبا موظف الاختبار")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "بدء شحنة جديدة" })
  ).toBeVisible();
});

test("loads the admin shell and dashboard branch from seeded auth state", async ({
  page,
}) => {
  await installFastTimeouts(page);
  await seedAuthState(page, {
    isAdmin: true,
    username: "مدير الاختبار",
  });

  await mockApiJson(
    page,
    apiPath("/api/users/me"),
    { companyId: "company-1", isAdmin: true, name: "مدير الاختبار" },
    "GET"
  );
  await mockAdminHomeApis(page);

  await openApp(page, "/");

  await expect(page.getByText("المالية — نظرة شاملة")).toBeVisible();
  await expect(page.getByRole("button", { name: "عرض الشحنات" })).toBeVisible();
});
