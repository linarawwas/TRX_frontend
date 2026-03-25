import { store } from "../../redux/store";
import { trxApi, UnifiedApiRequestArg } from "./trxApi";

type ApiErrorShape = {
  status?: number;
  data?: unknown;
  error?: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const errObj = error as ApiErrorShape;
    if (typeof errObj.error === "string" && errObj.error.trim()) {
      return errObj.error;
    }
    if (errObj.data && typeof errObj.data === "object") {
      const data = errObj.data as { error?: unknown; message?: unknown };
      if (typeof data.error === "string" && data.error.trim()) return data.error;
      if (typeof data.message === "string" && data.message.trim()) return data.message;
    }
  }
  return fallback;
}

export class UnifiedRequestError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status = 0, body: unknown = null) {
    super(message);
    this.name = "UnifiedRequestError";
    this.status = status;
    this.body = body;
  }
}

export async function runUnifiedRequest<T>(
  arg: UnifiedApiRequestArg,
  fallbackMessage = "Request failed"
): Promise<T> {
  const promise = store.dispatch(
    trxApi.endpoints.unifiedApiRequest.initiate(arg)
  );
  try {
    return (await promise.unwrap()) as T;
  } catch (error) {
    const message = getErrorMessage(error, fallbackMessage);
    const shaped = error as ApiErrorShape;
    throw new UnifiedRequestError(message, Number(shaped?.status || 0), shaped?.data);
  } finally {
    promise.reset();
  }
}
