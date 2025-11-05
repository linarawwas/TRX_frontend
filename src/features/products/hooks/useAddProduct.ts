// src/features/products/hooks/useAddProduct.ts
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createProduct, CreateProductPayload } from "../apiProducts";
import { selectUserToken, selectUserCompanyId } from "../../../redux/selectors/user";

export interface ProductFormData {
  type: string;
  priceInDollars: number | string;
  isReturnable: boolean;
}

export interface UseAddProductOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAddProduct(options?: UseAddProductOptions) {
  const token = useSelector(selectUserToken);
  const companyId = useSelector(selectUserCompanyId);

  const submit = useCallback(
    async (formData: ProductFormData) => {
      if (!token) {
        const error = new Error("No authentication token");
        options?.onError?.(error);
        return;
      }
      if (!companyId) {
        const error = new Error("No company ID");
        options?.onError?.(error);
        return;
      }

      try {
        const priceNum = Number(formData.priceInDollars);
        if (!Number.isFinite(priceNum) || priceNum < 0) {
          const error = new Error("Invalid price");
          toast.error(error.message);
          options?.onError?.(error);
          return;
        }

        const payload: CreateProductPayload = {
          type: String(formData.type).trim(),
          priceInDollars: priceNum,
          isReturnable: Boolean(formData.isReturnable),
          companyId,
        };

        await createProduct(token, payload);
        toast.success("Product successfully recorded.");
        options?.onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Failed to create product: ${error.message}`);
        options?.onError?.(error);
        throw error;
      }
    },
    [token, companyId, options]
  );

  return { submit };
}

