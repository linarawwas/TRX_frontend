import { expect, test } from "@playwright/test";

test("login uses /api/auth/login in production build and avoids SW POST cache error", async ({
  page,
}) => {
  let hitCorrectPath = false;
  let hitWrongDoubleApiPath = false;
  const consoleErrors: string[] = [];
  const context = page.context();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await context.route(/.*\/api\/api\/auth\/login$/, async (route) => {
    hitWrongDoubleApiPath = true;
    await route.fulfill({
      status: 404,
      contentType: "text/html",
      body: "<!doctype html><html><body>wrong path</body></html>",
    });
  });

  await context.route(/.*\/api\/auth\/login$/, async (route, request) => {
    if (request.method() === "POST") {
      hitCorrectPath = true;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "e2e-prod-token" }),
    });
  });

  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");

  await page.getByTestId("login-email").fill("user@example.com");
  await page.getByTestId("login-password").fill("123456");
  await page.getByTestId("login-submit").click();

  await expect.poll(() => hitCorrectPath).toBe(true);
  expect(hitWrongDoubleApiPath).toBe(false);

  await expect.poll(async () => {
    return page.evaluate(() => localStorage.getItem("token"));
  }).toBe("e2e-prod-token");

  const swPostCacheErrors = consoleErrors.filter((line) =>
    line.includes("Request method 'POST' is unsupported")
  );
  expect(swPostCacheErrors).toHaveLength(0);
});
