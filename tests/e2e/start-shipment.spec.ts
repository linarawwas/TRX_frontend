import { expect, test } from "@playwright/test";
import { installFastTimeouts, openApp, seedAuthState } from "./support/app";
import { apiPath, mockApiJson, readRequestJson } from "./support/network";

test("starts a new day shipment, preloads offline data, and lands on areas", async ({
  page,
}) => {
  let createdShipmentBody: Record<string, unknown> | null = null;

  await installFastTimeouts(page);
  await seedAuthState(page, {
    isAdmin: false,
    username: "موظف الشحنة",
  });

  await mockApiJson(
    page,
    apiPath("/api/users/me"),
    { companyId: "company-1", isAdmin: false, name: "موظف الشحنة" },
    "GET"
  );
  await mockApiJson(
    page,
    /.*\/api\/days\/name\/.*/,
    [{ _id: "day-1", name: "Saturday" }],
    "GET"
  );
  await mockApiJson(
    page,
    apiPath("/api/shipments"),
    async (route, request) => {
      createdShipmentBody = await readRequestJson<Record<string, unknown>>(request);
      return {
        shipment: {
          _id: "shipment-1",
          dayId: "day-1",
          carryingForDelivery: 5,
          date: { day: 7, month: 3, year: 2026 },
        },
        round: { sequence: 1 },
      };
    },
    "POST"
  );
  await mockApiJson(
    page,
    apiPath("/api/shipments/preload/day-1"),
    {
      day: { name: "Saturday" },
      product: { id: 7, type: "Gas", priceInDollars: 10 },
      exchangeRate: { exchangeRateInLBP: 90000 },
      areas: [
        {
          _id: "area-1",
          name: "الحمرا",
          customers: [
            {
              _id: "customer-1",
              name: "زبون الحمرا",
              phone: "0000",
              address: "الشارع الرئيسي",
              invoiceSums: {
                deliveredSum: 4,
                returnedSum: 1,
                totalSum: 30,
                lastRateLBP: 90000,
              },
              discount: {
                hasDiscount: false,
                valueAfterDiscount: 10,
                discountCurrency: "USD",
                noteAboutCustomer: "",
              },
            },
          ],
        },
      ],
    },
    "GET"
  );

  await openApp(page, "/newShipment");

  await expect(
    page.getByText("إنهاء الشحنة السابقة وبدء شحنة اليوم")
  ).toBeVisible();

  await page
    .getByTestId("model-field-carryingForDelivery")
    .locator(".digit-scroll-wrapper")
    .nth(2)
    .getByRole("button", { name: "5" })
    .click();
  await page.getByRole("button", { name: "بدء الشحنة" }).click();
  await page.getByTestId("model-confirm-submit").click();

  await expect(page).toHaveURL(/\/areas\/day-1$/);
  await expect(page.getByText("الحمرا")).toBeVisible();
  await expect(createdShipmentBody).toMatchObject({
    dayId: "day-1",
    carryingForDelivery: 5,
    type: 1,
  });
});
