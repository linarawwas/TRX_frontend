import React, { useEffect, useMemo, useState } from "react";
import "./DistributorDetails.css";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  unassignCustomerFromDistributor,
  updateDistributor,
} from "../../features/distributors/apiDistributors";
import MonthPicker from "./MonthPicker";
import { deriveInitialMonthKeyFromRange, useMonthRange } from "./hooks/useMonthRange";
import { useCompanyDistributorData } from "../../features/distributors/hooks/useCompanyDistributorData";
import { buildDistributorAnalytics } from "./utils/metrics";
import { setDefaultProduct } from "../../redux/Defaults/action";
import MonthPickerSkeleton from "./skeletons/MonthPickerSkeleton";
import DistributorHeaderSkeleton from "./skeletons/DistributorHeaderSkeleton";
import DistributorSummarySkeleton from "./skeletons/DistributorSummarySkeleton";
import AffiliatedCustomersSkeleton from "./skeletons/AffiliatedCustomersSkeleton";
import LoadingMessage from "./components/LoadingMessage";
import { useLoadingMessage } from "./hooks/useLoadingMessage";
import ProductSelectionPrompt from "./components/ProductSelectionPrompt";

const DistributorDetails: React.FC = () => {
  const token = useSelector((s: RootState) => s.user.token) as string;
  const companyId = useSelector((s: RootState) => s.user.companyId) as string;
  const selectedProductId = useSelector(
    (s: RootState) => (s as any)?.default?.default_product || ""
  );
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const [sp, setSp] = useSearchParams();

  const initialMonthKey =
    deriveInitialMonthKeyFromRange(sp.get("from"), sp.get("to")) ?? undefined;
  const {
    monthKey,
    range,
    setMonthKey,
    thisMonthKey,
    lastMonthKey,
    isThisMonth,
    isLastMonth,
  } = useMonthRange({ initialMonthKey });

  const {
    distributors,
    distributorsLoading,
    customers,
    customersLoading,
    orders,
    ordersLoading,
    products,
    productsLoading,
    refreshCustomers,
    refreshOrders,
    refreshDistributors,
  } = useCompanyDistributorData(token, companyId);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPct, setEditPct] = useState<string>("");
  const [unassigningCustomerId, setUnassigningCustomerId] = useState<string | null>(null);
  const [savingHeader, setSavingHeader] = useState(false);
  const [isAdminView, setIsAdminView] = useState(true); // true = admin view (shows revenueUSD), false = distributor view (hides revenueUSD)

  useEffect(() => {
    const next = new URLSearchParams(sp);
    const currentFrom = sp.get("from");
    const currentTo = sp.get("to");
    if (currentFrom === range.from && currentTo === range.to) return;
    next.set("from", range.from);
    next.set("to", range.to);
    setSp(next, { replace: true });
  }, [range.from, range.to, setSp, sp]);

  // Removed auto-selection - user must explicitly choose a product

  const distributor = useMemo(() => {
    if (!id) return null;
    return distributors.find((d) => String(d._id) === String(id)) || null;
  }, [distributors, id]);

  const selectedProduct = useMemo(
    () => products.find((p) => p._id === selectedProductId) || null,
    [products, selectedProductId]
  );
  const pricePerBottle = selectedProduct?.priceInDollars ?? 0;

  // Only calculate analytics if product is selected
  const analytics = useMemo(() => {
    if (!selectedProductId || pricePerBottle === 0) {
      return { distributors: new Map(), customersByDistributor: new Map() };
    }
    return buildDistributorAnalytics({
      distributors,
      customers,
      orders,
      range,
      pricePerBottle,
    });
  }, [distributors, customers, orders, range, pricePerBottle, selectedProductId]);

  const distributorMetrics = distributor
    ? analytics.distributors.get(String(distributor._id))
    : undefined;

  const customerRows = useMemo(() => {
    if (!distributor) return [];
    return analytics.customersByDistributor.get(String(distributor._id)) ?? [];
  }, [analytics.customersByDistributor, distributor]);

  const totalRows = customerRows.length;

  const loading =
    distributorsLoading || customersLoading || ordersLoading || productsLoading;

  /** Context-aware loading message */
  const loadingMessage = useLoadingMessage({
    distributorsLoading,
    customersLoading,
    ordersLoading,
    productsLoading,
  });

  const unassign = async (customerId: string) => {
    setUnassigningCustomerId(customerId);
    try {
      await unassignCustomerFromDistributor(token, customerId);
      toast.success("تم إلغاء الربط");
      await Promise.all([refreshCustomers(), refreshOrders(), refreshDistributors()]);
    } catch (e:any) {
      toast.error(e?.message || "فشل إلغاء الربط");
    } finally {
      setUnassigningCustomerId(null);
    }
  };

  const saveHeader = async () => {
    if (!id) return;
    setSavingHeader(true);
    try {
      const payload: any = {};
      if (editName.trim()) payload.name = editName.trim();
      if (editPct !== "") payload.commissionPct = Number(editPct);
      await updateDistributor(token, id, payload);
      toast.success("تم الحفظ");
      setEditing(false);
      await refreshDistributors();
    } catch (e:any) {
      toast.error(e?.message || "فشل التحديث");
    } finally {
      setSavingHeader(false);
    }
  };

  const startEditing = () => {
    if (!distributor) return;
    setEditName(distributor.name ?? "");
    setEditPct(
      typeof distributor.commissionPct === "number"
        ? String(distributor.commissionPct)
        : ""
    );
    setEditing(true);
  };

  return (
    <div className="distd-wrap" dir="rtl">
      <ToastContainer position="top-right" autoClose={1200} />

      <header className="distd-head">
        {loading && !distributor ? (
          <DistributorHeaderSkeleton />
        ) : (
          <>
            <Link to="/distributors" className="back">↩︎</Link>
            {!editing ? (
              <h2 className="distd-title">
                {distributor?.name || "موزّع"}{" "}
                {typeof distributorMetrics?.commissionPct === "number" ? (
                  <span className="pct">
                    • عمولة: {distributorMetrics.commissionPct}%
                  </span>
                ) : null}
              </h2>
            ) : (
              <div className="edit-row">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="اسم الموزّع"
                  disabled={savingHeader}
                  aria-disabled={savingHeader}
                />
                <input
                  type="number"
                  value={editPct}
                  onChange={(e) => setEditPct(e.target.value)}
                  placeholder="نسبة العمولة (%)"
                  disabled={savingHeader}
                  aria-disabled={savingHeader}
                />
              </div>
            )}

            <div className="distd-actions" aria-busy={loading}>
              <div className="range">
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
              </div>

              {/* View Toggle */}
              <button
                className="btn secondary"
                onClick={() => setIsAdminView(!isAdminView)}
                disabled={loading}
                aria-disabled={loading}
                title={isAdminView ? "عرض للموزّع" : "عرض للإدارة"}
              >
                {isAdminView ? "عرض للموزّع" : "عرض للإدارة"}
              </button>

              {!editing ? (
                <button
                  className="btn secondary"
                  onClick={startEditing}
                  disabled={loading}
                  aria-disabled={loading}
                >
                  تعديل
                </button>
              ) : (
                <div className="edit-actions">
                  <button
                    className="btn secondary"
                    onClick={() => setEditing(false)}
                    disabled={savingHeader}
                    aria-disabled={savingHeader}
                  >
                    إلغاء
                  </button>
                  <button
                    className="btn primary"
                    onClick={saveHeader}
                    disabled={savingHeader}
                    aria-disabled={savingHeader}
                    aria-busy={savingHeader}
                    title={savingHeader ? "جاري حفظ التغييرات..." : "حفظ التغييرات"}
                  >
                    {savingHeader ? "💾 جارٍ الحفظ…" : "حفظ"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </header>

      {/* Product selection prompt - shown when no product is selected */}
      {!productsLoading && products.length > 0 && !selectedProductId && distributor && (
        <ProductSelectionPrompt
          products={products}
          selectedProductId={selectedProductId}
          onSelect={(productId) => dispatch(setDefaultProduct(productId))}
          loading={productsLoading}
        />
      )}

      {loading && !distributor ? (
        <>
          {loadingMessage && (
            <LoadingMessage
              message={loadingMessage.message}
              submessage={loadingMessage.submessage}
              icon={loadingMessage.icon}
            />
          )}
          <DistributorSummarySkeleton cardCount={4} />
          <AffiliatedCustomersSkeleton rowCount={5} />
        </>
      ) : !distributor ? (
        <p className="empty" role="status">لا يوجد بيانات</p>
      ) : !selectedProductId && !productsLoading ? (
        <div className="empty" role="status">
          <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
            ⚠️ يرجى اختيار منتج أولاً
          </p>
          <p style={{ color: "#64748b" }}>
            اختر منتجاً من الأعلى لعرض بيانات المبيعات والعمولات
          </p>
        </div>
      ) : (
        <>
          {loading ? (
            <>
              {loadingMessage && (
                <LoadingMessage
                  message={loadingMessage.message}
                  submessage={loadingMessage.submessage}
                  icon={loadingMessage.icon}
                />
              )}
              <DistributorSummarySkeleton cardCount={4} />
            </>
          ) : (
            <section className="distd-cards" aria-busy="false">
              <div className="card">
                <div className="k">العملاء</div>
                <div className="v">{distributorMetrics?.customersCount ?? 0}</div>
              </div>
              <div className="card">
                <div className="k">المسلّم</div>
                <div className="v">{distributorMetrics?.deliveredSum ?? 0}</div>
              </div>
              {isAdminView && (
                <div className="card">
                  <div className="k">المبيعات $</div>
                  <div className="v">
                    {(distributorMetrics?.revenueUSD ?? 0).toFixed(2)}
                  </div>
                </div>
              )}
              <div className="card">
                <div className="k">العمولة $</div>
                <div className="v">
                  {(distributorMetrics?.commissionUSD ?? 0).toFixed(2)}
                </div>
              </div>
            </section>
          )}

          {loading ? (
            <>
              {loadingMessage && (
                <LoadingMessage
                  message="🔄 جاري تحديث بيانات العملاء"
                  submessage="نحسب المبيعات والعمولات للعملاء المرتبطين بهذا الموزّع..."
                  icon="🔄"
                />
              )}
              <AffiliatedCustomersSkeleton rowCount={5} />
            </>
          ) : (
            <section className="distd-table" aria-busy="false">
              <div className="tbl-head">
                <div className="title">العملاء المرتبطون ({totalRows})</div>
              </div>
              {customerRows.length === 0 ? (
                <p className="muted" role="status">لا يوجد عملاء مرتبطون بهذا الموزّع.</p>
              ) : (
                <div className="table">
                  <div className="row head">
                    <div className="c name">الاسم</div>
                    <div className="c delivered">المسلّم</div>
                    {isAdminView && <div className="c total">التكلفة $</div>}
                    <div className="c actions">إجراء</div>
                  </div>
                  {customerRows.map((c) => {
                    const isUnassigning = unassigningCustomerId === c.customerId;
                    return (
                      <div className="row" key={c.customerId}>
                        <div className="c name">
                          <Link to={`/updateCustomer/${c.customerId}`} className="link">
                            {c.name}
                          </Link>
                          {c.phone ? <span className="muted"> • {c.phone}</span> : null}
                        </div>
                        <div className="c delivered">{c.deliveredSum ?? 0}</div>
                        {isAdminView && (
                          <div className="c total">{(c.revenueUSD ?? 0).toFixed(2)}</div>
                        )}
                        <div className="c actions">
                          <button
                            className="btn danger"
                            onClick={() => unassign(c.customerId)}
                            disabled={isUnassigning}
                            aria-disabled={isUnassigning}
                            aria-busy={isUnassigning}
                            title={isUnassigning ? "جاري إلغاء الربط..." : "إلغاء ربط العميل من الموزّع"}
                          >
                            {isUnassigning ? "⏳ جارٍ..." : "إلغاء الربط"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default DistributorDetails;
