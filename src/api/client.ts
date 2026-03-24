import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_BASE } from "../config/api";

export type ApiClientError = Error & {
  isApiClientError: true;
  status?: number;
  code?: string;
  data?: unknown;
};

function toApiClientError(
  error: unknown,
  fallbackMessage = "Request failed"
): ApiClientError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;
    const responseData = axiosError.response?.data;
    const message =
      (typeof responseData === "object" &&
      responseData &&
      "message" in responseData &&
      typeof (responseData as { message?: unknown }).message === "string"
        ? (responseData as { message: string }).message
        : undefined) ||
      axiosError.message ||
      fallbackMessage;

    const normalized = new Error(message) as ApiClientError;
    normalized.isApiClientError = true;
    normalized.status = axiosError.response?.status;
    normalized.code = axiosError.code;
    normalized.data = responseData;
    return normalized;
  }

  const normalized = new Error(fallbackMessage) as ApiClientError;
  normalized.isApiClientError = true;
  return normalized;
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => Promise.reject(toApiClientError(error))
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw toApiClientError(error);
  }
}

export { toApiClientError };
