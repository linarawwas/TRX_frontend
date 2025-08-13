import React, { useMemo } from "react";
import SpinLoader from "../../../UI reusables/SpinLoader/SpinLoader";
import "./OrderReceipt.css";

interface OrderReceiptProps {
  orderData: any;
  loading: boolean;
}

const fmtUSD = (n: number = 0) =>
  `$ ${Number(n).toFixed(2)}`;
const fmtLBP = (n: number = 0) =>
  `${Math.round(n).toLocaleString("ar-LB")} ل.ل`;

const beirutDateTime = (ts?: string | Date) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("ar-LB", {
    timeZone: "Asia/Beirut",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const OrderReceipt: React.FC<OrderReceiptProps> = ({ orderData, loading }) => {
  if (loading) return <SpinLoader />;

  if (!orderData)
    return <p className="no-order">الطلب غير موجود</p>;

  const rate = Number(orderData.companyExchangeRateLBPAtSale) || 0;
  const delivered = Number(orderData.delivered) || 0;
  const returned = Number(orderData.returned) || 0;
  const bottlesLeft = delivered - returned;

  const unitPriceUSD = Number(orderData.unitPriceUSD) || 0;
  const hasDiscount = Boolean(orderData?.customer?.hasDiscount);
  const productType = orderData?.product?.type ?? "—";

  const checkoutUSD = Number(orderData.checkout) || 0;
  const paidUSD = Number(orderData.paid) || 0;           // already includes LBP converted at-sale
  const totalUSD = Number(orderData.total) || 0;

  const sumLBP = Number(orderData.SumOfPaymentsInLiras) || 0;
  const sumUSDdirect = Number(orderData.SumOfPaymentsInDollars) || 0;

  const checkoutLBP = rate ? checkoutUSD * rate : 0;
  const paidLBPequiv = rate ? paidUSD * rate : 0;
  const totalLBP = rate ? totalUSD * rate : 0;

  const payments = Array.isArray(orderData.payments) ? orderData.payments : [];

  return (
    <div className="receipt-card print-area" dir="rtl" aria-label="إيصال الطلب">
      {/* Header */}
      <div className="rc-head">
        <div className="rc-brand">
          <div className="rc-logo" aria-hidden="true">TRX</div>
          <div className="rc-meta">
            <div className="rc-title">إيصال الطلب</div>
            <div className="rc-sub">
              {orderData?.customer?.name || "—"} • {productType}
            </div>
          </div>
        </div>
        <div className="rc-tags">
          {hasDiscount && <span className="badge green">خصم مُفعّل</span>}
          <span className="badge slate">#{String(orderData._id).slice(-6)}</span>
        </div>
      </div>

      {/* Info grid */}
      <div className="rc-grid">
        <div className="grid-item">
          <div className="gi-label">التاريخ</div>
          <div className="gi-value">{beirutDateTime(orderData.timestamp)}</div>
        </div>
        <div className="grid-item">
          <div className="gi-label">المسجِّل</div>
          <div className="gi-value">{orderData.recordedBy_user_name || "—"}</div>
        </div>
        <div className="grid-item">
          <div className="gi-label">الوحدة (دولار)</div>
          <div className="gi-value">{fmtUSD(unitPriceUSD)} / القنّينة</div>
        </div>
        <div className="grid-item">
          <div className="gi-label">سعر الصرف</div>
          <div className="gi-value">{rate ? `${rate.toLocaleString("ar-LB")} ل.ل / $1` : "—"}</div>
        </div>
      </div>

      {/* Quantities */}
      <div className="rc-qty">
        <div className="pill">
          <span>المسلَّم</span>
          <strong>{delivered}</strong>
        </div>
        <div className="pill neutral">
          <span>المرجَع</span>
          <strong>{returned}</strong>
        </div>
        <div className="pill accent">
          <span>المتبقّي</span>
          <strong>{bottlesLeft}</strong>
        </div>
      </div>

      {/* Summary */}
      <div className="rc-sum">
        <div className="sum-row">
          <span>المجموع (USD)</span>
          <strong>{fmtUSD(checkoutUSD)}</strong>
        </div>
        <div className="sum-row sub">
          <span>المعادِل (ل.ل)</span>
          <strong>{fmtLBP(checkoutLBP)}</strong>
        </div>

        <div className="divider" />

        <div className="sum-row">
          <span>المدفوع (USD)</span>
          <strong>{fmtUSD(paidUSD)}</strong>
        </div>
        <div className="sum-row sub">
          <span>تفصيل المدفوع</span>
          <strong>
            {fmtUSD(sumUSDdirect)} + {fmtUSD(sumLBP && rate ? sumLBP / rate : 0)} (من ل.ل)
          </strong>
        </div>
        <div className="sum-row sub">
          <span>المعادِل (ل.ل)</span>
          <strong>{fmtLBP(paidLBPequiv)}</strong>
        </div>

        <div className="divider" />

        <div className={`sum-row total ${totalUSD > 0 ? "" : "settled"}`}>
          <span>المتبقّي (USD)</span>
          <strong>{fmtUSD(totalUSD)}</strong>
        </div>
        <div className="sum-row sub">
          <span>المعادِل (ل.ل)</span>
          <strong>{fmtLBP(totalLBP)}</strong>
        </div>
      </div>

      {/* Payments list */}
      {payments.length > 0 && (
        <div className="rc-payments">
          <div className="sec-title">المدفوعات</div>
          <div className="pay-list">
            {payments.map((p: any, idx: number) => {
              const isUSD = String(p.currency).toUpperCase() === "USD";
              const amount = Number(p.amount) || 0;
              const equiv = isUSD ? (rate ? amount * rate : 0) : (rate ? amount / rate : 0);
              return (
                <div className="pay-item" key={idx}>
                  <div className="pi-main">
                    <span className={`chip ${isUSD ? "usd" : "lbp"}`}>
                      {isUSD ? "USD" : "ل.ل"}
                    </span>
                    <span className="pi-amt">
                      {isUSD ? fmtUSD(amount) : fmtLBP(amount)}
                    </span>
                  </div>
                  <div className="pi-sub">
                    <span>{beirutDateTime(p.date)}</span>
                    <span className="pi-equiv">
                      ≈ {isUSD ? fmtLBP(equiv) : fmtUSD(equiv)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="rc-foot">
        <div className="foot-note">* الحساب بالدولار؛ تظهر قيم الليرة كمرجع بسعر الصرف وقت البيع.</div>
        <div className="foot-print">لطباعة الإيصال: اضغط زر الطباعة أعلاه.</div>
      </div>
    </div>
  );
};

export default OrderReceipt;
