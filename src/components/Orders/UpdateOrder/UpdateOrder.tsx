import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import "./UpdateOrder.css";
import AddPaymentForm from "./AddPaymentForm/AddPaymentForm";
import OrderReceipt from "./OrderReceipt/OrderReceipt";
/** Lightweight bottom-sheet */
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
          <button className="sheet-close" onClick={onClose} aria-label="إغلاق">✕</button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
};

function UpdateOrder(): JSX.Element {
  const token = useSelector((state: any) => state.user.token);
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
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

  const title = useMemo(
    () =>
      orderData?.customer?.name
        ? `فاتورة: ${orderData.customer.name}`
        : "معلومات الفاتورة",
    [orderData]
  );

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
        </div>
      </div>

      <OrderReceipt orderData={orderData} loading={loading} />

      {/* Floating action button */}
      <button
        className="uo-fab"
        onClick={() => setShowSheet(true)}
        aria-label="إضافة دفعة"
      >
        +
      </button>

      {/* Bottom sheet */}
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
    </div>
  );
}

export default UpdateOrder;
