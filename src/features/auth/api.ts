import { rtkEnvelope } from "../api/rtkTransport";

type AuthApiResponse<T> = {
  ok: boolean;
  status: number;
  data: T;
};

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthApiResponse<Record<string, any>>> {
  const response = await rtkEnvelope("/api/auth/login", {
    method: "POST",
    jsonBody: payload,
    credentials: "include",
  });
  return {
    ok: response.ok,
    status: response.status,
    data: (response.data ?? {}) as Record<string, any>,
  };
}

export async function registerUser(
  token: string,
  payload: Record<string, unknown>
): Promise<AuthApiResponse<Record<string, any>>> {
  const response = await rtkEnvelope("/api/auth/register", {
    token,
    method: "POST",
    jsonBody: payload,
  });
  return {
    ok: response.ok,
    status: response.status,
    data: (response.data ?? {}) as Record<string, any>,
  };
}
