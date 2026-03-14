import { expect, test } from "@playwright/test";
import { openApp, seedAuthState } from "./support/app";
import { readPendingRequests, seedIndexedDb } from "./support/idb";
import { apiPath, mockApiJson, readRequestJson } from "./support/network";

test("queues an offline order and replays it once the browser is online again", async ({
  page,
}) => {
  const replayedBodies: Array<Record<string, unknown> | null> = [];

  await seedAuthState(page, {
    isAdmin: false,
    username: "مندوب دون اتصال",
    state: {
      order: {
        customer_Id: "customer-1",
        customer_name: "زبون دون اتصال",
        phone: "",
        product_id: "product-1",
        product_name: "مياه",
        product_price: 10,
      },
      shipment: {
        _id: "shipment-1",
        dayId: "day-1",
        target: 10,
        exchangeRateLBP: 90000,
        round: {
          sequence: 1,
          targetAdded: 10,
          baseDelivered: 0,
          baseReturned: 0,
          baseUsd: 0,
          baseLbp: 0,
          baseExpUsd: 0,
          baseExpLbp: 0,
          baseProfUsd: 0,
          baseProfLbp: 0,
          startedAt: "2026-03-07T08:00:00.000Z",
        },
      },
    },
  });

  await mockApiJson(
    page,
    apiPath("/api/users/me"),
    { companyId: "company-1", isAdmin: false, name: "مندوب دون اتصال" },
    "GET"
  );
  await mockApiJson(
    page,
    apiPath("/api/orders"),
    async (_route, request) => {
      replayedBodies.push(await readRequestJson<Record<string, unknown>>(request));
      return { ok: true, orderId: "order-synced-1" };
    },
    "POST"
  );

  await openApp(page, "/");
  await seedIndexedDb(page, {
    invoices: [
      {
        customerId: "customer-1",
        invoice: {
          deliveredSum: 4,
          returnedSum: 1,
          totalSum: 30,
          lastRateLBP: 90000,
        },
      },
    ],
    products: [
      {
        companyId: "company-1",
        productType: { id: 1, type: "مياه", priceInDollars: 10 },
      },
    ],
    exchangeRates: [{ companyKey: "company-1", exchangeRateInLBP: 90000 }],
  });

  await page.goto("/recordOrderforCustomer");
  await page.waitForLoadState("domcontentloaded");

  await page.evaluate(() => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    window.dispatchEvent(new Event("offline"));
  });
  await page
    .getByTestId("record-order-delivered")
    .getByRole("button", { name: "إضافة المسلّمة" })
    .click();
  await page.getByTestId("record-order-submit").click();

  await page.waitForURL(/\/$/, { timeout: 5000 });
  await expect.poll(async () => (await readPendingRequests(page)).length).toBe(1);

  const queuedRequests = await readPendingRequests(page);
  expect(queuedRequests[0]?.url).toContain("/api/orders");

  await page.evaluate(() => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      get: () => true,
    });
    window.dispatchEvent(new Event("online"));
  });

  await expect
    .poll(async () => (await readPendingRequests(page)).length, {
      timeout: 15000,
    })
    .toBe(0);
  expect(replayedBodies[0]).toMatchObject({
    customerid: "customer-1",
    shipmentId: "shipment-1",
    delivered: 1,
  });
});
