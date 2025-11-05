import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import "./Addresses.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { selectUserToken, selectUserCompanyId } from "../../../redux/selectors/user";
import { fetchCustomersByArea, reorderCustomersInArea } from "../../../features/areas/apiAreas";
import { sortCustomersBySequence } from "../../../features/areas/utils/sortCustomers";
import { t } from "../../../utils/i18n";

interface Customer {
  _id: string;
  address: string;
  name: string;
  phone: string;
  sequence?: number | null;
  isActive?: boolean;
}

export default function Addresses(): JSX.Element {
  const token = useSelector(selectUserToken);
  const companyId = useSelector(selectUserCompanyId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { areaId } = useParams<{ areaId: string }>();

  // Reorder mode
  const [reorderMode, setReorderMode] = useState(false);
  const [orderIds, setOrderIds] = useState<string[]>([]);

  // DnD refs (desktop only)
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    if (!areaId || !token) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCustomersByArea(token, areaId);
        if (cancelled) return;

        const sorted = sortCustomersBySequence(data);
        setCustomers(sorted);
        setOrderIds(sorted.map((c) => c._id));
      } catch (e) {
        if (cancelled) return;
        const err = e instanceof Error ? e.message : String(e);
        setError(err);
        console.error("Error fetching customers:", e);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [areaId, token]);

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

    try {
      await reorderCustomersInArea(token, areaId, companyId, orderIds, {
        force: true,
        startAt: 1,
      });
      toast.success(t("addresses.reorder.saveSuccess"));
      setReorderMode(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("applyReorder error:", err);
      toast.error(message || t("addresses.reorder.connectionError"));
    }
  };

  const cancelReorder = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setOrderIds(customers.map((c) => c._id));
    setReorderMode(false);
  };

  return (
    <div className="address-card-body" dir="rtl">
      <ToastContainer position="top-right" autoClose={1500} />

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
        <p className="address-card-loading" role="status" aria-live="polite">
          {t("addresses.loading")}
        </p>
      ) : error ? (
        <p className="address-card-empty" role="alert">
          {t("common.error")}: {error}
        </p>
      ) : filtered.length === 0 ? (
        <p className="address-card-empty">{t("addresses.empty")}</p>
      ) : (
        <div className={`address-card-list ${reorderMode ? "reorder" : ""}`}>
          {filtered.map((customer, i) => {
            const CardContent = (
              <>
                {reorderMode && (
                  <div className="seq-col" aria-hidden>
                    <div className="seq-num">{customer.sequence ?? "—"}</div>
                    <div className="drag-handle">≡</div>
                    <div className="move-buttons">
                      <button
                        type="button"
                        className="mv-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(customer._id, "up");
                        }}
                        aria-label={t("addresses.customer.moveUp")}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="mv-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(customer._id, "down");
                        }}
                        aria-label={t("addresses.customer.moveDown")}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                )}

                <p>
                  <span className="address-card-label">{t("addresses.customer.name")}:</span>{" "}
                  {customer.name}
                </p>
                <p>
                  <span className="address-card-label">{t("addresses.customer.phone")}:</span>{" "}
                  {customer.phone}
                </p>
                <p>
                  <span className="address-card-label">{t("addresses.customer.address")}:</span>{" "}
                  {customer.address}
                </p>
                <p>
                  <span className="address-card-label">{t("addresses.customer.status")}:</span>{" "}
                  {customer.isActive
                    ? t("addresses.customer.status.active")
                    : t("addresses.customer.status.inactive")}
                </p>

                {!reorderMode && (
                  <p className="address-card-seq">
                    <span className="address-card-label">{t("addresses.customer.sequence")}:</span>{" "}
                    {customer.sequence ?? "—"}
                  </p>
                )}
              </>
            );

            return (
              <div
                key={customer._id}
                className={`address-card ${reorderMode ? "draggable" : ""}`}
                draggable={reorderMode && !("ontouchstart" in window)}
                onDragStart={onDragStart(i)}
                onDragOver={onDragOver(i)}
                onDragEnd={onDragEnd()}
                onDrop={onDrop(i)}
                title={
                  reorderMode
                    ? t("addresses.reorder.hint")
                    : ""
                }
              >
                {reorderMode ? (
                  <div className="address-card-link">{CardContent}</div>
                ) : (
                  <Link
                    to={`/updateCustomer/${customer._id}`}
                    className="address-card-link"
                  >
                    {CardContent}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fixed save bar to guarantee clicks land */}
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

      {/* spacer so fixed bar doesn't cover content */}
      {reorderMode && <div style={{ height: 72 }} aria-hidden />}
    </div>
  );
}
