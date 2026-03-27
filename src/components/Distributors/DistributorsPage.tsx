import React, {
  Component,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import "./Distributors.css";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import AddToModel from "../AddToModel/AddToModel";
import { createDistributor } from "../../features/distributors/apiDistributors";
import { setDefaultProduct } from "../../redux/Defaults/action";
import { useCompanyDistributorData } from "../../features/distributors/hooks/useCompanyDistributorData";
import MonthPicker from "./MonthPicker";
import { useMonthRange } from "./hooks/useMonthRange";
import { buildDistributorAnalytics } from "./utils/metrics";
import MonthPickerSkeleton from "./skeletons/MonthPickerSkeleton";
import ProductSelectSkeleton from "./skeletons/ProductSelectSkeleton";
import DistributorListSkeleton from "./skeletons/DistributorListSkeleton";
import LoadingMessage from "./components/LoadingMessage";
import { useLoadingMessage } from "./hooks/useLoadingMessage";
import ProductSelectionPrompt from "./components/ProductSelectionPrompt";
import { createLogger } from "../../utils/logger";

const logger = createLogger("distributors-page");

type AddToModelFields = ComponentProps<typeof AddToModel>["modelFields"];

const createFields: AddToModelFields = {
  name: { label: "اسم الموزّع", "input-type": "text" },
  commissionPct: { label: "نسبة العمولة (%)", "input-type": "number" },
};

function DistributorsPageInner(): JSX.Element {
  const token = useSelector((s: RootState) => s.user.token) ?? "";
  const companyId = useSelector((s: RootState) => s.user.companyId) ?? "";
  const selectedProductId = useSelector(
    (s: RootState) => s.default.default_product
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

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [isAdminView, setIsAdminView] = useState(true);

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
  }, [
    distributors,
    customers,
    orders,
    range,
    pricePerBottle,
    selectedProductId,
  ]);

  const enriched = useMemo(() => {
    if (!selectedProductId) {
      return filtered.map((distributor) => ({
        ...distributor,
        customersCount: 0,
        deliveredSum: 0,
        revenueUSD: 0,
        commissionUSD: 0,
        commissionPct: distributor.commissionPct ?? 0,
      }));
    }
    return filtered.map((distributor) => {
      const metrics = analytics.distributors.get(String(distributor._id));
      return {
        ...distributor,
        customersCount: metrics?.customersCount ?? 0,
        deliveredSum: metrics?.deliveredSum ?? 0,
        revenueUSD: metrics?.revenueUSD ?? 0,
        commissionUSD: metrics?.commissionUSD ?? 0,
        commissionPct:
          metrics?.commissionPct ?? distributor.commissionPct ?? 0,
      };
    });
  }, [analytics.distributors, filtered, selectedProductId]);

  const loading =
    distributorsLoading ||
    customersLoading ||
    ordersLoading ||
    productsLoading;
  const isEmpty = !loading && enriched.length === 0;

  const loadingMessage = useLoadingMessage({
    distributorsLoading,
    customersLoading,
    ordersLoading,
    productsLoading,
  });

  return (
    <div className="dist-wrap" dir="rtl" lang="ar">
      <ToastContainer position="top-right" autoClose={1200} />

      <header className="dist-head">
        <h2 className="dist-title">الموزّعون</h2>
        <p className="dist-lede">
          متابعة العملاء، التسليم، المبيعات والعمولات حسب المنتج والفترة
        </p>

        <div className="dist-actions" aria-busy={loading}>
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

          {productsLoading ? (
            <ProductSelectSkeleton />
          ) : (
            <div className="product-filter product-filter--required">
              <label htmlFor="dist-product" className="product-filter__label">
                <span className="product-filter__required-mark">*</span>
                المنتج للحساب
              </label>
              <select
                id="dist-product"
                className={`product-filter__select ${!selectedProductId ? "product-filter__select--empty" : ""}`}
                value={selectedProductId}
                onChange={(e) => dispatch(setDefaultProduct(e.target.value))}
                disabled={productsLoading || products.length === 0}
                aria-disabled={productsLoading || products.length === 0}
                aria-required="true"
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

          <div className="search">
            <input
              type="search"
              placeholder="🔎 ابحث عن موزّع…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
              aria-disabled={loading}
            />
          </div>

          <button
            type="button"
            className="btn secondary dist-btn-ghost"
            onClick={() => setIsAdminView(!isAdminView)}
            disabled={loading}
            aria-disabled={loading}
            title={isAdminView ? "عرض للموزّع" : "عرض للإدارة"}
          >
            {isAdminView ? "عرض للموزّع" : "عرض للإدارة"}
          </button>

          <button
            type="button"
            className="btn primary dist-btn-primary"
            onClick={() => setShowCreate(true)}
            disabled={loading}
            aria-disabled={loading}
          >
            + إضافة موزّع
          </button>
        </div>
      </header>

      {!productsLoading && products.length > 0 && !selectedProductId && (
        <ProductSelectionPrompt
          products={products}
          selectedProductId={selectedProductId}
          onSelect={(productId) => dispatch(setDefaultProduct(productId))}
          loading={productsLoading}
        />
      )}

      {loading ? (
        <>
          {loadingMessage ? (
            <LoadingMessage
              message={loadingMessage.message}
              submessage={loadingMessage.submessage}
              icon={loadingMessage.icon}
            />
          ) : null}
          <DistributorListSkeleton itemCount={6} />
        </>
      ) : !selectedProductId && !productsLoading ? (
        <div className="dist-empty dist-empty--warning" role="status">
          <p className="dist-empty__title">يرجى اختيار منتج أولاً</p>
          <p className="dist-empty__text">
            اختر منتجاً من الأعلى لعرض بيانات المبيعات والعمولات
          </p>
        </div>
      ) : isEmpty ? (
        <div className="dist-empty" role="status">
          لا يوجد موزّعون
        </div>
      ) : (
        <div className="dist-grid" aria-busy={false}>
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
                {isAdminView ? (
                  <div className="metric">
                    <div className="k">المبيعات $</div>
                    <div className="v">{d.revenueUSD.toFixed(2)}</div>
                  </div>
                ) : null}
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

      {showCreate ? (
        <AddToModel
          modelName="الموزّع"
          title="إضافة موزّع"
          buttonLabel="حفظ"
          modelFields={createFields}
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
      ) : null}
    </div>
  );
}

type BoundaryState = { hasError: boolean };

class DistributorsErrorBoundary extends Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error("DistributorsPage crashed", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="dist-wrap dist-wrap--error"
          dir="rtl"
          lang="ar"
          role="alert"
        >
          <div className="dist-error-card">
            <h2 className="dist-error-card__title">تعذّر تحميل صفحة الموزّعين</h2>
            <p className="dist-error-card__text">
              حدث خطأ غير متوقع. أعد تحميل الصفحة أو عد لاحقاً.
            </p>
            <button
              type="button"
              className="dist-error-card__btn"
              onClick={() => window.location.reload()}
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DistributorsPage(): JSX.Element {
  return (
    <DistributorsErrorBoundary>
      <DistributorsPageInner />
    </DistributorsErrorBoundary>
  );
}
