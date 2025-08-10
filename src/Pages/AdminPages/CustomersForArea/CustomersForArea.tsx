import React, { useState, useEffect, useRef, useMemo } from "react";
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

const STORAGE_KEY = (areaId?: string) =>
  `trx.completed.collapsed.${areaId ?? "unknown"}`;

const CustomersForArea = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { areaId } = useParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const customersWithFilledOrders: string[] = useSelector(
    (state: any) => state.shipment?.CustomersWithFilledOrders ?? []
  );
  const customersWithPendingOrders: string[] = useSelector(
    (state: any) => state.shipment?.CustomersWithPendingOrders ?? []
  );
  const customersWithEmptyOrders: string[] = useSelector(
    (state: any) => state.shipment?.CustomersWithEmptyOrders ?? []
  );

  // Load cached customers
  useEffect(() => {
    dispatch(clearCustomerId());
    dispatch(clearCustomerName());
    const loadCachedCustomers = async () => {
      try {
        setLoading(true);
        const cached = await getCustomersFromDB(areaId!);
        if (cached) setCustomers(cached);
      } catch (e) {
        console.error("❌ IndexedDB load error:", e);
      } finally {
        setLoading(false);
      }
    };
    loadCachedCustomers();
  }, [areaId, dispatch]);

  // Scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop((window.scrollY || 0) > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOrderState = (customerId: string, customerName: string) => {
    dispatch(setCustomerId(customerId));
    dispatch(setCustomerName(customerName));
    navigate("/recordOrderforCustomer");
  };

  // Collapse state (remembered per area)
  const [completedCollapsed, setCompletedCollapsed] = useState<boolean>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY(areaId));
    return saved ? saved === "true" : true; // default collapsed
  });
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY(areaId), String(completedCollapsed));
  }, [completedCollapsed, areaId]);

  const { activeList, completedList, counts } = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const matches = (c: Customer) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q);

    const filledSet = new Set(customersWithFilledOrders);
    const pendingSet = new Set(customersWithPendingOrders);
    const emptySet = new Set(customersWithEmptyOrders);

    const completed: Array<{ c: Customer; statusClass: "filled" | "empty" }> =
      [];
    const active: Array<{ c: Customer; statusClass: "" | "pending" }> = [];

    for (const c of customers) {
      if (!matches(c)) continue;

      if (filledSet.has(c._id)) {
        completed.push({ c, statusClass: "filled" });
      } else if (emptySet.has(c._id)) {
        completed.push({ c, statusClass: "empty" });
      } else if (pendingSet.has(c._id)) {
        active.push({ c, statusClass: "pending" });
      } else {
        active.push({ c, statusClass: "" });
      }
    }

    return {
      activeList: active,
      completedList: completed,
      counts: {
        filled: completed.filter((x) => x.statusClass === "filled").length,
        empty: completed.filter((x) => x.statusClass === "empty").length,
        total: completed.length,
      },
    };
  }, [
    customers,
    searchTerm,
    customersWithFilledOrders,
    customersWithPendingOrders,
    customersWithEmptyOrders,
  ]);

  return (
    <div className="customers-area-container" ref={containerRef}>
      <h3 className="area-title">الزبائن في هذه المنطقة</h3>

      <input
        type="text"
        className="customer-search-input"
        placeholder="🔍 ابحث عن اسم الزبون..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        inputMode="search"
      />

      {loading ? (
        <p className="loading-text">⏳ جارٍ تحميل الزبائن...</p>
      ) : (
        <>
          {/* Completed (collapsible) */}
          <section className="section">
            <button
              className={`accordion-header ${
                completedCollapsed ? "collapsed" : ""
              }`}
              onClick={() => setCompletedCollapsed((s) => !s)}
              aria-expanded={!completedCollapsed}
              aria-controls="completed-section"
            >
              <span className="accordion-title">
                المُنجَز ({counts.total}) — معبّأ: {counts.filled} | فارغ:{" "}
                {counts.empty}
              </span>
              <span className="accordion-arrow" />
            </button>

            <div
              id="completed-section"
              className={`accordion-panel ${
                completedCollapsed
                  ? "accordion-panel--hidden"
                  : "accordion-panel--visible"
              }`}
            >
              {completedList.length === 0 ? (
                <p className="muted">لا يوجد زبائن مُنجَزون بعد</p>
              ) : (
                <div className="customer-list">
                  {completedList.map(({ c, statusClass }) => (
                    <div
                      key={c._id}
                      className={`customer-card ${statusClass}`}
                      onClick={() => handleOrderState(c._id, c.name)}
                    >
                      <div className="customer-name">{c.name}</div>
                      <div className="customer-details">
                        <span>📍العنوان: {c.address}</span>
                        <span>📞 {c.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Active (what’s left) */}
          <section className="section">
            <div className="section-header">
              <span className="section-title">
                المتبقّي ({activeList.length})
              </span>
            </div>
            <div className="customer-list">
              {activeList.length > 0 ? (
                activeList.map(({ c, statusClass }) => (
                  <div
                    key={c._id}
                    className={`customer-card ${statusClass}`}
                    onClick={() => handleOrderState(c._id, c.name)}
                  >
                    <div className="customer-name">
                      {c.name}
                      {statusClass === "pending" && (
                        <span className="badge">🚩</span>
                      )}
                    </div>
                    <div className="customer-details">
                      <span>📍العنوان: {c.address}</span>
                      <span>📞 {c.phone}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="loading-text">😕 لا يوجد نتائج مطابقة</p>
              )}
            </div>
          </section>
        </>
      )}

      {showScrollTop && (
        <button
          className="scroll-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="العودة للأعلى"
        >
          ⬆️
        </button>
      )}
    </div>
  );
};

export default CustomersForArea;
