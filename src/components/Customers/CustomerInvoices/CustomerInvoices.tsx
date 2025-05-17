import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import SpinLoader from "../../UI reusables/SpinLoader/SpinLoader";
import "./CustomerInvoices.css";
import {
  getCustomerInvoicesFromDB,
  saveCustomerInvoicesToDB,
} from "../../../utils/indexedDB"; // Ensure you implement this helper

interface Sums {
  deliveredSum: number;
  returnedSum: number;
  bottlesLeft: number;
  checkoutSum: number;
  paidSum: number;
  totalSum: number;
  paidInLirasSum: number;
  paidInDollarsSum: number;
}

const CustomerInvoices: React.FC = () => {
  const [sums, setSums] = useState<Sums | null>(null);
  const [loading, setLoading] = useState(true);
  const customerId = useSelector((state: any) => state.order.customer_Id);
  const deliveredInShipment = useSelector((state: any) => state.shipment.delivered);
  const liraPayments = useSelector((state: any) => state.shipment.liraPayments);
  const dollarPayments = useSelector((state: any) => state.shipment.dollarPayments);

  useEffect(() => {
    const loadInvoiceFromCache = async () => {
      setLoading(true);
      try {
        const cachedData = await getCustomerInvoicesFromDB(customerId);
        if (cachedData) {
          setSums(cachedData);
        } else {
          console.warn("⚠️ No cached invoice data for this customer.");
        }
      } catch (err) {
        console.error("❌ Failed to load customer invoice from cache:", err);
      }
      setLoading(false);
    };

    loadInvoiceFromCache();
  }, [customerId, deliveredInShipment, liraPayments, dollarPayments]);

  return (
    <div
      className="customer-receipt"
      style={{ direction: "rtl", textAlign: "right" }}
    >
      <h2>إيصال الزبون</h2>
      {loading ? (
        <SpinLoader />
      ) : sums ? (
        <div className="receipt-details">
          <div className="receipt-detail">
            <p className="detail-name">العدد المتبقي من القناني:</p>
            <p className="detail-value">{sums?.bottlesLeft}</p>
          </div>
          <div className="receipt-detail">
            <p className="detail-name">المجموع النهائي:</p>
            <p className="detail-value">{sums?.totalSum.toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <p>لا توجد بيانات محفوظة لهذا الزبون</p>
      )}
    </div>
  );
};

export default CustomerInvoices;
