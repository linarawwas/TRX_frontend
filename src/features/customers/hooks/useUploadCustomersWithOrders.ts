import { uploadCustomersWithOrders } from "../api";
import { useAsyncMutation } from "../../api/hooks/useAsyncMutation";

export function useUploadCustomersWithOrders(token: string) {
  return useAsyncMutation(
    (formData: FormData) => uploadCustomersWithOrders(token, formData),
    "Upload failed"
  );
}
