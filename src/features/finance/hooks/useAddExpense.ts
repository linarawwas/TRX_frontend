// src/features/finance/hooks/useAddExpense.ts
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createExpense, CreateExpensePayload } from "../apiFinance";
import {
  setShipmentExpensesInLiras,
  setShipmentExpensesInUSD,
} from "../../../redux/Shipment/action";
import { selectUserToken } from "../../../redux/selectors/user";
import {
  selectShipmentLiveTotals,
  selectShipmentMeta,
} from "../../../redux/selectors/shipment";
import { expenseSchema } from "../validation";

export interface ExpenseFormData {
  name: string;
  value: number | string;
  paymentCurrency: "USD" | "LBP";
}

export interface UseAddExpenseOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAddExpense(options?: UseAddExpenseOptions) {
  const token = useSelector(selectUserToken);
  const dispatch = useDispatch();
  const { id: shipmentId } = useSelector(selectShipmentMeta);
  const { expensesInLiras: expensesLbp, expensesInUSD: expensesUsd } =
    useSelector(selectShipmentLiveTotals);

  const submit = useCallback(
    async (formData: ExpenseFormData) => {
      if (!token) {
        const error = new Error("No authentication token");
        options?.onError?.(error);
        return;
      }

      try {
        // Schema-based validation
        const parsed = expenseSchema.safeParse(formData);
        if (!parsed.success) {
          const msg =
            parsed.error.issues[0]?.message || "البيانات غير صالحة";
          const error = new Error(msg);
          toast.error(error.message);
          options?.onError?.(error);
          return;
        }
        const normalized = parsed.data;
        const valueNum = normalized.value;
        if (!shipmentId) {
          const error = new Error("لا توجد شحنة محددة");
          toast.error(error.message);
          options?.onError?.(error);
          return;
        }

        const payload: CreateExpensePayload = {
          name: normalized.name,
          value: valueNum,
          paymentCurrency:
            normalized.paymentCurrency === "LBP" ? "LBP" : "USD",
          shipmentId,
        };

        await createExpense(token, payload);

        // Update local shipment totals
        if (payload.paymentCurrency === "USD") {
          dispatch(setShipmentExpensesInUSD(Number(expensesUsd) + valueNum));
        } else {
          dispatch(setShipmentExpensesInLiras(Number(expensesLbp) + valueNum));
        }

        toast.success("تم تسجيل المصروف بنجاح");
        options?.onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        const message = `خطأ في تسجيل المصروف: ${error.message}`;
        toast.error(message);
        options?.onError?.(error);
        throw error;
      }
    },
    [token, shipmentId, expensesUsd, expensesLbp, dispatch, options]
  );

  return { submit };
}

