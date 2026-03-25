import type { AxiosRequestConfig } from "axios";
import { API_BASE } from "../../config/api";
import { apiClient } from "../../api/client";

type RequestHeaders = Record<string, string>;

export class ApiRequestError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
  }
}

type ApiRequestOptions = Omit<RequestInit, "headers" | "body"> & {
  token?: string | null;
  headers?: RequestHeaders;
  jsonBody?: unknown;
  fallbackMessage?: string;
};

function buildHeaders(
  token?: string | null,
  headers: RequestHeaders = {},
  includeJsonContentType = false
): RequestHeaders {
  return {
    ...(includeJsonContentType ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

function getErrorMessage(body: unknown, fallbackMessage: string): string {
  if (body && typeof body === "object") {
    const candidate =
      (body as { error?: unknown }).error ??
      (body as { message?: unknown }).message;
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  if (typeof body === "string" && body.trim()) {
    return body;
  }

  return fallbackMessage;
}

export function authHeaders(
  token?: string | null,
  headers?: RequestHeaders
): RequestHeaders {
  return buildHeaders(token, headers, false);
}

export function jsonHeaders(
  token?: string | null,
  headers?: RequestHeaders
): RequestHeaders {
  return buildHeaders(token, headers, true);
}

export function authAxiosConfig(
  token?: string | null,
  config: AxiosRequestConfig = {}
): AxiosRequestConfig {
  return {
    baseURL: API_BASE,
    ...config,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(config.headers ?? {}),
    },
  };
}

export function jsonAxiosConfig(
  token?: string | null,
  config: AxiosRequestConfig = {}
): AxiosRequestConfig {
  return authAxiosConfig(token, {
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...(config.headers ?? {}),
    },
  });
}

export async function requestJson<T>(
  path: string,
  {
    token,
    headers,
    jsonBody,
    fallbackMessage = "Request failed",
    method = "GET",
    ...init
  }: ApiRequestOptions = {}
): Promise<T> {
  const response = await apiClient.request<unknown>({
    url: path,
    method,
    headers:
      jsonBody === undefined
        ? authHeaders(token, headers)
        : jsonHeaders(token, headers),
    data: jsonBody === undefined ? undefined : jsonBody,
    withCredentials: init.credentials === "include",
    signal: (init as { signal?: AbortSignal }).signal,
    validateStatus: () => true,
  });

  const body = response.data;
  if (response.status < 200 || response.status >= 300) {
    throw new ApiRequestError(
      getErrorMessage(body, fallbackMessage),
      response.status ?? 0,
      body
    );
  }

  return body as T;
}

export async function requestVoid(
  path: string,
  options: ApiRequestOptions = {}
): Promise<void> {
  await requestJson<unknown>(path, options);
}
