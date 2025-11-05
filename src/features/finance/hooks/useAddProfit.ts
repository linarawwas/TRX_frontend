// src/features/finance/hooks/useAddProfit.ts
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createExtraProfit, CreateExtraProfitPayload } from "../apiFinance";
import {
  setShipmentProfitsInLiras,
  setShipmentProfitsInUSD,
} from "../../../redux/Shipment/action";
import { selectUserToken } from "../../../redux/selectors/user";
import { selectShipment } from "../../../redux/selectors/shipment";

export interface ProfitFormData {
  name: string;
  value: number | string;
  paymentCurrency: "USD" | "LBP";
}

export interface UseAddProfitOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAddProfit(options?: UseAddProfitOptions) {
  const token = useSelector(selectUserToken);
  const dispatch = useDispatch();
  const shipment = useSelector(selectShipment);
  const shipmentId = shipment._id || "";
  const profitsLBP = shipment.profitsInLiras ?? 0;
  const profitsUSD = shipment.profitsInUSD ?? 0;

  const submit = useCallback(
    async (formData: ProfitFormData) => {
      if (!token) {
        const error = new Error("No authentication token");
        options?.onError?.(error);
        return;
      }

      try {
        // Normalize + validate
        const valueNum = Number(formData.value);
        const currency =
          String(formData.paymentCurrency).toUpperCase() === "LBP"
            ? "LBP"
            : "USD";

        if (!formData.name?.trim()) {
          const error = new Error("يرجى إدخال اسم الربح");
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

        const payload: CreateExtraProfitPayload = {
          name: formData.name.trim(),
          value: valueNum,
          paymentCurrency: currency,
          shipmentId,
        };

        await createExtraProfit(token, payload);

        // Update live shipment totals
        if (currency === "USD") {
          dispatch(setShipmentProfitsInUSD(Number(profitsUSD) + valueNum));
        } else {
          dispatch(setShipmentProfitsInLiras(Number(profitsLBP) + valueNum));
        }

        toast.success("تم تسجيل الربح الإضافي");
        options?.onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        const message = `فشل تسجيل الربح: ${error.message}`;
        toast.error(message);
        options?.onError?.(error);
        throw error;
      }
    },
    [token, shipmentId, profitsUSD, profitsLBP, dispatch, options]
  );

  return { submit };
}

