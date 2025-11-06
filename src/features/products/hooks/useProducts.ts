// src/features/products/hooks/useProducts.ts
import { useEffect, useState, useCallback } from "react";
import {
  listCompanyProducts,
  deleteProductById,
  type ProductResponse,
} from "../apiProducts";

export type Product = ProductResponse;

export function useProducts(token: string | null, companyId?: string) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!companyId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listCompanyProducts(token, companyId);
      setItems(data);
    } catch (e) {
      setError("fetch_failed");
    } finally {
      setLoading(false);
    }
  }, [token, companyId]);

  const remove = useCallback(
    async (productId: string) => {
      if (!token) return;
      // optimistic
      const prev = items;
      setItems(items.filter((p) => p._id !== productId));
      try {
        await deleteProductById(token, productId);
      } catch (e) {
        setItems(prev);
        throw e;
      }
    },
    [items, token]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, error, refetch, remove, setItems };
}

