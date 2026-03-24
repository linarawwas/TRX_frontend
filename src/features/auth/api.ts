import { apiClient } from "../../api/client";

type AuthApiResponse<T> = {
  ok: boolean;
  status: number;
  data: T;
};

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthApiResponse<Record<string, any>>> {
  const response = await apiClient.post<Record<string, any>>(
    "/api/auth/login",
    payload,
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
      validateStatus: () => true,
    }
  );
  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    data: response.data ?? {},
  };
}

export async function registerUser(
  token: string,
  payload: Record<string, unknown>
): Promise<AuthApiResponse<Record<string, any>>> {
  const response = await apiClient.post<Record<string, any>>(
    "/api/auth/register",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    }
  );
  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    data: response.data ?? {},
  };
}
