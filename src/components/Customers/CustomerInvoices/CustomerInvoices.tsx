import React, { useEffect, useState } from "react";
import SpinLoader from "../../UI reusables/SpinLoader/SpinLoader";
import {
  getCustomerInvoicesFromDB,
  getPendingRequests,
} from "../../../utils/indexedDB";
import "./CustomerInvoices.css";
import { fmtLBP, fmtUSD, fmtRateLBP, usdToLbp } from "../../../utils/money";

interface Sums {
  deliveredSum: number;
  returnedSum: number;
  bottlesLeft: number;
  totalSumUSD: number; // outstanding in USD
  lastRateLBP?: number; // optional: from last order snapshot
}

const parseOrderBody = (raw: string | undefined): Record<string, any> | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, any>;
  } catch {
    return null;
  }
};

const CustomerInvoices: React.FC<{ customerId: string }> = ({ customerId }) => {
  const [sums, setSums] = useState<Sums | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  useEffect(() => {
    const loadInvoiceWithOfflineAdjustments = async () => {
      setLoading(true);
      try {
        const cachedInvoice: any = await getCustomerInvoicesFromDB(customerId);
        const pendingRequests = await getPendingRequests();

        // Pending "create order" bodies for this customer (no server totals yet)
        const pendingOrders = pendingRequests
          .filter(
            (r: any) =>
              r?.url?.includes("/api/orders") &&
              r?.options?.method === "POST" &&
              parseOrderBody(r?.options?.body)?.customerid === customerId
          )
          .map((r: any) => parseOrderBody(r.options?.body))
          .filter((order): order is Record<string, any> => Boolean(order));

        if (cachedInvoice) {
          let delivered = cachedInvoice.deliveredSum || 0;
          let returned = cachedInvoice.returnedSum || 0;
          // outstanding balance (USD) from cache – don't add pending guess
          const totalUSD = cachedInvoice.totalSum || 0;

          // safely adjust bottles with offline pending (we know delivered/returned inputs)
          for (const order of pendingOrders) {
            delivered += order.delivered || 0;
            returned += order.returned || 0;
          }

          // try to surface last known rate (if your cached invoice stores it)
          const lastRate = cachedInvoice.lastRateLBP || undefined;

          setSums({
            deliveredSum: delivered,
            returnedSum: returned,
            bottlesLeft: delivered - returned,
            totalSumUSD: totalUSD,
            lastRateLBP: lastRate,
          });
        } else {
          setSums(null);
        }
      } catch (err) {
        console.error("❌ Error loading offline invoice:", err);
        setSums(null);
      }
      setLoading(false);
    };

    loadInvoiceWithOfflineAdjustments();
  }, [customerId]);

  const lbpEquivalent = sums?.lastRateLBP
    ? usdToLbp(sums.totalSumUSD, sums.lastRateLBP)
    : null;

  return (
    <div className="customer-receipt" dir="rtl">
      {!isOnline && (
        <div className="offline-warning">
          ⚠️ قد لا تكون الأرقام النهائية محدثة بسبب عدم الاتصال
        </div>
      )}

      {loading ? (
        <SpinLoader />
      ) : sums ? (
        <>
          <p className="detail-name">
            🧴 القناني المتبقية: <strong>{sums.bottlesLeft}</strong>
          </p>
          <p className="detail-name">
            💵 الرصيد المستحق: <strong>{fmtUSD(sums.totalSumUSD)}</strong>
            {lbpEquivalent != null && (
              <em className="muted"> ({fmtLBP(lbpEquivalent)})</em>
            )}
          </p>
          {sums.lastRateLBP ? (
            <p className="rate-hint">
              سعر الصرف المرجعي للفاتورة: {fmtRateLBP(sums.lastRateLBP)}
            </p>
          ) : null}
        </>
      ) : (
        <p className="no-data-text">❌ التفاصيل غير متاحة</p>
      )}
    </div>
  );
};

export default CustomerInvoices;
