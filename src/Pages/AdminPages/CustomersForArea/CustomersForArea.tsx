import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./CustomersForArea.css";
import {
  clearCustomerId,
  clearCustomerName,
  setCustomerId,
  setCustomerName,
} from "../../../redux/Order/action";
import {
  saveCustomersToDB,
  getCustomersFromDB,
} from "../../../utils/indexedDB"; // Import the cache functions

interface Customer {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

const CustomersForArea = (): JSX.Element => {
  const token: string = useSelector((state: any) => state.user.token);
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

    const fetchData = async () => {
      try {
        if (navigator.onLine) {
          const response = await fetch(
            `http://localhost:5000/api/customers/area/${areaId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) throw new Error("Network response was not ok");

          const data: Customer[] = await response.json();
          setCustomers(data);
          console.log("Fetched customers from API:", data);

          // Save data to IndexedDB using the helper function
          await saveCustomersToDB(areaId!, data);
        } else {
          console.log("No internet connection, loading from IndexedDB");

          // Load from IndexedDB using the helper function
          const cachedCustomers = await getCustomersFromDB(areaId!);
          if (cachedCustomers) {
            console.log("Loaded customers from IndexedDB:", cachedCustomers);
            setCustomers(cachedCustomers);
          } else {
            console.log("No cached customer data found.");
          }
        }
      } catch (error) {
        console.error("Error fetching customers:", error);

        // If an error occurs (e.g., no network), load from IndexedDB
        const cachedCustomers = await getCustomersFromDB(areaId!);
        if (cachedCustomers) {
          console.log("Fetched customers from IndexedDB:", cachedCustomers);
          setCustomers(cachedCustomers);
        } else {
          console.log("No cached customer data available.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [areaId, token, dispatch]);

  const handleOrderState = (customerId: string, customerName: string) => {
    dispatch(setCustomerId(customerId));
    dispatch(setCustomerName(customerName));
    navigate("/recordOrderforCustomer");
  };

  return (
    <>
      <h3
        className="table-title"
        style={{ direction: "rtl", textAlign: "right" }}
      >
        الزبائن في هذه المنطقة
      </h3>
      <table
        className="customers-for-area-table"
        dir="rtl"
        style={{ textAlign: "right" }}
      >
        <thead>
          <tr>
            <th>الاسم</th>
            <th>العنوان</th>
            <th>رقم الهاتف</th>
            <th>تسجيل الطلب</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4}>جارٍ التحميل...</td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr
                key={customer._id}
                className={
                  customersWithFilledOrders?.includes(customer._id)
                    ? "customer-with-filled-order"
                    : customersWithEmptyOrders?.includes(customer._id)
                    ? "customer-with-empty-order"
                    : customersWithPendingOrders?.includes(customer._id)
                    ? "customer-with-pending-order"
                    : ""
                }
              >
                <td>{customer.name}</td>
                <td>{customer.address}</td>
                <td>{customer.phone}</td>
                <td>
                  <button
                    className="customer-for-area-record-button"
                    onClick={() => {
                      handleOrderState(customer._id, customer.name);
                    }}
                  >
                    ➡️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
};

export default CustomersForArea;
