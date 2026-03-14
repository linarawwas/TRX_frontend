import type { Page, Request, Route } from "@playwright/test";

type MockBody = Record<string, unknown> | unknown[] | string | number | boolean | null;

type MockResponse =
  | MockBody
  | {
      body?: MockBody;
      status?: number;
      headers?: Record<string, string>;
    };

type ResponseFactory = (
  route: Route,
  request: Request
) => Promise<MockResponse> | MockResponse;

export function apiPath(pathname: string) {
  return `**${pathname}`;
}

export async function fulfillJson(
  route: Route,
  response: MockResponse,
  init?: { status?: number; headers?: Record<string, string> }
) {
  const normalized =
    response &&
    typeof response === "object" &&
    !Array.isArray(response) &&
    ("body" in response || "status" in response || "headers" in response)
      ? response
      : { body: response };

  await route.fulfill({
    status: normalized.status ?? init?.status ?? 200,
    contentType: "application/json",
    headers: {
      "access-control-allow-origin": "*",
      ...init?.headers,
      ...normalized.headers,
    },
    body: JSON.stringify(normalized.body ?? null),
  });
}

export async function mockApiJson(
  page: Page,
  url: string | RegExp,
  response: MockResponse | ResponseFactory,
  method?: string
) {
  await page.route(url, async (route, request) => {
    if (method && request.method() !== method.toUpperCase()) {
      await route.fallback();
      return;
    }

    const resolved =
      typeof response === "function" ? await response(route, request) : response;
    await fulfillJson(route, resolved);
  });
}

export async function readRequestJson<T>(request: Request): Promise<T | null> {
  const body = request.postData();
  if (!body) return null;

  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}
