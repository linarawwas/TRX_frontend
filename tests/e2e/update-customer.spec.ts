import { expect, test } from "@playwright/test";
import { installFastTimeouts, openApp, seedAuthState } from "./support/app";
import { apiPath, mockApiJson, readRequestJson } from "./support/network";

test("edits a customer and confirms the save flow", async ({ page }) => {
  let latestCustomer = {
    _id: "customer-1",
    name: "شركة الاختبار",
    phone: "70111222",
    address: "الطريق القديمة",
    isActive: true,
    sequence: 4,
    areaId: { _id: "area-1", name: "الحمرا" },
    distributorId: null,
  };
  let patchedBody: Record<string, unknown> | null = null;

  await installFastTimeouts(page);
  await seedAuthState(page, {
    isAdmin: true,
    username: "مشرف الزبائن",
    state: {
      shipment: {
        _id: "shipment-1",
      },
    },
  });

  await mockApiJson(
    page,
    apiPath("/api/users/me"),
    { companyId: "company-1", isAdmin: true, name: "مشرف الزبائن" },
    "GET"
  );
  await mockApiJson(
    page,
    apiPath("/api/areas/company"),
    [
      { _id: "area-1", name: "الحمرا" },
      { _id: "area-2", name: "الروشة" },
    ],
    "GET"
  );
  await mockApiJson(
    page,
    apiPath("/api/customers/customer-1"),
    async (_route, request) => {
      if (request.method() === "PATCH") {
        patchedBody = await readRequestJson<Record<string, unknown>>(request);
        latestCustomer = {
          ...latestCustomer,
          ...patchedBody,
        };
        return { success: true };
      }

      return latestCustomer;
    }
  );
  await mockApiJson(
    page,
    apiPath("/api/customers/reciept/customer-1"),
    {
      sums: {
        deliveredSum: 5,
        returnedSum: 1,
        totalSum: 40,
        lastRateLBP: 90000,
      },
    },
    "GET"
  );
  await mockApiJson(
    page,
    apiPath("/api/customers/area/area-1/active"),
    [
      { _id: "customer-9", name: "زبون مجاور", sequence: 1 },
      { _id: "customer-8", name: "متجر آخر", sequence: 2 },
    ],
    "GET"
  );

  await openApp(page, "/updateCustomer/customer-1");

  await expect(
    page.getByRole("heading", { name: "شركة الاختبار" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "حذف نهائي" })).toBeEnabled();

  await page.getByRole("button", { name: "تعديل معلومات الزبون" }).click();
  await page.getByLabel("الاسم").fill("شركة الاختبار المحدثة");
  await page.getByLabel("العنوان").fill("الطريق الجديدة");
  await page.getByRole("button", { name: "حفظ التعديلات" }).click();

  await expect(page.getByText("تأكيد تحديث الزبون")).toBeVisible();
  await expect(page.getByText("شركة الاختبار المحدثة")).toBeVisible();
  await page.getByRole("button", { name: "تأكيد الحفظ" }).click();

  await expect(page.getByText("تم التحديث بنجاح").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "شركة الاختبار المحدثة" })
  ).toBeVisible();
  expect(patchedBody).toMatchObject({
    name: "شركة الاختبار المحدثة",
    address: "الطريق الجديدة",
  });
});
