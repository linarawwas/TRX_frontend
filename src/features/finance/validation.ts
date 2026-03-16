import { z } from "zod";

export const expenseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "يرجى إدخال اسم المصروف"),
  value: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? NaN : Number(v)),
    z
      .number()
      .nonnegative("قيمة غير صالحة")
  ),
  paymentCurrency: z.string(),
});

export const profitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "يرجى إدخال اسم الربح"),
  value: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? NaN : Number(v)),
    z
      .number()
      .nonnegative("قيمة غير صالحة")
  ),
  paymentCurrency: z.string(),
});

export type ExpenseFormInput = z.infer<typeof expenseSchema>;
export type ProfitFormInput = z.infer<typeof profitSchema>;

/** Return a localized error message string or null when valid. */
export function validateExpense(data: Record<string, any>): string | null {
  const result = expenseSchema.safeParse(data);
  if (result.success) {
    if (result.data.paymentCurrency !== "USD" && result.data.paymentCurrency !== "LBP") {
      return "عملة غير صالحة";
    }
    return null;
  }
  const issue = result.error.issues[0];
  return issue?.message ?? "البيانات غير صالحة";
}

/** Return a localized error message string or null when valid. */
export function validateProfit(data: Record<string, any>): string | null {
  const result = profitSchema.safeParse(data);
  if (result.success) {
    if (result.data.paymentCurrency !== "USD" && result.data.paymentCurrency !== "LBP") {
      return "عملة غير صالحة";
    }
    return null;
  }
  const issue = result.error.issues[0];
  return issue?.message ?? "البيانات غير صالحة";
}

