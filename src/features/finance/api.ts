import { runUnifiedRequest } from "../api/rtkRequest";

export async function fetchCompanyExchangeRate(
  token: string
): Promise<{ exchangeRateInLBP?: number } | null> {
  const response = await runUnifiedRequest<{ exchangeRateInLBP?: number }>(
    {
      url: "/api/exchange-rate",
      token,
    },
    "Failed to fetch exchange rate"
  );
  return response ?? null;
}
