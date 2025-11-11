import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./Distributors.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import AddToModel from "../AddToModel/AddToModel";
import { createDistributor } from "../../utils/distributorApi";
import {
  fetchCustomersByCompany,
  CustomersResponse,
  Customer as CustomerRecord,
} from "../../features/customers/apiCustomers";
import {
  fetchOrdersByCompany,
  Order,
} from "../../features/orders/apiOrders";
import {
  listCompanyProducts,
  ProductResponse,
} from "../../features/products/apiProducts";

/** Date helpers */
function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function monthKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function addMonths(base: Date, offset: number) {
  const clone = new Date(base.getTime());
  clone.setMonth(clone.getMonth() + offset);
  return clone;
}

function computeMonthRange(monthKey: string) {
  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(monthIndex) ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    throw new Error(`Invalid month key: ${monthKey}`);
  }
  const start = new Date(year, monthIndex, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 0);
  end.setHours(23, 59, 59, 999);
  return {
    key: monthKey,
    from: iso(start),
    to: iso(end),
    start,
    end,
  };
}

/** Shape guards to normalize API responses */
function normalizeListResponse(json: any) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.distributors)) return json.distributors;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

type DistributorRow = {
  _id: string;
  name?: string;
  phone?: string;
  commissionPct?: number;
};

type CustomerWithDistributor = CustomerRecord & {
  distributorId?: string | null;
};

const DistributorsPage: React.FC = () => {
  const token = useSelector((s: RootState) => s.user.token) as string;
  const companyId = useSelector((s: RootState) => s.user.companyId) as string;

  /** Month range selection */
  const [monthKey, setMonthKey] = useState(() => monthKeyFromDate(new Date()));
  const thisMonthKey = monthKeyFromDate(new Date());
  const lastMonthKey = monthKeyFromDate(addMonths(new Date(), -1));
  const range = useMemo(() => {
    try {
      return computeMonthRange(monthKey);
    } catch (error) {
      console.error("Invalid month key, falling back to current month:", error);
      return computeMonthRange(thisMonthKey);
    }
  }, [monthKey, thisMonthKey]);
  const isThisMonth = monthKey === thisMonthKey;
  const isLastMonth = monthKey === lastMonthKey;

  /** Base directory list (id, name, …) */
  const [distributors, setDistributors] = useState<DistributorRow[]>([]);
  const [listLoading, setListLoading] = useState(true);

  /** Supporting data for metric calculations */
  const [customers, setCustomers] = useState<CustomerWithDistributor[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  /** UI: search & create modal */
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  /** Fetch base distributor list once (and whenever we explicitly refetch) */
  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/distributors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => null);
      setDistributors(normalizeListResponse(json) as DistributorRow[]);
    } catch (e) {
      console.error("Failed to load distributors:", e);
      setDistributors([]);
      toast.error("فشل تحميل قائمة الموزّعين");
    } finally {
      setListLoading(false);
    }
  }, [token]);

  /** Fetch all customers (active + inactive) belonging to the company */
  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      const payload: CustomersResponse = await fetchCustomersByCompany(token);
      const active = Array.isArray(payload?.active) ? payload.active : [];
      const inactive = Array.isArray(payload?.inactive) ? payload.inactive : [];
      setCustomers([
        ...(active as CustomerWithDistributor[]),
        ...(inactive as CustomerWithDistributor[]),
      ]);
    } catch (e: any) {
      console.error("Failed to load customers:", e);
      setCustomers([]);
      toast.error(e?.message || "فشل تحميل بيانات العملاء");
    } finally {
      setCustomersLoading(false);
    }
  }, [token]);

  /** Fetch all orders for the company (filtered locally by month) */
  const fetchOrders = useCallback(async () => {
    if (!companyId) return;
    setOrdersLoading(true);
    try {
      const payload = await fetchOrdersByCompany(token, companyId);
      setOrders(Array.isArray(payload) ? payload : []);
    } catch (e: any) {
      console.error("Failed to load orders:", e);
      setOrders([]);
      toast.error(e?.message || "فشل تحميل الطلبيات");
    } finally {
      setOrdersLoading(false);
    }
  }, [token, companyId]);

  /** Fetch products once so user can choose the pricing basis */
  const fetchProducts = useCallback(async () => {
    if (!companyId) return;
    setProductsLoading(true);
    try {
      const payload = await listCompanyProducts(token, companyId);
      setProducts(Array.isArray(payload) ? payload : []);
    } catch (e: any) {
      console.error("Failed to load products:", e);
      setProducts([]);
      toast.error(e?.message || "فشل تحميل المنتجات");
    } finally {
      setProductsLoading(false);
    }
  }, [token, companyId]);

  /** Initial load + range updates */
  useEffect(() => {
    fetchList();
  }, [fetchList]);
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /** Filter by search (name/phone) */
  const filtered = useMemo(() => {
    const arr = Array.isArray(distributors) ? distributors : [];
    const q = search.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(
      (d) =>
        (d?.name || "").toLowerCase().includes(q) ||
        (d?.phone || "").includes(q)
    );
  }, [distributors, search]);

  const selectedProduct = useMemo(
    () => products.find((p) => p._id === selectedProductId) || null,
    [products, selectedProductId]
  );
  const pricePerBottle = selectedProduct?.priceInDollars ?? 0;

  /** Build lookup tables for customers -> distributors */
  const customerLookups = useMemo(() => {
    const customerToDistributor = new Map<string, string>();
    const customerIdsByDistributor = new Map<string, Set<string>>();
    for (const c of customers) {
      const distributorId = c?.distributorId ? String(c.distributorId) : "";
      if (!distributorId) continue;
      const cid = String(c._id);
      customerToDistributor.set(cid, distributorId);
      if (!customerIdsByDistributor.has(distributorId)) {
        customerIdsByDistributor.set(distributorId, new Set<string>());
      }
      customerIdsByDistributor.get(distributorId)!.add(cid);
    }
    return { customerToDistributor, customerIdsByDistributor };
  }, [customers]);

  const deliveredByDistributor = useMemo(() => {
    const map = new Map<string, number>();
    const startTime = range.start.getTime();
    const endTime = range.end.getTime();
    for (const order of orders) {
      const rawCustomerId =
        (order as any).customerid ?? order.customerId ?? order.customer?._id;
      if (!rawCustomerId) continue;
      const distributorId = customerLookups.customerToDistributor.get(
        String(rawCustomerId)
      );
      if (!distributorId) continue;
      const timestamp = order.timestamp ? new Date(order.timestamp).getTime() : NaN;
      if (!Number.isFinite(timestamp)) continue;
      if (timestamp < startTime || timestamp > endTime) continue;
      const delivered = Number(order.delivered ?? 0);
      map.set(distributorId, (map.get(distributorId) ?? 0) + (Number.isFinite(delivered) ? delivered : 0));
    }
    return map;
  }, [orders, range, customerLookups.customerToDistributor]);

  /**
   * Merge base directory with locally-computed metrics
   * - Customers counted via customer list
   * - Delivered sum filtered by selected month
   * - Revenue and commission derived from selected product price
   */
  const enriched = useMemo(() => {
    return filtered.map((d) => {
      const key = String(d._id);
      const customerIds =
        customerLookups.customerIdsByDistributor.get(key) ?? new Set<string>();
      const customersCount = customerIds.size;
      const deliveredSum = deliveredByDistributor.get(key) ?? 0;
      const revenueUSD =
        pricePerBottle > 0 ? Number((deliveredSum * pricePerBottle).toFixed(2)) : 0;
      const commissionPct = Number(d.commissionPct ?? 0);
      const commissionUSD = Number(
        ((revenueUSD * commissionPct) / 100 || 0).toFixed(2)
      );
      return {
        ...d,
        customersCount,
        deliveredSum,
        revenueUSD,
        commissionUSD,
        commissionPct,
      };
    });
  }, [filtered, customerLookups.customerIdsByDistributor, deliveredByDistributor, pricePerBottle]);

  /** Create distributor modal fields */
  const createFields = {
    name: { label: "اسم الموزّع", "input-type": "text" },
    commissionPct: { label: "نسبة العمولة (%)", "input-type": "number" },
  } as const;

  /** Unified loading/empty handling */
  const loading =
    listLoading || customersLoading || ordersLoading || productsLoading;
  const isEmpty = !loading && enriched.length === 0;

  return (
    <div className="dist-wrap" dir="rtl">
      <ToastContainer position="top-right" autoClose={1200} />

      <header className="dist-head">
        <h2 className="dist-title">الموزّعون</h2>

        <div className="dist-actions">
          {/* Date range chips + manual pickers */}
          <div className="range">
            <button
              className={`chip ${isThisMonth ? "active" : ""}`}
              onClick={() => setMonthKey(thisMonthKey)}
            >
              هذا الشهر
            </button>
            <button
              className={`chip ${isLastMonth ? "active" : ""}`}
              onClick={() => setMonthKey(lastMonthKey)}
            >
              الشهر الماضي
            </button>
            <div className="custom-range">
              <input
                type="month"
                value={monthKey}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    setMonthKey(value);
                  }
                }}
              />
            </div>
          </div>

          {/* Product select controls sales calculation */}
          <div className="product-filter">
            <label htmlFor="dist-product" className="product-filter__label">
              سعر المنتج للحساب
            </label>
            <select
              id="dist-product"
              className="product-filter__select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={productsLoading || products.length === 0}
            >
              <option value="">
                {productsLoading ? "جارٍ التحميل…" : "اختر المنتج"}
              </option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.type} — ${product.priceInDollars.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Search (wired to filter) */}
          <div className="search">
            <input
              type="text"
              placeholder="🔎 ابحث عن موزّع…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Create */}
          <button className="btn primary" onClick={() => setShowCreate(true)}>
            + إضافة موزّع
          </button>
        </div>
      </header>

      {/* Body states */}
      {loading ? (
        <p className="loading">جارٍ التحميل…</p>
      ) : isEmpty ? (
        <div className="empty">لا يوجد موزّعون</div>
      ) : (
        <div className="dist-grid">
          {enriched.map((d) => (
            <Link
              to={`/distributors/${d._id}?from=${range.from}&to=${range.to}`}
              className="dist-card"
              key={d._id}
            >
              <div className="dist-name">{d.name}</div>
              <div className="dist-metrics">
                <div className="metric">
                  <div className="k">العملاء</div>
                  <div className="v">{d.customersCount}</div>
                </div>
                <div className="metric">
                  <div className="k">المسلّم</div>
                  <div className="v">{d.deliveredSum}</div>
                </div>
                <div className="metric">
                  <div className="k">المبيعات $</div>
                  <div className="v">{d.revenueUSD.toFixed(2)}</div>
                </div>
                <div className="metric">
                  <div className="k">العمولة $</div>
                  <div className="v">
                    {d.commissionUSD.toFixed(2)}{" "}
                    <span className="metric__hint">
                      ({Number(d.commissionPct || 0).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Distributor Modal */}
      {showCreate && (
        <AddToModel
          modelName="الموزّع"
          title="إضافة موزّع"
          buttonLabel="حفظ"
          modelFields={createFields as any}
          onSubmit={(payload) =>
            createDistributor(token, {
              name: String(payload.name || "").trim(),
              commissionPct:
                payload.commissionPct === "" || payload.commissionPct == null
                  ? undefined
                  : Number(payload.commissionPct),
            })
          }
          onSuccess={async () => {
            toast.success("تمت الإضافة");
            setShowCreate(false);
            // Refresh both lists so card appears with correct KPIs
            await fetchList();
            await fetchCustomers();
          }}
          onCancel={() => setShowCreate(false)}
          confirmBuilder={(data) => ({
            title: "تأكيد إضافة موزّع",
            body: (
              <div className="confirm-list">
                <div className="confirm-row">
                  <div className="confirm-key">الاسم</div>
                  <div className="confirm-val">{String(data.name || "—")}</div>
                </div>
                <div className="confirm-row">
                  <div className="confirm-key">العمولة</div>
                  <div className="confirm-val">
                    {data.commissionPct ? `${data.commissionPct}%` : "—"}
                  </div>
                </div>
              </div>
            ),
          })}
        />
      )}
    </div>
  );
};

export default DistributorsPage;
