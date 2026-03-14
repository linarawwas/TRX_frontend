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
import {
  selectShipmentLiveTotals,
  selectShipmentMeta,
} from "../../../redux/selectors/shipment";
import { profitSchema } from "../validation";

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
  const { id: shipmentId } = useSelector(selectShipmentMeta);
  const { profitsInLiras: profitsLBP, profitsInUSD: profitsUSD } =
    useSelector(selectShipmentLiveTotals);

  const submit = useCallback(
    async (formData: ProfitFormData) => {
      if (!token) {
        const error = new Error("No authentication token");
        options?.onError?.(error);
        return;
      }

      try {
        // Schema-based normalize + validate
        const parsed = profitSchema.safeParse(formData);
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
        const currency =
          String(normalized.paymentCurrency).toUpperCase() === "LBP"
            ? "LBP"
            : "USD";
        if (!shipmentId) {
          const error = new Error("لا توجد شحنة محددة");
          toast.error(error.message);
          options?.onError?.(error);
          return;
        }

        const payload: CreateExtraProfitPayload = {
          name: normalized.name,
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

