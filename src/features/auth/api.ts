import { rtkResult, type ApiResult } from "../api/rtkTransport";

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<ApiResult<Record<string, any>>> {
  return rtkResult<Record<string, any>>("/api/auth/login", {
    method: "POST",
    jsonBody: payload,
    credentials: "include",
    fallbackMessage: "بيانات الدخول غير صحيحة",
  });
}

export async function registerUser(
  token: string,
  payload: Record<string, unknown>
): Promise<ApiResult<Record<string, any>>> {
  return rtkResult<Record<string, any>>("/api/auth/register", {
    token,
    method: "POST",
    jsonBody: payload,
    fallbackMessage: "Registration failed",
  });
}
