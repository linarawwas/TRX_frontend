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
import { selectShipment } from "../../../redux/selectors/shipment";

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
  const shipment = useSelector(selectShipment);
  const shipmentId = shipment._id || "";
  const expensesLbp = shipment.expensesInLiras ?? 0;
  const expensesUsd = shipment.expensesInUSD ?? 0;

  const submit = useCallback(
    async (formData: ExpenseFormData) => {
      if (!token) {
        const error = new Error("No authentication token");
        options?.onError?.(error);
        return;
      }

      try {
        // Normalize payload
        const valueNum = Number(formData.value);
        if (!formData.name?.trim()) {
          const error = new Error("يرجى إدخال اسم المصروف");
          toast.error(error.message);
          options?.onError?.(error);
          return;
        }
        if (!Number.isFinite(valueNum) || valueNum < 0) {
          const error = new Error("قيمة غير صالحة");
          toast.error(error.message);
          options?.onError?.(error);
          return;
        }
        if (!shipmentId) {
          const error = new Error("لا توجد شحنة محددة");
          toast.error(error.message);
          options?.onError?.(error);
          return;
        }

        const payload: CreateExpensePayload = {
          name: formData.name.trim(),
          value: valueNum,
          paymentCurrency:
            formData.paymentCurrency === "LBP" ? "LBP" : "USD",
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

