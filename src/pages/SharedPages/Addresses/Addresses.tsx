import React, { useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import "./Addresses.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { selectUserToken, selectUserCompanyId } from "../../../redux/selectors/user";
import { reorderCustomersInArea } from "../../../features/areas/apiAreas";
import { t } from "../../../utils/i18n";
import { createLogger } from "../../../utils/logger";
import { useAddressesAreaCustomers } from "./hooks/useAddressesAreaCustomers";
import { AddressesPageSkeleton } from "./components/AddressesPageSkeleton";

const logger = createLogger("addresses-reorder");

export default function Addresses(): JSX.Element {
  const token = useSelector(selectUserToken);
  const companyId = useSelector(selectUserCompanyId);
  const [searchTerm, setSearchTerm] = useState("");
  const { areaId } = useParams<{ areaId: string }>();

  const {
    customers,
    setCustomers,
    orderIds,
    setOrderIds,
    loading,
    error,
    reload,
  } = useAddressesAreaCustomers(areaId, token);

  // Reorder mode
  const [reorderMode, setReorderMode] = useState(false);

  // DnD refs (desktop only)
  const dragIndex = useRef<number | null>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return q
      ? customers.filter((c) => (c.name || "").toLowerCase().includes(q))
      : customers;
  }, [customers, searchTerm]);

  /* ---------- DnD (desktop) ---------- */
  const onDragStart = (visibleIdx: number) => (e: React.DragEvent) => {
    if (!reorderMode) return;
    dragIndex.current = visibleIdx;
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).classList.add("dragging");
  };
  const onDragOver = (visibleIdx: number) => (e: React.DragEvent) => {
    if (!reorderMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onDragEnd = () => (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("dragging");
  };
  const onDrop = (visibleIdx: number) => (e: React.DragEvent) => {
    if (!reorderMode) return;
    e.preventDefault();
    const from = dragIndex.current;
    if (from == null || from === visibleIdx) return;

    // map visible indices to ids
    const visibleIds = filtered.map((c) => c._id);
    const movingId = visibleIds[from];
    const targetId = visibleIds[visibleIdx];
    if (!movingId) return;

    setOrderIds((prev) => {
      const full = [...prev];
      const fromFull = full.indexOf(movingId);
      if (fromFull === -1) return prev;
      full.splice(fromFull, 1);
      const toFull = full.indexOf(targetId);
      if (toFull === -1) full.push(movingId);
      else full.splice(toFull, 0, movingId);
      return full;
    });

    setCustomers((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((c) => c._id === movingId);
      const [item] = arr.splice(fromIdx, 1);
      if (!targetId) arr.push(item);
      else {
        const toIdx = arr.findIndex((c) => c._id === targetId);
        arr.splice(toIdx, 0, item);
      }
      return arr;
    });

    dragIndex.current = null;
  };

  /* ---------- Mobile-friendly controls (Up/Down) ---------- */
  const moveItem = (id: string, dir: "up" | "down") => {
    setOrderIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const newIdx =
        dir === "up"
          ? Math.max(0, idx - 1)
          : Math.min(prev.length - 1, idx + 1);
      if (newIdx === idx) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      next.splice(newIdx, 0, id);
      return next;
    });
    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c._id === id);
      if (idx < 0) return prev;
      const newIdx =
        dir === "up"
          ? Math.max(0, idx - 1)
          : Math.min(prev.length - 1, idx + 1);
      if (newIdx === idx) return prev;
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      arr.splice(newIdx, 0, item);
      return arr;
    });
  };

  /* ---------- Apply / Cancel ---------- */
  const applyReorder = async (e?: React.MouseEvent | React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!areaId || !companyId) {
      toast.error(t("addresses.reorder.incompleteData"));
      return;
    }

    const result = await reorderCustomersInArea(token, areaId, companyId, orderIds, {
      force: true,
      startAt: 1,
    });
    if (result.error) {
      logger.error("reorderCustomersInArea failed", {
        areaId,
        message: result.error,
      });
      toast.error(result.error || t("addresses.reorder.connectionError"));
      return;
    }
    toast.success(t("addresses.reorder.saveSuccess"));
    setReorderMode(false);
  };

  const cancelReorder = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setOrderIds(customers.map((c) => c._id));
    setReorderMode(false);
  };

  return (
    <div className="addresses-page addresses-page--shell" dir="rtl" lang="ar">
      <div className="addresses-page__glow" aria-hidden />
      <div className="addresses-page__inner">
        <ToastContainer position="top-right" autoClose={1500} />

        <div className="addresses-page__surface">
          <div className="address-card-body">
            <div className="address-card-header">
              <h2 className="address-card-title">{t("addresses.title")}</h2>

              <div className="address-toolbar">
                <input
                  type="text"
                  placeholder={t("addresses.search.placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="address-card-search-bar"
                  disabled={reorderMode}
                  aria-label={t("addresses.search.placeholder")}
                />
                <button
                  type="button"
                  className={`reorder-toggle ${reorderMode ? "on" : ""}`}
                  onClick={() => setReorderMode((v) => !v)}
                  aria-pressed={reorderMode}
                >
                  {reorderMode ? t("addresses.reorder.end") : t("addresses.reorder.toggle")}
                </button>
              </div>
            </div>

            {loading ? (
              <AddressesPageSkeleton />
            ) : error ? (
              <div className="addresses-error-panel" role="alert">
                <p className="addresses-error-panel__text">
                  {t("common.error")}: {error}
                </p>
                <button
                  type="button"
                  className="addresses-error-panel__retry"
                  onClick={() => void reload()}
                >
                  {t("addresses.areas.retry")}
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <p className="address-card-empty">{t("addresses.empty")}</p>
            ) : (
              <div className={`address-card-list ${reorderMode ? "address-card-list--reorder" : ""}`}>
                {reorderMode && (
                  <div className="addresses-reorder-banner" role="status">
                    <span className="addresses-reorder-banner__icon" aria-hidden>
                      ↕
                    </span>
                    <span className="addresses-reorder-banner__text">
                      {t("addresses.reorder.hint")}
                    </span>
                  </div>
                )}
                {filtered.map((customer, i) => {
                  const posInOrder = orderIds.indexOf(customer._id);
                  const pinValue =
                    reorderMode && posInOrder >= 0
                      ? String(posInOrder + 1)
                      : customer.sequence != null
                        ? String(customer.sequence)
                        : "—";

                  const mainBlock = (
                    <div className="address-card__main">
                      <div className="address-card__name">{customer.name}</div>
                      <div className="address-card__address">{customer.address}</div>
                      <div
                        className={`address-card__status-pill ${
                          customer.isActive
                            ? "address-card__status-pill--active"
                            : "address-card__status-pill--inactive"
                        }`}
                      >
                        {customer.isActive
                          ? t("addresses.customer.status.active")
                          : t("addresses.customer.status.inactive")}
                      </div>
                    </div>
                  );

                  const pinBlock = (
                    <div
                      className={`address-card__pin ${reorderMode ? "address-card__pin--draft" : ""}`}
                      title={t("addresses.customer.sequence")}
                    >
                      <span className="address-card__pin-value">{pinValue}</span>
                    </div>
                  );

                  const toolsBlock = reorderMode ? (
                    <div className="address-card__tools">
                      <div className="address-card__drag" aria-hidden>
                        ⋮⋮
                      </div>
                      <div className="address-card__step-btns">
                        <button
                          type="button"
                          className="address-card__step-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            moveItem(customer._id, "up");
                          }}
                          aria-label={t("addresses.customer.moveUp")}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="address-card__step-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            moveItem(customer._id, "down");
                          }}
                          aria-label={t("addresses.customer.moveDown")}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ) : null;

                  const inner = (
                    <>
                      {pinBlock}
                      {mainBlock}
                      {toolsBlock}
                    </>
                  );

                  return (
                    <div
                      key={customer._id}
                      className={`address-card address-card--row ${reorderMode ? "address-card--draggable" : ""}`}
                      draggable={reorderMode && !("ontouchstart" in window)}
                      onDragStart={onDragStart(i)}
                      onDragOver={onDragOver(i)}
                      onDragEnd={onDragEnd()}
                      onDrop={onDrop(i)}
                      title={reorderMode ? t("addresses.reorder.hint") : undefined}
                    >
                      {reorderMode ? (
                        <div className="address-card__inner">{inner}</div>
                      ) : (
                        <Link
                          to={`/updateCustomer/${customer._id}`}
                          className="address-card__inner address-card__inner--link"
                        >
                          {inner}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {reorderMode && (
              <div style={{ height: 72 }} aria-hidden />
            )}
          </div>
        </div>
      </div>

      {reorderMode && (
        <form className="apply-bar" onSubmit={applyReorder}>
          <div className="apply-hint">{t("addresses.reorder.hint")}</div>
          <div className="apply-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={cancelReorder}
            >
              {t("addresses.reorder.cancel")}
            </button>
            <button type="submit" className="btn-apply">
              {t("addresses.reorder.apply")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
