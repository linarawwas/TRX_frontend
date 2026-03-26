// Customers for one area — IndexedDB list + shipment bucket segmentation → record order
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setCustomerId,
  setCustomerName,
  setCustomerPhoneNb,
} from "../../../redux/Order/action";
import {
  selectCustomersWithEmptyOrders,
  selectCustomersWithFilledOrders,
  selectCustomersWithPendingOrders,
} from "../../../redux/selectors/shipment";
import { useNavigatorOnline } from "../../../hooks/useNavigatorOnline";
import { t } from "../../../utils/i18n";
import {
  COMPLETED_COLLAPSE_KEY,
  PENDING_COLLAPSE_KEY,
} from "./customersForAreaSessionKeys";
import { useCustomersForAreaCache } from "./hooks/useCustomersForAreaCache";
import { useSegmentCustomersForArea } from "./hooks/useSegmentCustomersForArea";
import { useScrollTopVisibility } from "./hooks/useScrollTopVisibility";
import { CustomersForAreaConnectivityBar } from "./components/CustomersForAreaConnectivityBar";
import { CustomersForAreaPendingBanner } from "./components/CustomersForAreaPendingBanner";
import { CustomersForAreaCustomerCard } from "./components/CustomersForAreaCustomerCard";
import { CustomersForAreaSkeleton } from "./components/CustomersForAreaSkeleton";
import { CustomersForAreaScrollTop } from "./components/CustomersForAreaScrollTop";
import "./CustomersForArea.css";

const CustomersForArea = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { areaId } = useParams<{ areaId: string }>();
  const { state: routeState } = useLocation() as {
    state?: { isExternal?: boolean };
  };

  const isOnline = useNavigatorOnline();
  const customersWithFilledOrders = useSelector(selectCustomersWithFilledOrders);
  const customersWithPendingOrders = useSelector(
    selectCustomersWithPendingOrders
  );
  const customersWithEmptyOrders = useSelector(selectCustomersWithEmptyOrders);

  const [searchTerm, setSearchTerm] = useState("");
  const { customers, loading, error, reload } = useCustomersForAreaCache(areaId);

  const {
    activeList,
    pendingList,
    completedList,
    counts,
    hasPending,
  } = useSegmentCustomersForArea(
    customers,
    searchTerm,
    customersWithFilledOrders,
    customersWithEmptyOrders,
    customersWithPendingOrders
  );

  const showScrollTop = useScrollTopVisibility();

  const [completedCollapsed, setCompletedCollapsed] = useState(() => {
    const saved = sessionStorage.getItem(COMPLETED_COLLAPSE_KEY(areaId));
    return saved ? saved === "true" : true;
  });
  const [pendingCollapsed, setPendingCollapsed] = useState(() => {
    const saved = sessionStorage.getItem(PENDING_COLLAPSE_KEY(areaId));
    return saved ? saved === "true" : false;
  });

  useEffect(() => {
    const c = sessionStorage.getItem(COMPLETED_COLLAPSE_KEY(areaId));
    const p = sessionStorage.getItem(PENDING_COLLAPSE_KEY(areaId));
    setCompletedCollapsed(c ? c === "true" : true);
    setPendingCollapsed(p ? p === "true" : false);
  }, [areaId]);

  useEffect(() => {
    sessionStorage.setItem(
      COMPLETED_COLLAPSE_KEY(areaId),
      String(completedCollapsed)
    );
  }, [completedCollapsed, areaId]);

  useEffect(() => {
    sessionStorage.setItem(
      PENDING_COLLAPSE_KEY(areaId),
      String(pendingCollapsed)
    );
  }, [pendingCollapsed, areaId]);

  const goToRecordOrder = useCallback(
    (customerId: string, customerName: string, phone: string) => {
      dispatch(setCustomerId(customerId));
      dispatch(setCustomerName(customerName));
      dispatch(setCustomerPhoneNb(phone));
      navigate("/recordOrderforCustomer", {
        state: { isExternal: Boolean(routeState?.isExternal) },
      });
    },
    [dispatch, navigate, routeState]
  );

  return (
    <div className="cfa-page" dir="rtl">
      <CustomersForAreaConnectivityBar isOnline={isOnline} />

      {hasPending && (
        <CustomersForAreaPendingBanner
          isOnline={isOnline}
          pendingCount={pendingList.length}
        />
      )}

      <h1 className="cfa-title">{t("customersForArea.title")}</h1>

      <input
        type="search"
        className="cfa-search"
        placeholder={t("customersForArea.search.placeholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        inputMode="search"
        autoComplete="off"
        aria-label={t("customersForArea.search.placeholder")}
      />

      {loading ? (
        <CustomersForAreaSkeleton />
      ) : error ? (
        <div className="cfa-error" role="alert">
          <p className="cfa-error__text">
            {t("common.error")}: {error}
          </p>
          <button
            type="button"
            className="cfa-btn cfa-btn--primary"
            onClick={() => void reload()}
          >
            {t("customersForArea.retry")}
          </button>
        </div>
      ) : (
        <>
          <section className="cfa-section">
            <button
              type="button"
              className={`cfa-accordion-header cfa-accordion-header--pending ${
                pendingCollapsed ? "cfa-accordion-header--collapsed" : ""
              }`}
              onClick={() => setPendingCollapsed((s) => !s)}
              aria-expanded={!pendingCollapsed}
              aria-controls="cfa-pending-section"
            >
              <span className="cfa-accordion-title">
                {t("customersForArea.pending.title", {
                  count: pendingList.length,
                })}
              </span>
              <span className="cfa-accordion-arrow" aria-hidden />
            </button>
            <div
              id="cfa-pending-section"
              className={
                pendingCollapsed
                  ? "cfa-accordion-panel cfa-accordion-panel--hidden"
                  : "cfa-accordion-panel cfa-accordion-panel--visible"
              }
            >
              {pendingList.length === 0 ? (
                <p className="cfa-muted">{t("customersForArea.pending.empty")}</p>
              ) : (
                <ul className="cfa-list">
                  {pendingList.map(({ c }) => (
                    <li key={c._id} className="cfa-list__item">
                      <CustomersForAreaCustomerCard
                        customer={c}
                        variant="pending"
                        onActivate={goToRecordOrder}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="cfa-section">
            <button
              type="button"
              className={`cfa-accordion-header ${
                completedCollapsed ? "cfa-accordion-header--collapsed" : ""
              }`}
              onClick={() => setCompletedCollapsed((s) => !s)}
              aria-expanded={!completedCollapsed}
              aria-controls="cfa-completed-section"
            >
              <span className="cfa-accordion-title">
                {t("customersForArea.completed.title", {
                  total: counts.total,
                  filled: counts.filled,
                  empty: counts.empty,
                })}
              </span>
              <span className="cfa-accordion-arrow" aria-hidden />
            </button>
            <div
              id="cfa-completed-section"
              className={
                completedCollapsed
                  ? "cfa-accordion-panel cfa-accordion-panel--hidden"
                  : "cfa-accordion-panel cfa-accordion-panel--visible"
              }
            >
              {completedList.length === 0 ? (
                <p className="cfa-muted">
                  {t("customersForArea.completed.emptyText")}
                </p>
              ) : (
                <ul className="cfa-list">
                  {completedList.map(({ c, statusClass }) => (
                    <li key={c._id} className="cfa-list__item">
                      <CustomersForAreaCustomerCard
                        customer={c}
                        variant={statusClass}
                        onActivate={goToRecordOrder}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="cfa-section">
            <div className="cfa-section-head">
              <span className="cfa-section-head__title">
                {t("customersForArea.active.title", {
                  count: activeList.length,
                })}
              </span>
            </div>
            <ul className="cfa-list">
              {activeList.length > 0 ? (
                activeList.map(({ c }) => (
                  <li key={c._id} className="cfa-list__item">
                    <CustomersForAreaCustomerCard
                      customer={c}
                      variant="default"
                      onActivate={goToRecordOrder}
                    />
                  </li>
                ))
              ) : (
                <li className="cfa-list__item cfa-list__item--empty">
                  <p className="cfa-muted">{t("customersForArea.active.empty")}</p>
                </li>
              )}
            </ul>
          </section>
        </>
      )}

      {showScrollTop && <CustomersForAreaScrollTop />}
    </div>
  );
};

export default CustomersForArea;
