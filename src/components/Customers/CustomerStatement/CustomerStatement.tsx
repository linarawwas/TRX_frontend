import React, { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { RootState } from "../../../redux/store";
import { t } from "../../../utils/i18n";
import AddPaymentForm from "../../Orders/UpdateOrder/AddPaymentForm/AddPaymentForm";
import { CustomerStatementErrorBoundary } from "./CustomerStatementErrorBoundary";
import { CustomerStatementPaymentSheet } from "./CustomerStatementPaymentSheet";
import {
  buildSelectableOrderOptions,
  buildStatementLedger,
  fmtUSD,
} from "./customerStatementLedger";
import { useCustomerStatement } from "./useCustomerStatement";
import "./CustomerStatement.css";

function CustomerStatementInner() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const token = useSelector((s: RootState) => s.user.token);

  const {
    loading,
    loadError,
    customer,
    orders,
    opening,
    reload,
    refreshOrdersAfterPayment,
  } = useCustomerStatement(customerId, token);

  const [showSheet, setShowSheet] = useState(false);
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);

  const ledger = useMemo(
    () => buildStatementLedger(orders, opening),
    [orders, opening]
  );

  const selectableOrders = useMemo(
    () => buildSelectableOrderOptions(orders),
    [orders]
  );

  const pageTitle = customer?.name
    ? `كشف حساب: ${customer.name}`
    : "كشف حساب الزبون";

  const closeSheet = () => {
    setShowSheet(false);
    setTargetOrderId(null);
  };

  return (
    <div className="customer-st-shell" dir="rtl" lang="ar">
      <div className="customer-st-container">
        <ToastContainer position="top-right" autoClose={1200} />

        <header className="st-header" aria-label="أدوات كشف الحساب">
          <button
            type="button"
            className="st-back"
            onClick={() => navigate(-1)}
            aria-label="رجوع"
          >
            <span className="st-header__icon" aria-hidden="true">
              ←
            </span>
          </button>
          <h1 className="st-title">{pageTitle}</h1>
          <button
            type="button"
            className="st-print"
            onClick={() => window.print()}
            aria-label="طباعة"
          >
            <span className="st-header__icon" aria-hidden="true">
              ⎙
            </span>
            <span className="st-print__label">طباعة</span>
          </button>
        </header>

        {loading ? (
          <div className="st-loading" aria-busy="true" aria-live="polite">
            <div className="st-skeleton st-skeleton--hero" />
            <div className="st-skeleton st-skeleton--line" />
            <div className="st-skeleton st-skeleton--line st-skeleton--short" />
          </div>
        ) : null}

        {!loading && loadError ? (
          <div className="st-inline-error" role="alert">
            <p className="st-inline-error__text">{loadError}</p>
            <button type="button" className="st-retry" onClick={() => void reload()}>
              إعادة المحاولة
            </button>
          </div>
        ) : null}

        {!loading && !loadError && customer ? (
          <div className="print-area">
            <article className="st-card">
              <section className="st-cust" aria-label="بيانات الزبون">
                <div className="st-cust__row">
                  <span className="st-cust__label">الاسم</span>
                  <span className="st-cust__value">{customer.name || "—"}</span>
                </div>
                {customer.phone ? (
                  <div className="st-cust__row">
                    <span className="st-cust__label">الهاتف</span>
                    <span className="st-cust__value">{customer.phone}</span>
                  </div>
                ) : null}
                {customer.address ? (
                  <div className="st-cust__row">
                    <span className="st-cust__label">العنوان</span>
                    <span className="st-cust__value">{customer.address}</span>
                  </div>
                ) : null}
              </section>

              <div className="st-table-region">
                <p
                  className="st-table-scroll-hint"
                  aria-hidden="true"
                >
                  {t("customerStatement.table.scrollHint")}
                </p>
                <div
                  className="st-table-wrap"
                  role="region"
                  tabIndex={0}
                  aria-label={t("customerStatement.table.regionAriaLabel")}
                >
                  <table className="st-table">
                    <thead>
                      <tr>
                        <th scope="col">التاريخ</th>
                        <th scope="col">الطلب</th>
                        <th scope="col">المُسلَّم</th>
                        <th scope="col">المُرْجَع</th>
                        <th scope="col">الباقي (حاويات)</th>
                        <th scope="col">الحساب</th>
                        <th scope="col">المدفوع</th>
                        <th scope="col">الباقي (رصيد مالي)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.rows.map((r) => (
                        <tr key={r.orderId}>
                          <td>{r.date}</td>
                          <td className="mono">
                            <Link
                              to={`/updateOrder/${r.orderId}`}
                              className="st-order-link"
                              title={`فتح الفاتورة ${r.orderId}`}
                            >
                              تفاصيل
                            </Link>
                          </td>
                          <td>{r.delivered}</td>
                          <td>{r.returned}</td>
                          <td>{r.bottlesLeft}</td>
                          <td>{fmtUSD(r.totalUSD)}</td>
                          <td>{fmtUSD(r.paidUSD)}</td>
                          <td
                            className={
                              r.remainingUSD > 0
                                ? "due"
                                : r.remainingUSD < 0
                                  ? "credit"
                                  : ""
                            }
                          >
                            {fmtUSD(Math.abs(r.remainingUSD))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4}>
                          <strong>الإجمالي</strong>
                        </td>
                        <td>
                          <strong>{ledger.meta.ordersBottles}</strong>
                        </td>
                        <td>
                          <strong>{fmtUSD(ledger.totals.total)}</strong>
                        </td>
                        <td>
                          <strong>{fmtUSD(ledger.totals.paid)}</strong>
                        </td>
                        <td>
                          <strong>
                            {fmtUSD(Math.abs(ledger.totals.remaining))}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <footer className="st-summary" aria-label="ملخص الرصيد">
                <div className="st-summary__row">
                  <span className="muted">الرصيد الافتتاحي (USD):</span>
                  <strong>{fmtUSD(ledger.meta.openingBalance)}</strong>
                </div>
                <div className="st-summary__row">
                  <span className="muted">الزجاجات الافتتاحية:</span>
                  <strong>{ledger.meta.openingBottles}</strong>
                </div>

                <hr className="st-hr" />

                <div className="st-summary__row">
                  <span className="muted">صافي الزجاجات من الطلبات:</span>
                  <strong>
                    {ledger.meta.ordersBottles >= 0 ? "+" : ""}
                    {ledger.meta.ordersBottles}
                  </strong>
                </div>
                <div className="st-summary__row">
                  <span className="muted">الرصيد من الطلبات (متبقّي USD):</span>
                  <strong
                    className={
                      ledger.totals.remaining >= 0 ? "due" : "credit"
                    }
                  >
                    {ledger.totals.remaining >= 0
                      ? fmtUSD(ledger.totals.remaining)
                      : fmtUSD(-ledger.totals.remaining)}
                  </strong>
                </div>

                <hr className="st-hr" />

                <div className="st-summary__row">
                  <span>إجمالي الزجاجات الحالية:</span>
                  <strong>{ledger.meta.statementBottlesLeft}</strong>
                </div>
                <div className="st-summary__row">
                  <span>الرصيد الحالي الإجمالي (USD):</span>
                  <strong
                    className={
                      ledger.meta.statementBalanceUSD >= 0 ? "due" : "credit"
                    }
                  >
                    {ledger.meta.statementBalanceUSD >= 0
                      ? fmtUSD(ledger.meta.statementBalanceUSD)
                      : fmtUSD(-ledger.meta.statementBalanceUSD)}
                  </strong>
                </div>

                <p className="muted st-summary__hint">
                  الموجب = متبقٍ على الزبون • السالب = رصيد دائن
                </p>
              </footer>
            </article>
          </div>
        ) : null}

        {!loading && !loadError && customer ? (
          <button
            type="button"
            className="st-fab"
            onClick={() => setShowSheet(true)}
            aria-label="إضافة دفعة"
          >
            +
          </button>
        ) : null}

        {showSheet ? (
          <CustomerStatementPaymentSheet
            title="إضافة دفعة لطلب"
            onClose={closeSheet}
          >
            <div className="st-sheet-fields">
              <label className="st-label" htmlFor="st-order-select">
                اختر الفاتورة
              </label>
              <select
                className="st-select"
                id="st-order-select"
                value={targetOrderId || ""}
                onChange={(e) =>
                  setTargetOrderId(e.target.value || null)
                }
              >
                <option value="">— اختر —</option>
                {selectableOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {targetOrderId ? (
              <AddPaymentForm
                orderData={orders.find((o) => o._id === targetOrderId)}
                orderId={targetOrderId}
                setOrderData={() => undefined}
                onSuccess={async () => {
                  closeSheet();
                  await refreshOrdersAfterPayment();
                }}
              />
            ) : null}
          </CustomerStatementPaymentSheet>
        ) : null}
      </div>
    </div>
  );
}

export default function CustomerStatement() {
  return (
    <CustomerStatementErrorBoundary>
      <CustomerStatementInner />
    </CustomerStatementErrorBoundary>
  );
}
