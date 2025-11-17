import React, { useEffect, useMemo, useState } from "react";
import "./Distributors.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import AddToModel from "../AddToModel/AddToModel";
import { createDistributor } from "../../utils/distributorApi";
import { setDefaultProduct } from "../../redux/Defaults/action";
import { useCompanyDistributorData } from "./hooks/useCompanyDistributorData";
import MonthPicker from "./MonthPicker";
import { useMonthRange } from "./hooks/useMonthRange";
import { buildDistributorAnalytics } from "./utils/metrics";
import MonthPickerSkeleton from "./skeletons/MonthPickerSkeleton";
import ProductSelectSkeleton from "./skeletons/ProductSelectSkeleton";
import DistributorListSkeleton from "./skeletons/DistributorListSkeleton";
import LoadingMessage from "./components/LoadingMessage";
import { useLoadingMessage } from "./hooks/useLoadingMessage";

const DistributorsPage: React.FC = () => {
  const token = useSelector((s: RootState) => s.user.token) as string;
  const companyId = useSelector((s: RootState) => s.user.companyId) as string;
  const selectedProductId = useSelector(
    (s: RootState) => (s as any)?.default?.default_product || ""
  );
  const dispatch = useDispatch();

  const {
    monthKey,
    range,
    setMonthKey,
    thisMonthKey,
    lastMonthKey,
    isThisMonth,
    isLastMonth,
  } = useMonthRange();

  const {
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
  } = useCompanyDistributorData(token, companyId);

  /** UI: search & create modal */
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      dispatch(setDefaultProduct(products[0]._id));
    }
  }, [dispatch, products, selectedProductId]);

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

  const analytics = useMemo(
    () =>
      buildDistributorAnalytics({
        distributors,
        customers,
        orders,
        range,
        pricePerBottle,
      }),
    [distributors, customers, orders, range, pricePerBottle]
  );

  const enriched = useMemo(() => {
    return filtered.map((distributor) => {
      const metrics = analytics.distributors.get(String(distributor._id));
      return {
        ...distributor,
        customersCount: metrics?.customersCount ?? 0,
        deliveredSum: metrics?.deliveredSum ?? 0,
        revenueUSD: metrics?.revenueUSD ?? 0,
        commissionUSD: metrics?.commissionUSD ?? 0,
        commissionPct: metrics?.commissionPct ?? distributor.commissionPct ?? 0,
      };
    });
  }, [analytics.distributors, filtered]);

  /** Create distributor modal fields */
  const createFields = {
    name: { label: "اسم الموزّع", "input-type": "text" },
    commissionPct: { label: "نسبة العمولة (%)", "input-type": "number" },
  } as const;

  /** Unified loading/empty handling */
  const loading =
    distributorsLoading || customersLoading || ordersLoading || productsLoading;
  const isEmpty = !loading && enriched.length === 0;

  /** Context-aware loading message */
  const loadingMessage = useLoadingMessage({
    distributorsLoading,
    customersLoading,
    ordersLoading,
    productsLoading,
  });

  return (
    <div className="dist-wrap" dir="rtl">
      <ToastContainer position="top-right" autoClose={1200} />

      <header className="dist-head">
        <h2 className="dist-title">الموزّعون</h2>

        <div className="dist-actions" aria-busy={loading}>
          {/* Date range chips + manual pickers */}
          {loading ? (
            <MonthPickerSkeleton />
          ) : (
            <MonthPicker
              monthKey={monthKey}
              onMonthChange={setMonthKey}
              thisMonthKey={thisMonthKey}
              lastMonthKey={lastMonthKey}
              isThisMonth={isThisMonth}
              isLastMonth={isLastMonth}
            />
          )}

          {/* Product select controls sales calculation */}
          {productsLoading ? (
            <ProductSelectSkeleton />
          ) : (
            <div className="product-filter">
              <label htmlFor="dist-product" className="product-filter__label">
                سعر المنتج للحساب
              </label>
              <select
                id="dist-product"
                className="product-filter__select"
                value={selectedProductId}
                onChange={(e) => dispatch(setDefaultProduct(e.target.value))}
                disabled={productsLoading || products.length === 0}
                aria-disabled={productsLoading || products.length === 0}
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
          )}

          {/* Search (wired to filter) */}
          <div className="search">
            <input
              type="text"
              placeholder="🔎 ابحث عن موزّع…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
              aria-disabled={loading}
            />
          </div>

          {/* Create */}
          <button
            className="btn primary"
            onClick={() => setShowCreate(true)}
            disabled={loading}
            aria-disabled={loading}
          >
            + إضافة موزّع
          </button>
        </div>
      </header>

      {/* Body states */}
      {loading ? (
        <>
          {loadingMessage && (
            <LoadingMessage
              message={loadingMessage.message}
              submessage={loadingMessage.submessage}
              icon={loadingMessage.icon}
            />
          )}
          <DistributorListSkeleton itemCount={6} />
        </>
      ) : isEmpty ? (
        <div className="empty" role="status">لا يوجد موزّعون</div>
      ) : (
        <div className="dist-grid" aria-busy="false">
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
            await refreshDistributors();
            await refreshCustomers();
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
