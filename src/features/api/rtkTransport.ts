import { store } from "../../redux/store";
import { trxApi, type TransportRequest, type TransportResponse } from "./trxApi";

type RequestHeaders = Record<string, string>;

type TransportOptions = Omit<TransportRequest, "url" | "headers" | "body"> & {
  token?: string | null;
  headers?: RequestHeaders;
  jsonBody?: unknown;
  body?: unknown;
  fallbackMessage?: string;
};

export type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

export class TransportError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "TransportError";
    this.status = status;
    this.body = body;
  }
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

function withAuthHeaders(
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

export async function rtkEnvelope(
  path: string,
  {
    token,
    method = "GET",
    headers,
    jsonBody,
    body,
    ...rest
  }: TransportOptions = {}
): Promise<TransportResponse> {
  const action = await store.dispatch(
    trxApi.endpoints.transport.initiate({
      url: path,
      method,
      headers:
        jsonBody === undefined
          ? withAuthHeaders(token, headers, false)
          : withAuthHeaders(token, headers, true),
      body: jsonBody === undefined ? body : jsonBody,
      ...rest,
    })
  );

  const response = (action as { data?: TransportResponse }).data;
  if (!response) {
    return {
      ok: false,
      status: 500,
      statusText: "Unexpected transport state",
      data: null,
    };
  }
  return response;
}

export async function rtkJson<T>(
  path: string,
  {
    fallbackMessage = "Request failed",
    ...options
  }: TransportOptions = {}
): Promise<T> {
  const response = await rtkEnvelope(path, options);
  if (!response.ok) {
    throw new TransportError(
      getErrorMessage(response.data, fallbackMessage),
      response.status ?? 0,
      response.data
    );
  }
  return response.data as T;
}

export async function rtkVoid(
  path: string,
  options: TransportOptions = {}
): Promise<void> {
  await rtkJson<unknown>(path, options);
}

export async function rtkResult<T>(
  path: string,
  options: TransportOptions = {}
): Promise<ApiResult<T>> {
  try {
    const data = await rtkJson<T>(path, options);
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}
