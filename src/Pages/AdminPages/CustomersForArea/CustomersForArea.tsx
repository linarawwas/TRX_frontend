import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./CustomersForAreaMobile.css";
import {
  clearCustomerId,
  clearCustomerName,
  setCustomerId,
  setCustomerName,
} from "../../../redux/Order/action";
import { getCustomersFromDB } from "../../../utils/indexedDB";

interface Customer {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

const CustomersForArea = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { areaId } = useParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const customersWithFilledOrders = useSelector(
    (state: any) => state.shipment?.CustomersWithFilledOrders
  );
  const customersWithPendingOrders = useSelector(
    (state: any) => state.shipment?.CustomersWithPendingOrders
  );
  const customersWithEmptyOrders = useSelector(
    (state: any) => state.shipment?.CustomersWithEmptyOrders
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(clearCustomerId());
    dispatch(clearCustomerName());

    const loadCachedCustomers = async () => {
      try {
        setLoading(true);
        const cachedCustomers = await getCustomersFromDB(areaId!);
        if (cachedCustomers) {
          setCustomers(cachedCustomers);
        }
      } catch (error) {
        console.error("❌ Error loading customers from IndexedDB:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCachedCustomers();
  }, [areaId, dispatch]);

  const handleOrderState = (customerId: string, customerName: string) => {
    dispatch(setCustomerId(customerId));
    dispatch(setCustomerName(customerName));
    navigate("/recordOrderforCustomer");
  };

  const getStatusClass = (id: string) => {
    if (customersWithPendingOrders?.includes(id)) return "pending";
    if (customersWithFilledOrders?.includes(id)) return "filled";
    if (customersWithEmptyOrders?.includes(id)) return "empty";
    return "unknown";
  };

  return (
    <div className="customers-area-container">
      <h2 className="area-title">📍 الزبائن في هذه المنطقة</h2>
      {loading ? (
        <p className="loading-text">⏳ جارٍ التحميل...</p>
      ) : customers.length > 0 ? (
        <div className="customer-list">
          {customers.map((customer) => (
            <div
              key={customer._id}
              className={`customer-card ${getStatusClass(customer._id)}`}
              onClick={() => handleOrderState(customer._id, customer.name)}
            >
              <div className="customer-name">
                {customer.name}
                {customersWithPendingOrders?.includes(customer._id) && (
                  <span className="badge">🚩</span>
                )}
              </div>
              <div className="customer-details">
                <span>{customer.phone}</span>
                <span>{customer.address}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="loading-text">❌ لا توجد بيانات زبائن محفوظة</p>
      )}
    </div>
  );
};

export default CustomersForArea;
