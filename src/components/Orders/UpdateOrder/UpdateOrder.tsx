import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import "./UpdateOrder.css";
import { API_BASE } from "../../../config/api";
import AddPaymentForm from "./AddPaymentForm/AddPaymentForm";
import OrderReceipt from "./OrderReceipt/OrderReceipt";

/** Lightweight bottom-sheet (already present) */
const PaymentSheet: React.FC<{
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title = "إضافة دفعة", onClose, children }) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-head">
          <div className="sheet-title">{title}</div>
          <button className="sheet-close" onClick={onClose} aria-label="إغلاق">
            ✕
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
};

/** Tiny centered modal */
const Modal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, children }) => (
  <div
    className="uo-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="uoModalTitle"
  >
    <div className="uo-modal__panel">
      <div className="uo-modal__head">
        <h3 id="uoModalTitle">{title}</h3>
        <button className="uo-iconBtn" onClick={onClose} aria-label="إغلاق">
          ✕
        </button>
      </div>
      <div className="uo-modal__body">{children}</div>
    </div>
  </div>
);

function UpdateOrder(): JSX.Element {
  const token = useSelector((state: any) => state.user.token);
  const isAdmin = useSelector((s: any) => s.user?.isAdmin);
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSheet, setShowSheet] = useState(false);

  // admin edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [edit, setEdit] = useState({
    delivered: "",
    returned: "",
    usd: "",
    lbp: "",
  });

  // delete confirm modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "failed");
        setOrderData(data);
      } catch (err) {
        console.error("Error:", err);
        toast.error("تعذر تحميل الطلب");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, token]);

  // current totals (for prefill)
  const usdTotal = useMemo(
    () =>
      (orderData?.payments || [])
        .filter((p: any) => p.currency === "USD")
        .reduce((s: number, p: any) => s + (p.amount || 0), 0),
    [orderData]
  );
  const lbpTotal = useMemo(
    () =>
      (orderData?.payments || [])
        .filter((p: any) => p.currency === "LBP")
        .reduce((s: number, p: any) => s + (p.amount || 0), 0),
    [orderData]
  );

  const title = useMemo(
    () =>
      orderData?.customer?.name
        ? `فاتورة: ${orderData.customer.name}`
        : "معلومات الفاتورة",
    [orderData]
  );

  const openEdit = () => {
    if (!isAdmin) return toast.warn("هذه العملية للمشرف فقط");
    setEdit({
      delivered: String(orderData?.delivered ?? ""),
      returned: String(orderData?.returned ?? ""),
      usd: String(usdTotal ?? ""),
      lbp: String(lbpTotal ?? ""),
    });
    setShowEdit(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    const body: any = {};
    const n = (v: string) => (v === "" ? undefined : Number(v));

    const d = n(edit.delivered);
    if (d !== undefined) body.delivered = d;
    const r = n(edit.returned);
    if (r !== undefined) body.returned = r;
    const u = n(edit.usd);
    if (u !== undefined) body.usdTotal = u;
    const l = n(edit.lbp);
    if (l !== undefined) body.lbpTotal = l;

    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "فشل التعديل");
      setOrderData(data);
      toast.success("تم حفظ التعديل");
      setShowEdit(false);
    } catch (err: any) {
      toast.error(err?.message || "فشل العملية");
    }
  };

  const askDelete = () => {
    if (!isAdmin) return toast.warn("هذه العملية للمشرف فقط");
    setDeleteStep(1);
    setShowDelete(true);
  };

  const performDelete = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "فشل الحذف");
      toast.success("تم حذف الطلب");
      setShowDelete(false);
      setTimeout(() => navigate(-1), 300);
    } catch (err: any) {
      toast.error(err?.message || "فشل العملية");
    }
  };

  return (
    <div className="update-order-container" dir="rtl">
      <ToastContainer position="top-right" autoClose={1200} />

      <div className="uo-header">
        <button
          className="uo-back"
          onClick={() => navigate(-1)}
          aria-label="رجوع"
        >
          ↩︎
        </button>
        <h2 className="uo-title">{title}</h2>
        <div className="uo-actions">
          <button
            className="uo-print"
            onClick={() => window.print()}
            aria-label="طباعة"
          >
            🖨️ طباعة
          </button>

          {/* Admin tools */}
          <button
            className={`uo-btn ${isAdmin ? "" : "uo-btn--disabled"}`}
            onClick={openEdit}
            disabled={!isAdmin}
            title={isAdmin ? "تعديل الطلب" : "للمشرف فقط"}
          >
            تعديل
          </button>
          <button
            className={`uo-btn uo-btn--danger ${
              isAdmin ? "" : "uo-btn--disabled"
            }`}
            onClick={askDelete}
            disabled={!isAdmin}
            title={isAdmin ? "حذف نهائي" : "للمشرف فقط"}
          >
            حذف
          </button>
        </div>
      </div>

      <OrderReceipt orderData={orderData} loading={loading} />

      {/* FAB for payments */}
      <button
        className="uo-fab"
        onClick={() => setShowSheet(true)}
        aria-label="إضافة دفعة"
      >
        +
      </button>

      {showSheet && orderId && (
        <PaymentSheet onClose={() => setShowSheet(false)}>
          <AddPaymentForm
            orderData={orderData}
            orderId={orderId}
            setOrderData={setOrderData}
            onSuccess={() => setShowSheet(false)}
          />
        </PaymentSheet>
      )}

      {/* Edit modal */}
      {showEdit && (
        <Modal title="تعديل الطلب" onClose={() => setShowEdit(false)}>
          <form className="uo-form" onSubmit={submitEdit}>
            <div className="uo-grid">
              <label className="uo-label">
                المسلّم
                <input
                  className="uo-input"
                  type="number"
                  value={edit.delivered}
                  onChange={(e) =>
                    setEdit((p) => ({ ...p, delivered: e.target.value }))
                  }
                  min={0}
                />
              </label>
              <label className="uo-label">
                المرجّع
                <input
                  className="uo-input"
                  type="number"
                  value={edit.returned}
                  onChange={(e) =>
                    setEdit((p) => ({ ...p, returned: e.target.value }))
                  }
                  min={0}
                />
              </label>
              <label className="uo-label">
                المدفوع ($)
                <input
                  className="uo-input"
                  type="number"
                  step="0.01"
                  value={edit.usd}
                  onChange={(e) =>
                    setEdit((p) => ({ ...p, usd: e.target.value }))
                  }
                  min={0}
                />
              </label>
              <label className="uo-label">
                المدفوع (ل.ل)
                <input
                  className="uo-input"
                  type="number"
                  step="1"
                  value={edit.lbp}
                  onChange={(e) =>
                    setEdit((p) => ({ ...p, lbp: e.target.value }))
                  }
                  min={0}
                />
              </label>
            </div>
            <div className="uo-modal__actions">
              <button
                type="button"
                className="uo-btn"
                onClick={() => setShowEdit(false)}
              >
                إلغاء
              </button>
              <button type="submit" className="uo-btn uo-btn--primary">
                حفظ
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete double-confirm */}
      {showDelete && (
        <Modal title="حذف الطلب" onClose={() => setShowDelete(false)}>
          {deleteStep === 1 ? (
            <>
              <p>سيتم حذف الطلب نهائيًا. هل تريد المتابعة؟</p>
              <div className="uo-modal__actions">
                <button className="uo-btn" onClick={() => setShowDelete(false)}>
                  إلغاء
                </button>
                <button
                  className="uo-btn uo-btn--danger"
                  onClick={() => setDeleteStep(2)}
                >
                  متابعة
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                <strong>تأكيد أخير:</strong> لا يمكن التراجع بعد الحذف.
              </p>
              <div className="uo-modal__actions">
                <button className="uo-btn" onClick={() => setShowDelete(false)}>
                  إلغاء
                </button>
                <button
                  className="uo-btn uo-btn--danger"
                  onClick={performDelete}
                >
                  حذف نهائي
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

export default UpdateOrder;
