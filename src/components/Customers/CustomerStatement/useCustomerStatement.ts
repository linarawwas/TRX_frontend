import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchCustomerStatement,
  type CustomerDetail,
  type CustomerStatementInitialSummary,
} from "../../../features/customers/apiCustomers";
import { fetchOrdersByCustomer } from "../../../features/orders/apiOrders";
import type { LedgerOrderInput } from "./customerStatementLedger";

const MSG_LOAD_FAILED = "تعذر تحميل كشف الحساب";
const MSG_REFRESH_FAILED = "تعذر تحديث كشف الحساب";

export type StatementOrdersState = LedgerOrderInput[];

export function useCustomerStatement(
  customerId: string | undefined,
  token: string | null | undefined
) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [orders, setOrders] = useState<StatementOrdersState>([]);
  const [opening, setOpening] = useState<CustomerStatementInitialSummary>({
    bottlesLeft: 0,
    balanceUSD: 0,
    at: null,
    orderId: null,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    if (!customerId || !token) {
      setLoading(false);
      setLoadError(
        !customerId ? "معرّف الزبون غير متوفر" : "يجب تسجيل الدخول لعرض الكشف"
      );
      return;
    }

    const statement = await fetchCustomerStatement(token, customerId);
    if (statement.error || !statement.data) {
      const msg = statement.error || MSG_LOAD_FAILED;
      toast.error(msg);
      setLoadError(msg);
      setCustomer(null);
      setOrders([]);
      setLoading(false);
      return;
    }
    setCustomer(statement.data.customer);
    setOrders(statement.data.orders as StatementOrdersState);
    setOpening(statement.data.initial);
    setLoadError(null);
    setLoading(false);
  }, [customerId, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshOrdersAfterPayment = useCallback(async () => {
    if (!customerId || !token) return { ok: false as const };
    const refreshed = await fetchOrdersByCustomer(token, customerId);
    if (refreshed.error) {
      toast.error(refreshed.error || MSG_REFRESH_FAILED);
      return { ok: false as const };
    }
    setOrders((refreshed.data || []) as StatementOrdersState);
    toast.success("تمت إضافة الدفعة");
    return { ok: true as const };
  }, [customerId, token]);

  return {
    loading,
    loadError,
    customer,
    orders,
    opening,
    setOrders,
    reload: load,
    refreshOrdersAfterPayment,
  };
}
