// CustomersForAreaMobile.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./CustomersForAreaMobile.css";
import {
  clearCustomerId,
  clearCustomerName,
  clearCustomerPhoneNb,
  setCustomerId,
  setCustomerName,
  setCustomerPhoneNb,
} from "../../../redux/Order/action";
import { getCustomersFromDB } from "../../../utils/indexedDB";
import {
  selectCustomersWithFilledOrders,
  selectCustomersWithEmptyOrders,
  selectCustomersWithPendingOrders,
} from "../../../redux/selectors/shipment";
import { t } from "../../../utils/i18n";

interface Customer {
  _id: string;
  name: string;
  address: string;
  phone: string;
  sequence?: number | null;
}

const COMPLETED_KEY = (areaId?: string) =>
  `trx.completed.collapsed.${areaId ?? "unknown"}`;
const PENDING_KEY = (areaId?: string) =>
  `trx.pending.collapsed.${areaId ?? "unknown"}`;

const CustomersForArea = (): JSX.Element => {
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { areaId } = useParams<{ areaId: string }>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExternalArea, setIsExternalArea] = useState<boolean>(
    Boolean((location.state as { isExternal?: boolean })?.isExternal)
  );
  const customersWithFilledOrders = useSelector(selectCustomersWithFilledOrders);
  const customersWithPendingOrders = useSelector(selectCustomersWithPendingOrders);
  const customersWithEmptyOrders = useSelector(selectCustomersWithEmptyOrders);
  const { state: routeState } = useLocation() as {
    state?: { isExternal?: boolean };
  };

  // Load cached customers (and sort by sequence)
  useEffect(() => {
    dispatch(clearCustomerId());
    dispatch(clearCustomerName());
    dispatch(clearCustomerPhoneNb());
    const loadCachedCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const cached = await getCustomersFromDB(areaId!);
        if (cached) {
          setCustomers(cached);
        } else {
          setCustomers([]);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("❌ IndexedDB load error:", e);
        setError(message);
        setCustomers([]);
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

  const handleOrderState = (
    customerId: string,
    customerName: string,
    phone: string
  ) => {
    dispatch(setCustomerId(customerId));
    dispatch(setCustomerName(customerName));
    dispatch(setCustomerPhoneNb(phone));
    navigate("/recordOrderforCustomer", {
      state: { isExternal: Boolean(routeState?.isExternal) },
    });
  };

  // Collapse states (remember per area)
  const [completedCollapsed, setCompletedCollapsed] = useState<boolean>(() => {
    const saved = sessionStorage.getItem(COMPLETED_KEY(areaId));
    return saved ? saved === "true" : true; // default collapsed
  });
  const [pendingCollapsed, setPendingCollapsed] = useState<boolean>(() => {
    const saved = sessionStorage.getItem(PENDING_KEY(areaId));
    return saved ? saved === "true" : false; // default expanded
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

      const norm = (v: unknown) =>
        typeof v === "string" ? v : (v as { _id?: string })?._id ? String((v as { _id: string })._id) : String(v);

      const filledSet = new Set((customersWithFilledOrders ?? []).map(norm));
      const emptySet = new Set((customersWithEmptyOrders ?? []).map(norm));
      const pendingSet = new Set((customersWithPendingOrders ?? []).map(norm));

      // We already sorted `customers`; just preserve that order
      const completed: Array<{ c: Customer; statusClass: "filled" | "empty" }> =
        [];
      const active: Array<{ c: Customer; statusClass: "" }> = [];
      const pending: Array<{ c: Customer }> = [];

      for (const c of customers) {
        if (!matches(c)) continue;
        const id = String(c._id);

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
              ? t("customersForArea.pending.banner.online", { count: pendingList.length })
              : t("customersForArea.pending.banner.offline", { count: pendingList.length })}
          </div>
        </div>
      )}
      <h3 className="area-title">{t("customersForArea.title")}</h3>
      <input
        type="text"
        className="customer-search-input"
        placeholder={t("customersForArea.search.placeholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        inputMode="search"
        aria-label={t("customersForArea.search.placeholder")}
      />
      {loading ? (
        <p className="loading-text" role="status" aria-live="polite">
          {t("customersForArea.loading")}
        </p>
      ) : error ? (
        <p className="loading-text" role="alert">
          {t("common.error")}: {error}
        </p>
      ) : (
        <>
          {/* Pending (collapsible) */}
          <section className="section">
            <button
              type="button"
              className={`accordion-header pending-hdr ${
                pendingCollapsed ? "collapsed" : ""
              }`}
              onClick={() => setPendingCollapsed((s) => !s)}
              aria-expanded={!pendingCollapsed}
              aria-controls="pending-section"
            >
              <span className="accordion-title">
                {t("customersForArea.pending.title", { count: pendingList.length })}
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
                <p className="muted">{t("customersForArea.pending.empty")}</p>
              ) : (
                <div className="customer-list">
                  {pendingList.map(({ c }) => (
                    <div
                      key={c._id}
                      className="customer-card pending"
                      onClick={() => {
                        handleOrderState(c._id, c.name, c.phone);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleOrderState(c._id, c.name, c.phone);
                        }
                      }}
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
                        <span>{t("customersForArea.customer.address")}: {c.address}</span>
                        <span>{t("customersForArea.customer.phone")} {c.phone}</span>
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
              type="button"
              className={`accordion-header ${
                completedCollapsed ? "collapsed" : ""
              }`}
              onClick={() => setCompletedCollapsed((s) => !s)}
              aria-expanded={!completedCollapsed}
              aria-controls="completed-section"
            >
              <span className="accordion-title">
                {t("customersForArea.completed.title", {
                  total: counts.total,
                  filled: counts.filled,
                  empty: counts.empty,
                })}
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
                <p className="muted">{t("customersForArea.completed.emptyText")}</p>
              ) : (
                <div className="customer-list">
                  {completedList.map(({ c, statusClass }) => (
                    <div
                      key={c._id}
                      className={`customer-card ${statusClass}`}
                      onClick={() => handleOrderState(c._id, c.name, c.phone)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleOrderState(c._id, c.name, c.phone);
                        }
                      }}
                    >
                      <div className="customer-name">{c.name}</div>
                      <div className="customer-details">
                        <span>{t("customersForArea.customer.address")}: {c.address}</span>
                        <span>{t("customersForArea.customer.phone")} {c.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Active (what's left) */}
          <section className="section">
            <div className="section-header">
              <span className="section-title">
                {t("customersForArea.active.title", { count: activeList.length })}
              </span>
            </div>
            <div className="customer-list">
              {activeList.length > 0 ? (
                activeList.map(({ c }) => (
                  <div
                    key={c._id}
                    className="customer-card"
                    onClick={() => handleOrderState(c._id, c.name, c.phone)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleOrderState(c._id, c.name, c.phone);
                      }
                    }}
                  >
                    <div className="customer-name">{c.name}</div>
                    <div className="customer-details">
                      <span>{t("customersForArea.customer.address")}: {c.address}</span>
                      <span>{t("customersForArea.customer.phone")} {c.phone}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="loading-text">{t("customersForArea.active.empty")}</p>
              )}
            </div>
          </section>
        </>
      )}
      {showScrollTop && (
        <button
          type="button"
          className="scroll-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t("common.back")}
        >
          ⬆️
        </button>
      )}
    </div>
  );
};

export default CustomersForArea;
