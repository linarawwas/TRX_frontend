import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import SpinLoader from "../../UI reusables/SpinLoader/SpinLoader";
import "./CustomerInvoices.css";
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
  const token: string = useSelector((state: any) => state.user.token);
  const customerId = useSelector((state: any) => state.order.customer_Id);
  const deliveredInShipment = useSelector(
    (state: any) => state.shipment.delivered
  );
  const liraPayments = useSelector((state: any) => state.shipment.liraPayments);
  const dollarPayments = useSelector(
    (state: any) => state.shipment.dollarPayments
  );

  useEffect(() => {
    const fetchCustomerInvoices = async () => {
      setLoading(true);

      if (navigator.onLine) {
        try {
          //fetch from API
          const response = await axios.get(
            `https://trx-api.linarawas.com/api/customers/reciept/${customerId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = response.data;
          setSums(data.sums);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching customer receipt:", error);
          setLoading(false);
        }
      } else {
        // Offline: Load from IndexedDB
        setLoading(false);
      }
    };

    fetchCustomerInvoices();
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
        <p>لا توجد بيانات لهذا الزبون</p>
      )}
    </div>
  );
  
};

export default CustomerInvoices;
