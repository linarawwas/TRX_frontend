import { useState } from "react";
import { uploadCustomersWithOrders } from "../api";

export function useUploadCustomersWithOrders(token: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      return await uploadCustomersWithOrders(token, formData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
