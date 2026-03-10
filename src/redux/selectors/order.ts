// src/redux/selectors/order.ts
import { RootState } from "../store";

export const selectOrderAreaId = (s: RootState): string | null => s.order?.area_Id || null;
export const selectOrderCustomerId = (s: RootState): string | null => s.order?.customer_Id || null;
export const selectOrderCustomerName = (s: RootState): string => s.order?.customer_name || "";
export const selectOrderCustomerPhone = (s: RootState): string => s.order?.phone || "";
export const selectOrderProductId = (s: RootState): string | null => s.order?.product_id || null;
export const selectOrderProductName = (s: RootState): string => s.order?.product_name || "";
export const selectOrderProductPrice = (s: RootState): number => s.order?.product_price || 0;

export const selectOrder = (s: RootState) => ({
  areaId: selectOrderAreaId(s),
  customerId: selectOrderCustomerId(s),
  customerName: selectOrderCustomerName(s),
  customerPhone: selectOrderCustomerPhone(s),
  productId: selectOrderProductId(s),
  productName: selectOrderProductName(s),
  productPrice: selectOrderProductPrice(s),
});

