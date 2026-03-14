import { expect, test } from "@playwright/test";
import { installFastTimeouts, openApp, seedAuthState } from "./support/app";
import { apiPath, mockApiJson, readRequestJson } from "./support/network";

test("creates a finance entry and refreshes the daily summary", async ({ page }) => {
  const createdPayloads: Array<Record<string, unknown> | null> = [];
  let dailySummaryCalls = 0;

  await installFastTimeouts(page);
  await seedAuthState(page, {
    isAdmin: true,
    username: "مدير المالية",
  });

  await mockApiJson(
    page,
    apiPath("/api/users/me"),
    { companyId: "company-1", isAdmin: true, name: "مدير المالية" },
    "GET"
  );
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
    () => {
      dailySummaryCalls += 1;
      return dailySummaryCalls === 1
        ? {
            shipments: { usd: 90, lbp: 4500000, normalizedUSD: 140 },
            finance: {
              income: { USD: 10, LBP: 0, normUSD: 10 },
              expense: { USD: 0, LBP: 0, normUSD: 0 },
            },
            net: { byCurrency: { USD: 100, LBP: 4500000 }, normalizedUSD: 150 },
          }
        : {
            shipments: { usd: 90, lbp: 4500000, normalizedUSD: 140 },
            finance: {
              income: { USD: 10, LBP: 0, normUSD: 10 },
              expense: { USD: 15, LBP: 0, normUSD: 15 },
            },
            net: { byCurrency: { USD: 85, LBP: 4500000 }, normalizedUSD: 135 },
          };
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
        expense: { USD: 15, LBP: 0, normUSD: 15 },
        net: { normalizedUSD: 135 },
      },
    ],
    "GET"
  );
  await mockApiJson(
    page,
    apiPath("/api/finance-categories"),
    [
      { _id: "cat-expense", name: "fuel", kind: "expense" },
      { _id: "cat-income", name: "income_misc", kind: "income" },
    ],
    "GET"
  );
  await mockApiJson(
    page,
    apiPath("/api/finances"),
    async (_route, request) => {
      createdPayloads.push(await readRequestJson<Record<string, unknown>>(request));
      return { _id: "finance-1" };
    },
    "POST"
  );

  await openApp(page, "/");

  await expect(page.getByText("المالية — نظرة شاملة")).toBeVisible();
  await page.getByRole("tab", { name: /إضافة عملية/ }).click();
  await page.getByLabel("الفئة").selectOption("cat-expense");
  await page.getByLabel("القيمة").fill("15");
  await page.getByLabel("طريقة الدفع").fill("نقدي");
  await page.getByRole("button", { name: "حفظ العملية" }).click();

  await expect(page.getByText("تم الحفظ بنجاح").first()).toBeVisible();
  await expect(
    page
      .locator(".finx-tile")
      .filter({ hasText: "مصروفات:" })
      .getByText("$15.00", { exact: true })
      .first()
  ).toBeVisible();
  expect(createdPayloads[0]).toMatchObject({
    kind: "expense",
    categoryId: "cat-expense",
    payments: [{ amount: 15, currency: "USD", paymentMethod: "نقدي" }],
  });
});
