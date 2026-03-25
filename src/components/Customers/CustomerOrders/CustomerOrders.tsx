// CustomerOrders.tsx
import React from "react";
import { useSelector } from "react-redux";
import SpinLoader from "../../UI reusables/SpinLoader/SpinLoader";
import { Link } from "react-router-dom";
import "./CustomerOrders.css";
import { fmtUSD, fmtLBP, fmtRateLBP, lbpToUsd, usdToLbp } from "../../../utils/money";
import { useOrdersByCustomer } from "../../../features/orders/hooks/useOrdersByCustomer";

interface Payment {
  date: string;
  amount: number;
  currency: "USD" | "LBP";
  exchangeRate?: string;          // from backend (read-only)
  rateAtPaymentLBP?: number;      // optional snapshot (read-only)
  _id?: string;
}

interface Order {
  _id: string;
  recordedBy: string;
  delivered: number;
  returned: number;
  customerid: string;
  payments: Payment[];
  productId: number;
  checkout: number; // USD
  SumOfPaymentsInLiras: number;
  SumOfPaymentsInDollars: number;
  paid: number;     // USD
  total: number;    // USD
  timestamp: string;
  companyId: string;
  shipmentId: string;
  unitPriceUSD?: number;                 // NEW snapshot
  companyExchangeRateLBPAtSale?: number; // NEW snapshot
}

const CustomerOrders: React.FC = () => {
  const customerId: string = useSelector((state: any) => state.order.customer_Id);
  const companyId = useSelector((state: any) => state.user.companyId);
  const token: string = useSelector((state: any) => state.user.token);
  const { orders, loading } = useOrdersByCustomer(token, companyId, customerId);
  const customerOrders = orders as Order[];

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString("ar-LB", {
      timeZone: "Asia/Beirut",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="customer-orders" dir="rtl">
      <h2 className="section-title">طلبات الزبون</h2>
      {loading ? (
        <SpinLoader />
      ) : customerOrders.length === 0 ? (
        <p className="no-orders">لا توجد طلبات لهذا الزبون</p>
      ) : (
        <div className="orders-list">
          {customerOrders.map((order) => {
            const rateSale = order.companyExchangeRateLBPAtSale || 0;
            const unitPrice = order.unitPriceUSD ?? undefined;

            // Per-payment breakdown
            let usdFromUsd = 0;
            let usdFromLbp = 0;

            const paymentRows = (order.payments || []).map((p, i) => {
              const r = p.currency === "LBP"
                ? (p.rateAtPaymentLBP || rateSale)
                : undefined;

              let usdEq: number | null = null;
              if (p.currency === "LBP" && r && r > 0) {
                usdEq = lbpToUsd(p.amount, r);
                usdFromLbp += usdEq ?? 0;
              } else if (p.currency === "USD") {
                usdFromUsd += p.amount;
              }

              return (
                <div key={i} className="payment-row">
                  <div className="payment-line">
                    <span>دفعة:</span>
                    <strong>
                      {p.currency === "USD" ? fmtUSD(p.amount) : fmtLBP(p.amount)}
                    </strong>
                  </div>
                  {p.currency === "LBP" && r != null && r > 0 && (
                    <div className="payment-meta">
                      <span>المعادِل:</span> {fmtUSD(usdEq!)} • <span>السعر:</span> {fmtRateLBP(r)}
                    </div>
                  )}
                </div>
              );
            });

            const checkoutUSD = order.checkout;
            const paidUSD = (usdFromUsd + usdFromLbp) || order.paid;
            const totalUSD = checkoutUSD - paidUSD;

            // LBP equivalents for readability (using sale snapshot)
            const checkoutLBP = rateSale ? usdToLbp(checkoutUSD, rateSale) : null;
            const totalLBP = rateSale ? usdToLbp(totalUSD, rateSale) : null;

            return (
              <div className="order-card" key={order._id}>
                <div className="order-header">
                  <Link className="details-link" to={`/updateOrder/${order._id}`}>تفاصيل</Link>
                </div>

                <div className="order-info">
                  <div><span>المُسلَّم:</span> {order.delivered}</div>
                  <div><span>المُرْجَع:</span> {order.returned}</div>

                  <div className="divider" />

                  {unitPrice && (
                    <div className="mini">
                      <span>سعر الوحدة:</span> <strong>{fmtUSD(unitPrice)}</strong>
                    </div>
                  )}
                  {rateSale > 0 && (
                    <div className="mini">
                      <span>سعر الصرف (وقت البيع):</span> <strong>{fmtRateLBP(rateSale)}</strong>
                    </div>
                  )}

                  <div className="divider" />

                  <div className="calc-line">
                    <span>الحساب:</span>
                    <strong>{fmtUSD(checkoutUSD)}</strong>
                    {checkoutLBP && <em className="muted"> ({fmtLBP(checkoutLBP)})</em>}
                  </div>

                  <div className="payments-block">
                    <div className="subtitle">المدفوع</div>
                    {paymentRows.length ? paymentRows : <div className="muted">لا يوجد دفعات</div>}

                    <div className="sum-line">
                      <span>المجموع المدفوع (بالدولار):</span>
                      <strong>{fmtUSD(usdFromUsd + usdFromLbp)}</strong>
                    </div>
                  </div>

                  <div className={`total-line ${totalUSD > 0 ? "due" : "credit"}`}>
                    <span>{totalUSD >= 0 ? "المتبقي:" : "رصيد دائن:"}</span>
                    <strong>{fmtUSD(Math.abs(totalUSD))}</strong>
                    {totalLBP != null && <em className="muted"> ({fmtLBP(Math.abs(totalLBP))})</em>}
                  </div>

                  <div className="timestamp">
                    <span>الوقت والتاريخ:</span>
                    <div>{formatTimestamp(order.timestamp)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
