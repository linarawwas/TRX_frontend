import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SpinLoader from "../../UI reusables/SpinLoader/SpinLoader";
import {
  getCustomerInvoicesFromDB,
} from "../../../utils/indexedDB";
import { getPendingRequests } from "../../../utils/indexedDB"; // Assuming this exists

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

  const isOnline = navigator.onLine;

  useEffect(() => {
    const loadInvoiceWithOfflineAdjustments = async () => {
      setLoading(true);

      try {
        const cachedInvoice = await getCustomerInvoicesFromDB(customerId);
        const pendingRequests = await getPendingRequests();

        // Get pending orders for this customer only
        const pendingOrders = pendingRequests
          .filter((r: any) =>
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
        } else {
          console.warn("⚠️ No cached invoice for this customer.");
        }
      } catch (err) {
        console.error("❌ Error loading offline invoice:", err);
      }

      setLoading(false);
    };

    loadInvoiceWithOfflineAdjustments();
  }, [customerId]);

  return (
    <div className="customer-receipt" style={{ direction: "rtl", textAlign: "right" }}>
      <h2>إيصال الزبون</h2>
      {loading ? (
        <SpinLoader />
      ) : sums ? (
        <div className="receipt-details">
          <div className="receipt-detail">
            <p className="detail-name">العدد المتبقي من القناني:</p>
            <p className="detail-value">{sums.bottlesLeft}</p>
          </div>
          <div className="receipt-detail">
            <p className="detail-name">المجموع النهائي:</p>
            <p className="detail-value">{sums.totalSum.toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <p>لا توجد بيانات محفوظة لهذا الزبون</p>
      )}
    </div>
  );
};

export default CustomerInvoices;
