import React, { useState, useEffect } from "react";
import "./OrdersTable.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { selectUserToken, selectUserCompanyId } from "../../../redux/selectors/user";
import { fetchOrdersByCompany, Order } from "../../../features/orders/apiOrders";
import SpinLoader from "../../../components/UI reusables/SpinLoader/SpinLoader.jsx";
import { t } from "../../../utils/i18n";

const OrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);
  const companyId = useSelector(selectUserCompanyId);
  const token = useSelector(selectUserToken);

  useEffect(() => {
    if (!token || !companyId) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchOrdersByCompany(token, companyId);
        if (cancelled) return;
        setOrders(data);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error("Error fetching orders:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, companyId]);

  return (
    <div className="ordersBody">
      <h2 className="ordersTitle">{t("orders.title")}</h2>
      {loading ? (
        <SpinLoader />
      ) : error ? (
        <p role="alert">{t("common.error")}: {error}</p>
      ) : (
        <>
          {orders.length === 0 ? (
            <p>{t("addresses.empty")}</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>{t("orders.table.customer")}</th>
                  <th>{t("orders.table.delivered")}</th>
                  <th>{t("orders.table.returned")}</th>
                  <th>{t("orders.table.seeMore")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order?.customer?.name}</td>
                    <td>{order?.delivered}</td>
                    <td>{order?.returned}</td>
                    <td className="link-to-edit">
                      <Link to={`/updateOrder/${order._id}`} aria-label={`${t("orders.table.seeMore")} ${order?.customer?.name}`}>
                        📝
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersTable;
