import { rtkEnvelope } from "../api/rtkTransport";

export async function fetchCompanyExchangeRate(
  token: string
): Promise<{ exchangeRateInLBP?: number } | null> {
  const response = await rtkEnvelope("/api/exchange-rate", { token });
  return response.data ?? null;
}
