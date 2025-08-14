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

const COMPLETED_KEY = (areaId?: string) =>
  `trx.completed.collapsed.${areaId ?? "unknown"}`;
const PENDING_KEY = (areaId?: string) =>
  `trx.pending.collapsed.${areaId ?? "unknown"}`;

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

  // Collapse states (remember per area)
  const [completedCollapsed, setCompletedCollapsed] = useState<boolean>(() => {
    const saved = sessionStorage.getItem(COMPLETED_KEY(areaId));
    return saved ? saved === "true" : true; // default collapsed
  });
  const [pendingCollapsed, setPendingCollapsed] = useState<boolean>(() => {
    const saved = sessionStorage.getItem(PENDING_KEY(areaId));
    return saved ? saved === "true" : false; // default expanded (high visibility)
  });

  useEffect(() => {
    sessionStorage.setItem(COMPLETED_KEY(areaId), String(completedCollapsed));
  }, [completedCollapsed, areaId]);
  useEffect(() => {
    sessionStorage.setItem(PENDING_KEY(areaId), String(pendingCollapsed));
  }, [pendingCollapsed, areaId]);

  const { activeList, pendingList, completedList, counts, hasPending } =
    useMemo(() => {
      const q = searchTerm.trim().toLowerCase();
      const matches = (c: Customer) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.address.toLowerCase().includes(q);

      const norm = (v: any) =>
        typeof v === "string" ? v : v?._id ? String(v._id) : String(v);

      const filledSet = new Set((customersWithFilledOrders ?? []).map(norm));
      const emptySet = new Set((customersWithEmptyOrders ?? []).map(norm));
      const pendingSet = new Set((customersWithPendingOrders ?? []).map(norm));

      const completed: Array<{ c: Customer; statusClass: "filled" | "empty" }> =
        [];
      const active: Array<{ c: Customer; statusClass: "" }> = [];
      const pending: Array<{ c: Customer }> = [];

      for (const c of customers) {
        if (!matches(c)) continue;
        const id = String(c._id);

        // Pending gets highest priority
        if (pendingSet.has(id)) {
          pending.push({ c });
          continue;
        }
        if (filledSet.has(id)) {
          completed.push({ c, statusClass: "filled" });
          continue;
        }
        if (emptySet.has(id)) {
          completed.push({ c, statusClass: "empty" });
          continue;
        }
        active.push({ c, statusClass: "" });
      }

      return {
        activeList: active,
        pendingList: pending,
        completedList: completed,
        counts: {
          filled: completed.filter((x) => x.statusClass === "filled").length,
          empty: completed.filter((x) => x.statusClass === "empty").length,
          total: completed.length,
        },
        hasPending: pending.length > 0,
      };
    }, [
      customers,
      searchTerm,
      customersWithFilledOrders,
      customersWithPendingOrders,
      customersWithEmptyOrders,
    ]);

  const isOnline = navigator.onLine;

  return (
    <div className="customers-area-container" ref={containerRef}>
      {/* Sticky banner if there are pending items */}
      {hasPending && (
        <div className={`pending-banner ${isOnline ? "online" : "offline"}`}>
          <div className="dot" aria-hidden />
          <div className="pb-text">
            {isOnline
              ? `يوجد ${pendingList.length} طلب بانتظار الإرسال — سيتم مزامنتهم تلقائياً.`
              : `وضع عدم الاتصال: يوجد ${pendingList.length} طلب بانتظار الإرسال.`}
          </div>
        </div>
      )}

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
          {/* Pending (collapsible) */}
          <section className="section">
            <button
              className={`accordion-header pending-hdr ${
                pendingCollapsed ? "collapsed" : ""
              }`}
              onClick={() => setPendingCollapsed((s) => !s)}
              aria-expanded={!pendingCollapsed}
              aria-controls="pending-section"
            >
              <span className="accordion-title">
                بانتظار الإرسال ({pendingList.length})
              </span>
              <span className="accordion-arrow" />
            </button>

            <div
              id="pending-section"
              className={`accordion-panel ${
                pendingCollapsed
                  ? "accordion-panel--hidden"
                  : "accordion-panel--visible"
              }`}
            >
              {pendingList.length === 0 ? (
                <p className="muted">لا يوجد طلبات بانتظار الإرسال</p>
              ) : (
                <div className="customer-list">
                  {pendingList.map(({ c }) => (
                    <div
                      key={c._id}
                      className="customer-card pending"
                      onClick={() => handleOrderState(c._id, c.name)}
                      aria-label={`${c.name} — طلب غير مرسل بعد`}
                    >
                      <div className="customer-name">
                        <span className="name-wrap">
                          <span className="pulse" aria-hidden></span>
                          {c.name}
                        </span>
                        <span className="badge badge-pending">🚩</span>
                      </div>
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
                activeList.map(({ c }) => (
                  <div
                    key={c._id}
                    className="customer-card"
                    onClick={() => handleOrderState(c._id, c.name)}
                  >
                    <div className="customer-name">{c.name}</div>
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
