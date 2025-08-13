import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import "./UpdateOrder.css";
import AddPaymentForm from "./AddPaymentForm/AddPaymentForm";
import OrderReceipt from "./OrderReceipt/OrderReceipt";

function UpdateOrder(): JSX.Element {
  const token = useSelector((state: any) => state.user.token);
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formVisible, setFormVisible] = useState(false);

  const handleFormToggle = () => setFormVisible((v) => !v);

  const handleDeleteOrder = async (): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("تم حذف الطلب بنجاح");
        setTimeout(() => navigate("/viewOrders"), 1200);
      } else {
        const e = await response.json().catch(() => ({}));
        toast.error(e?.error || "فشل حذف الطلب");
      }
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

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
    () => (orderData?.customer?.name ? `فاتورة: ${orderData.customer.name}` : "معلومات الفاتورة"),
    [orderData]
  );

  return (
    <div className="update-order-container" dir="rtl">
      <ToastContainer position="top-right" autoClose={1200} />
      <div className="uo-header">
        <button className="uo-back" onClick={() => navigate(-1)} aria-label="رجوع">↩︎</button>
        <h2 className="uo-title">{title}</h2>
        <div className="uo-actions">
          <button className="uo-print" onClick={() => window.print()} aria-label="طباعة">🖨️ طباعة</button>
          <button className="uo-delete" onClick={handleDeleteOrder} aria-label="حذف">🗑️ حذف</button>
        </div>
      </div>

      <OrderReceipt orderData={orderData} loading={loading} />

      <h2 className="toggle-form-title" onClick={handleFormToggle}>
        {formVisible ? "إخفاء نموذج الدفع" : "إضافة دفعة جديدة؟"}
      </h2>

      {formVisible && orderId && (
        <AddPaymentForm orderData={orderData} orderId={orderId} setOrderData={setOrderData} />
      )}
    </div>
  );
}

export default UpdateOrder;
