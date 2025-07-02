// CustomerOrders.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import SpinLoader from "../../UI reusables/SpinLoader/SpinLoader";
import { Link } from "react-router-dom";
import "./CustomerOrders.css";

interface Payment {
  date: string;
  amount: number;
  currency: string;
  exchangeRate: string;
  _id: string;
}

interface Order {
  _id: string;
  recordedBy: string;
  delivered: number;
  returned: number;
  customerid: string;
  payments: Payment[];
  productId: number;
  checkout: number;
  SumOfPaymentsInLiras: number;
  SumOfPaymentsInDollars: number;
  paid: number;
  paymentCurrency: string;
  exchangeRate: string;
  total: number;
  timestamp: string;
  companyId: string;
  shipmentId: string;
  __v: number;
}

const CustomerOrders: React.FC = () => {
  const customerId: string = useSelector((state: any) => state.order.customer_Id);
  const companyId = useSelector((state: any) => state.user.companyId);
  const token: string = useSelector((state: any) => state.user.token);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/orders/customer/${customerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCustomerOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (companyId && customerId) fetchCustomerOrders();
  }, [companyId, customerId, token]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    date.setHours(date.getHours() - 2); // Beirut offset
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
    <div className="customer-orders">
      <h2 className="section-title">طلبات الزبون</h2>
      {loading ? (
        <SpinLoader />
      ) : customerOrders.length === 0 ? (
        <p className="no-orders">لا توجد طلبات لهذا الزبون</p>
      ) : (
        <div className="orders-list">
          {customerOrders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-header">
                <Link className="details-link" to={`/updateOrder/${order._id}`}>
                  تفاصيل
                </Link>
              </div>
              <div className="order-info">
                <div><span>المُسلَّم:</span> {order.delivered}</div>
                <div><span>المُرْجَع:</span> {order.returned}</div>
                <div><span>الحساب:</span> {order.checkout}</div>
                <div><span>المدفوع بالدولار:</span> {order.paid.toFixed(2)}</div>
                <div><span>المجموع:</span> {order.total.toFixed(2)}</div>
                <div className="timestamp">
                  <span>الوقت والتاريخ:</span>
                  <div>{formatTimestamp(order.timestamp)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;