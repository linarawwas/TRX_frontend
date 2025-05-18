// Refactored CustomersForArea.tsx to use only IndexedDB
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
          console.log("✅ Loaded customers from IndexedDB:", cachedCustomers);
        } else {
          console.warn("⚠️ No cached customer data found for area:", areaId);
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

  return (
    <>
      {/* <h3
        className="table-title"
        style={{ direction: "rtl", textAlign: "right" }}
      >
        الزبائن في هذه المنطقة
      </h3> */}
      <table
        className="customers-for-area-table"
        dir="rtl"
        style={{ textAlign: "right" }}
      >
        <thead>
          <tr>
            <th>الاسم</th>
            <th>تسجيل الطلب</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4}>جارٍ التحميل...</td>
            </tr>
          ) : customers.length > 0 ? (
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
                <td>
                  {customer.name}
                  {customersWithPendingOrders?.includes(customer._id) && (
                    <span className="pending-badge" title="طلب غير مسجل">
                      🚩
                    </span>
                  )}
                </td>

                <td>
                  <button
                    className="customer-for-area-record-button"
                    onClick={() =>
                      handleOrderState(customer._id, customer.name)
                    }
                  >
                    ⬅️
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>لا توجد بيانات زبائن محفوظة</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default CustomersForArea;
