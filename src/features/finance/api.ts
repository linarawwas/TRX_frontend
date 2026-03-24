import { apiClient } from "../../api/client";

export async function fetchCompanyExchangeRate(
  token: string
): Promise<{ exchangeRateInLBP?: number } | null> {
  const response = await apiClient.get<{ exchangeRateInLBP?: number }>(
    "/api/exchange-rate",
    {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    }
  );
  return response.data ?? null;
}
