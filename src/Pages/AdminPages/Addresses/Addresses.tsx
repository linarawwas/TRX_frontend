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
  const token: string = useSelector((state: any) => state.user.token);
  const companyId: string = useSelector((state: any) => state.user.companyId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { areaId } = useParams();

  // Reorder mode state
  const [reorderMode, setReorderMode] = useState(false);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const dragIndex = useRef<number | null>(null);
  const overIndex = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/customers/area/${areaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: Customer[] = await res.json();

        // sort by sequence (nulls last), then by name as tie-breaker
        const sorted = [...data].sort((a, b) => {
          const sa = a.sequence ?? Number.POSITIVE_INFINITY;
          const sb = b.sequence ?? Number.POSITIVE_INFINITY;
          if (sa !== sb) return sa - sb;
          return (a.name || "").localeCompare(b.name || "", "ar");
        });

        setCustomers(sorted);
        setOrderIds(sorted.map((c) => c._id));
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [areaId, token]);

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const base = customers;
    const list = q
      ? base.filter((c) => (c.name || "").toLowerCase().includes(q))
      : base;
    return list;
  }, [customers, searchTerm]);

  // ---- DnD handlers (HTML5, no libs) ----
  const onDragStart = (index: number) => (e: React.DragEvent) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  };

  const onDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    overIndex.current = index;
    e.dataTransfer.dropEffect = "move";
  };

  const onDragEnd = (index: number) => (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
  };

  const onDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const from = dragIndex.current;
    const to = index;
    dragIndex.current = null;
    overIndex.current = null;
    if (from == null || to == null || from === to) return;

    // reorder orderIds according to visible list
    const visibleIds = filteredCustomers.map((c) => c._id);
    const full = [...orderIds];

    // we need to move the item in the full array based on positions within the visible subset
    const movingId = visibleIds[from];
    if (!movingId) return;

    // remove from full
    const fromFull = full.indexOf(movingId);
    if (fromFull === -1) return;
    full.splice(fromFull, 1);

    // find target id in visible, then position in full
    const targetId = visibleIds[to];
    let toFull = targetId ? full.indexOf(targetId) : -1;

    if (toFull === -1) {
      // dropping past the last visible -> place at end
      full.push(movingId);
    } else {
      // insert before target (feel free to change to after)
      full.splice(toFull, 0, movingId);
    }

    setOrderIds(full);

    // also update customers array for immediate visual feedback
    const nextCustomers = [...customers];
    const fromIdxInCustomers = nextCustomers.findIndex((c) => c._id === movingId);
    nextCustomers.splice(fromIdxInCustomers, 1);
    if (!targetId) {
      nextCustomers.push(customers.find((c) => c._id === movingId)!);
    } else {
      const toIdxInCustomers = nextCustomers.findIndex((c) => c._id === targetId);
      nextCustomers.splice(toIdxInCustomers, 0, customers.find((c) => c._id === movingId)!);
    }
    setCustomers(nextCustomers);
  };

  const applyReorder = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/areas/${areaId}/reorder?companyId=${companyId}`,
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
      // refresh to pick up new sequence numbers from server
      // (we could avoid this since we already have the order, but good to sync)
      const fresh = await fetch(`http://localhost:5000/api/customers/area/${areaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const freshData: Customer[] = await fresh.json();
      const sorted = [...freshData].sort((a, b) => {
        const sa = a.sequence ?? Number.POSITIVE_INFINITY;
        const sb = b.sequence ?? Number.POSITIVE_INFINITY;
        if (sa !== sb) return sa - sb;
        return (a.name || "").localeCompare(b.name || "", "ar");
      });
      setCustomers(sorted);
      setOrderIds(sorted.map((c) => c._id));
    } catch (e: any) {
      toast.error(e?.message || "تعذر الاتصال");
    }
  };

  const cancelReorder = () => {
    // rebuild orderIds from current customers
    setOrderIds(customers.map((c) => c._id));
    setReorderMode(false);
  };

  return (
    <div className="address-card-body" dir="rtl">
      <ToastContainer position="top-right" autoClose={1000} />

      <div className="address-card-header">
        <h2 className="address-card-title">عناوين الزبائن</h2>

        <div className="address-toolbar">
          <input
            type="text"
            placeholder="بحث بالاسم"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="address-card-search-bar"
            disabled={reorderMode} /* lock search during reorder to avoid confusion */
          />
          <button
            className={`reorder-toggle ${reorderMode ? "on" : ""}`}
            onClick={() => setReorderMode((v) => !v)}
          >
            {reorderMode ? "إنهاء إعادة الترتيب" : "إعادة الترتيب"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="address-card-loading">جارٍ التحميل...</p>
      ) : filteredCustomers.length === 0 ? (
        <p className="address-card-empty">لا يوجد زبائن بهذه المواصفات</p>
      ) : (
        <div className={`address-card-list ${reorderMode ? "reorder" : ""}`}>
          {filteredCustomers.map((customer, i) => (
            <div
              key={customer._id}
              className={`address-card ${reorderMode ? "draggable" : ""}`}
              draggable={reorderMode}
              onDragStart={onDragStart(i)}
              onDragOver={onDragOver(i)}
              onDragEnd={onDragEnd(i)}
              onDrop={onDrop(i)}
              title={reorderMode ? "اسحب لإعادة الترتيب" : ""}
            >
              {/* sequence + handle in reorder mode */}
              {reorderMode && (
                <div className="seq-col">
                  <div className="seq-num">{customer.sequence ?? "—"}</div>
                  <div className="drag-handle" aria-hidden>≡</div>
                </div>
              )}

              <Link to={`/updateCustomer/${customer._id}`} className="address-card-link">
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
                {!reorderMode && (
                  <p className="address-card-seq">
                    <span className="address-card-label">الترتيب:</span>{" "}
                    {customer.sequence ?? "—"}
                  </p>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* sticky apply/cancel when in reorder mode */}
      {reorderMode && (
        <div className="apply-bar" role="region" aria-live="polite">
          <div className="apply-hint">اسحب البطاقات لترتيبها ثم اضغط حفظ</div>
          <div className="apply-actions">
            <button className="btn-cancel" onClick={cancelReorder}>إلغاء</button>
            <button className="btn-apply" onClick={applyReorder}>حفظ الترتيب</button>
          </div>
        </div>
      )}
    </div>
  );
}
