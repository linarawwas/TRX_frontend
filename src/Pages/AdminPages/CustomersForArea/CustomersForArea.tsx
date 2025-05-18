import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./CustomersForAreaMobile.css"; // Use mobile-first styles
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
  const [searchTerm, setSearchTerm] = useState<string>("");

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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || 0;
      setShowScrollTop(scrollTop > 300);
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  

  const handleOrderState = (customerId: string, customerName: string) => {
    dispatch(setCustomerId(customerId));
    dispatch(setCustomerName(customerName));
    navigate("/recordOrderforCustomer");
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customers-area-container" ref={containerRef}>
      <h3 className="area-title">الزبائن في هذه المنطقة</h3>

      <input
        type="text"
        className="customer-search-input"
        placeholder="🔍 ابحث عن اسم الزبون..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <p className="loading-text">⏳ جارٍ تحميل الزبائن...</p>
      ) : (
        <div className="customer-list">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => {
              const statusClass = customersWithFilledOrders?.includes(
                customer._id
              )
                ? "filled"
                : customersWithPendingOrders?.includes(customer._id)
                ? "pending"
                : customersWithEmptyOrders?.includes(customer._id)
                ? "empty"
                : "";

              return (
                <div
                  key={customer._id}
                  className={`customer-card ${statusClass}`}
                  onClick={() => handleOrderState(customer._id, customer.name)}
                >
                  <div className="customer-name">
                    {customer.name}
                    {customersWithPendingOrders?.includes(customer._id) && (
                      <span className="badge">🚩</span>
                    )}
                  </div>
                  <div className="customer-details">
                    <span>📍العنوان: {customer.address}</span>
                    <span>📞 {customer.phone}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="loading-text">😕 لا يوجد نتائج مطابقة</p>
          )}
        </div>
      )}
      {showScrollTop && (
        <button
          className="scroll-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}

        >
          ⬆️  
        </button>
      )}
    </div>
  );
};

export default CustomersForArea;
