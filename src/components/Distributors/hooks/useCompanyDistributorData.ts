import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CustomersResponse, fetchCustomersByCompany } from "../../../features/customers/apiCustomers";
import { fetchOrdersByCompany, Order } from "../../../features/orders/apiOrders";
import { listCompanyProducts, ProductResponse } from "../../../features/products/apiProducts";
import { normalizeListResponse } from "../utils/normalize";

export interface DistributorRow {
  _id: string;
  name?: string;
  phone?: string;
  commissionPct?: number;
}

export interface CompanyDistributorData {
  distributors: DistributorRow[];
  distributorsLoading: boolean;
  customers: Array<CustomersResponse["active"][number]>;
  customersLoading: boolean;
  orders: Order[];
  ordersLoading: boolean;
  products: ProductResponse[];
  productsLoading: boolean;
  refreshDistributors: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshProducts: () => Promise<void>;
}

export function useCompanyDistributorData(token: string, companyId?: string | null): CompanyDistributorData {
  const [distributors, setDistributors] = useState<DistributorRow[]>([]);
  const [distributorsLoading, setDistributorsLoading] = useState(false);

  const [customers, setCustomers] = useState<Array<CustomersResponse["active"][number]>>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const refreshDistributors = useCallback(async () => {
    setDistributorsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/distributors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => null);
      setDistributors(normalizeListResponse(json));
    } catch (error) {
      console.error("Failed to load distributors:", error);
      setDistributors([]);
      toast.error("فشل تحميل قائمة الموزّعين");
    } finally {
      setDistributorsLoading(false);
    }
  }, [token]);

  const refreshCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      const payload: CustomersResponse = await fetchCustomersByCompany(token);
      const active = Array.isArray(payload?.active) ? payload.active : [];
      const inactive = Array.isArray(payload?.inactive) ? payload.inactive : [];
      setCustomers([...active, ...inactive]);
    } catch (error: any) {
      console.error("Failed to load customers:", error);
      setCustomers([]);
      toast.error(error?.message || "فشل تحميل بيانات العملاء");
    } finally {
      setCustomersLoading(false);
    }
  }, [token]);

  const refreshOrders = useCallback(async () => {
    if (!companyId) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    try {
      const payload = await fetchOrdersByCompany(token, companyId);
      setOrders(Array.isArray(payload) ? payload : []);
    } catch (error: any) {
      console.error("Failed to load orders:", error);
      setOrders([]);
      toast.error(error?.message || "فشل تحميل الطلبيات");
    } finally {
      setOrdersLoading(false);
    }
  }, [token, companyId]);

  const refreshProducts = useCallback(async () => {
    if (!companyId) {
      setProducts([]);
      return;
    }
    setProductsLoading(true);
    try {
      const payload = await listCompanyProducts(token, companyId);
      setProducts(Array.isArray(payload) ? payload : []);
    } catch (error: any) {
      console.error("Failed to load products:", error);
      setProducts([]);
      toast.error(error?.message || "فشل تحميل المنتجات");
    } finally {
      setProductsLoading(false);
    }
  }, [token, companyId]);

  useEffect(() => {
    refreshDistributors();
  }, [refreshDistributors]);

  useEffect(() => {
    refreshCustomers();
  }, [refreshCustomers]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  return {
    distributors,
    distributorsLoading,
    customers,
    customersLoading,
    orders,
    ordersLoading,
    products,
    productsLoading,
    refreshDistributors,
    refreshCustomers,
    refreshOrders,
    refreshProducts,
  };
}

