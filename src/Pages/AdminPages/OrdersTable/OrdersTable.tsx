import React, { useState, useEffect } from "react";
import "./OrdersTable.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader.jsx";
const OrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const token = useSelector((state: RootState) => state.user.token);

  interface Payment {
    date: string;
    amount: number;
    currency: string;
    exchangeRate: string;
    _id: string;
  }

  interface Customer {
    _id: string;
    name: string;
    phone: string;
    areaId: string;
    address: string;
    __v: number;
    companyId: string;
  }

  interface Product {
    _id: string;
    id: number;
    type: string;
    priceInDollars: number;
    isReturnable: boolean;
    companyId: string;
    __v: number;
  }

  interface Order {
    _id: string;
    recordedBy: string;
    delivered: number;
    returned: number;
    customerId: string;
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
    customer: Customer;
    product: Product;
  }

  useEffect(() => {
    fetch(`http://localhost:5000/api/orders/company/${companyId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setOrders(data);
        console.log(orders);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });
  }, [token, companyId]);

  return (
    <div className="ordersBody">
      <h2 className="ordersTitle"> Orders</h2>
      {loading ? (
        <SpinLoader />
      ) : (
        <>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Delivered</th>
                <th>Returned</th>
                <th>See More...</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order?.customer?.name}</td>
                  <td>{order?.delivered}</td>
                  <td>{order?.returned}</td>
                  <td className="link-to-edit">
                    {/* Create a Link for the action button */}
                    <Link to={`/updateOrder/${order._id}`}>📝</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default OrdersTable;
