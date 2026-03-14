import { expect, test } from "@playwright/test";
import { installFastTimeouts, openApp, seedAuthState } from "./support/app";
import { apiPath, mockApiJson } from "./support/network";

test("renders the orders-today report from mocked RTK Query data", async ({ page }) => {
  await installFastTimeouts(page);
  await seedAuthState(page, {
    isAdmin: true,
    username: "مشرف التقارير",
  });

  await mockApiJson(
    page,
    apiPath("/api/users/me"),
    { companyId: "company-1", isAdmin: true, name: "مشرف التقارير" },
    "GET"
  );
  await mockApiJson(
    page,
    /.*\/api\/shipments\/orders\/by-date.*/,
    {
      date: { year: 2026, month: 3, day: 7 },
      shipments: [
        {
          _id: "shipment-1",
          orders: [
            {
              _id: "order-1",
              customerid: "customer-1",
              customerObjId: "customer-1",
              customerName: "شركة النور",
              delivered: 3,
              returned: 1,
              sumUSD: 24,
              sumLBP: 0,
              type: 2,
              createdAt: "2026-03-07T07:00:00.000Z",
            },
            {
              _id: "order-2",
              customerid: "customer-2",
              customerObjId: "customer-2",
              customerName: "محل الساحة",
              delivered: 2,
              returned: 0,
              sumUSD: 18,
              type: 3,
              createdAt: "2026-03-07T08:30:00.000Z",
            },
          ],
        },
      ],
    },
    "GET"
  );

  await openApp(page, "/reports/orders-today");

  await expect(page.getByText("🧾 الطلبات حسب التاريخ")).toBeVisible();
  await page.locator("details.ooty-section").first().evaluate((node) => {
    (node as HTMLDetailsElement).open = true;
  });
  await page.locator("details.ooty-section").nth(1).evaluate((node) => {
    (node as HTMLDetailsElement).open = true;
  });
  await expect(page.locator("main")).toContainText("شركة النور");
  await expect(page.locator("main")).toContainText("محل الساحة");
  await expect(page.getByText("عدد الطلبات:")).toBeVisible();
  await expect(
    page.locator(".ooty__stat").filter({ hasText: "عدد الطلبات:" }).getByText("2", {
      exact: true,
    })
  ).toBeVisible();
});
