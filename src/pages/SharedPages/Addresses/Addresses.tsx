import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import "./Addresses.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

interface Customer {
  _id: string;
  address: string;
  name: string;
  phone: string;
  sequence?: number | null;
}

export default function Addresses(): JSX.Element {
  const token: string = useSelector((s: any) => s.user.token);
  const companyId: string = useSelector((s: any) => s.user.companyId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { areaId } = useParams();

  // Reorder mode
  const [reorderMode, setReorderMode] = useState(false);
  const [orderIds, setOrderIds] = useState<string[]>([]);

  // DnD refs (desktop only)
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://trx-api.linarawas.com/api/customers/area/${areaId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data: Customer[] = await res.json();

        // Order by sequence (nulls last) then name
        const sorted = [...data].sort((a, b) => {
          const sa = a.sequence ?? Number.POSITIVE_INFINITY;
          const sb = b.sequence ?? Number.POSITIVE_INFINITY;
          if (sa !== sb) return sa - sb;
          return (a.name || "").localeCompare(b.name || "", "ar");
        });

        setCustomers(sorted);
        setOrderIds(sorted.map((c) => c._id));
      } catch (e) {
        console.error("Error fetching customers:", e);
      } finally {
        setLoading(false);
      }
    })();
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
      toast.error("بيانات غير مكتملة (areaId/companyId)");
      return;
    }

    try {
      const res = await fetch(
        `https://trx-api.linarawas.com/api/areas/${areaId}/reorder?companyId=${companyId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderedCustomerIds: orderIds,
            force: true,
            startAt: 1,
          }),
        }
      );
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        toast.error(data?.error || "فشل حفظ الترتيب");
        return;
      }
      toast.success("تم حفظ الترتيب الجديد");
      setReorderMode(false);
    } catch (err: any) {
      console.error("applyReorder error:", err);
      toast.error(err?.message || "تعذر الاتصال");
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
        <h2 className="address-card-title">عناوين الزبائن</h2>

        <div className="address-toolbar">
          <input
            type="text"
            placeholder="بحث بالاسم"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="address-card-search-bar"
            disabled={reorderMode}
          />
          <button
            type="button"
            className={`reorder-toggle ${reorderMode ? "on" : ""}`}
            onClick={() => setReorderMode((v) => !v)}
          >
            {reorderMode ? "إنهاء إعادة الترتيب" : "إعادة الترتيب"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="address-card-loading">جارٍ التحميل...</p>
      ) : filtered.length === 0 ? (
        <p className="address-card-empty">لا يوجد زبائن بهذه المواصفات</p>
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
                        onClick={(e) => (
                          e.stopPropagation(), moveItem(customer._id, "up")
                        )}
                        aria-label="تحريك لأعلى"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="mv-btn"
                        onClick={(e) => (
                          e.stopPropagation(), moveItem(customer._id, "down")
                        )}
                        aria-label="تحريك لأسفل"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                )}

                <p>
                  <span className="address-card-label">الاسم:</span>{" "}
                  {customer.name}
                </p>
                <p>
                  <span className="address-card-label">الهاتف:</span>{" "}
                  {customer.phone}
                </p>
                <p>
                  <span className="address-card-label">العنوان:</span>{" "}
                  {customer.address}
                </p>
                <p>
                  <span className="address-card-label">الحالة:</span>{" "}
                  {customer.isActive ? "نشط" : "غير نشط"}
                </p>

                {!reorderMode && (
                  <p className="address-card-seq">
                    <span className="address-card-label">الترتيب:</span>{" "}
                    {customer.sequence ?? "—"}
                  </p>
                )}
              </>
            );

            return (
              <div
                key={customer._id}
                className={`address-card ${reorderMode ? "draggable" : ""}`}
                draggable={reorderMode && !("ontouchstart" in window)} // disable native DnD on touch
                onDragStart={onDragStart(i)}
                onDragOver={onDragOver(i)}
                onDragEnd={onDragEnd()}
                onDrop={onDrop(i)}
                title={
                  reorderMode
                    ? "اسحب (سطح مكتب) أو استخدم الأسهم لإعادة الترتيب"
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
          <div className="apply-hint">رتّب البطاقات ثم اضغط حفظ</div>
          <div className="apply-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={cancelReorder}
            >
              إلغاء
            </button>
            <button type="submit" className="btn-apply">
              حفظ الترتيب
            </button>
          </div>
        </form>
      )}

      {/* spacer so fixed bar doesn't cover content */}
      {reorderMode && <div style={{ height: 72 }} aria-hidden />}
    </div>
  );
}
