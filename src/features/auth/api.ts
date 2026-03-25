import { runUnifiedRequest, UnifiedRequestError } from "../api/rtkRequest";

type AuthApiResponse<T> = {
  ok: boolean;
  status: number;
  data: T;
};

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthApiResponse<Record<string, any>>> {
  try {
    const data = await runUnifiedRequest<Record<string, any>>(
      {
        url: "/api/auth/login",
        method: "POST",
        body: payload,
      },
      "Login failed"
    );
    return { ok: true, status: 200, data: data ?? {} };
  } catch (error) {
    if (error instanceof UnifiedRequestError) {
      return {
        ok: false,
        status: error.status || 0,
        data: (error.body as Record<string, any>) ?? {},
      };
    }
    return { ok: false, status: 0, data: {} };
  }
}

export async function registerUser(
  token: string,
  payload: Record<string, unknown>
): Promise<AuthApiResponse<Record<string, any>>> {
  try {
    const data = await runUnifiedRequest<Record<string, any>>(
      {
        url: "/api/auth/register",
        method: "POST",
        token,
        body: payload,
      },
      "Registration failed"
    );
    return { ok: true, status: 200, data: data ?? {} };
  } catch (error) {
    if (error instanceof UnifiedRequestError) {
      return {
        ok: false,
        status: error.status || 0,
        data: (error.body as Record<string, any>) ?? {},
      };
    }
    return { ok: false, status: 0, data: {} };
  }
}
