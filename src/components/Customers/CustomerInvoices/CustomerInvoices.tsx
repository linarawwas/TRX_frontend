import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SpinLoader from "../../UI reusables/SpinLoader/SpinLoader";
import {
  getCustomerInvoicesFromDB,
  getPendingRequests,
} from "../../../utils/indexedDB";
import "./CustomerInvoices.css";

interface Sums {
  deliveredSum: number;
  returnedSum: number;
  bottlesLeft: number;
  totalSum: number;
}

const CustomerInvoices: React.FC = () => {
  const [sums, setSums] = useState<Sums | null>(null);
  const [loading, setLoading] = useState(true);
  const customerId = useSelector((state: any) => state.order.customer_Id);
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
        const cachedInvoice = await getCustomerInvoicesFromDB(customerId);
        const pendingRequests = await getPendingRequests();

        const pendingOrders = pendingRequests
          .filter(
            (r: any) =>
              r?.url?.includes("/api/orders") &&
              r?.options?.method === "POST" &&
              JSON.parse(r?.options?.body || "{}")?.customerid === customerId
          )
          .map((r: any) => JSON.parse(r.options.body));

        if (cachedInvoice) {
          let delivered = cachedInvoice.deliveredSum || 0;
          let returned = cachedInvoice.returnedSum || 0;
          let total = cachedInvoice.totalSum || 0;

          for (const order of pendingOrders) {
            delivered += order.delivered || 0;
            returned += order.returned || 0;
            total += order.total || 0;
          }

          setSums({
            deliveredSum: delivered,
            returnedSum: returned,
            bottlesLeft: delivered - returned,
            totalSum: total,
          });
        }
      } catch (err) {
        console.error("❌ Error loading offline invoice:", err);
      }

      setLoading(false);
    };

    loadInvoiceWithOfflineAdjustments();
  }, [customerId]);

  return (
    <div className="customer-receipt">
      {!isOnline && (
        <div className="offline-warning">
          ⚠️ هذه البيانات قد لا تكون محدثة بسبب عدم الاتصال
        </div>
      )}

      {loading ? (
        <SpinLoader />
      ) : sums ? (
        <>
          <p className="detail-name">🧴 القناني المتبقية {sums.bottlesLeft}</p>
          <p className="detail-name">💵 المجموع {sums.totalSum.toFixed(2)}</p>
        </>
      ) : (
        <p className="no-data-text">❌ لا توجد تفاصيل لهذا الزبون</p>
      )}
    </div>
  );
};

export default CustomerInvoices;
