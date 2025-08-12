import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../UI reusables/UpdateSingleRecord/UpdateSingleRecord.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import "./UpdateOrder.css";
import AddPaymentForm from "./AddPaymentForm/AddPaymentForm";
import OrderReceipt from "./OrderReceipt/OrderReceipt";
import PaymentInfo from "./PaymentInfo/PaymentInfo";

function UpdateOrder(): JSX.Element {
  const token = useSelector((state: any) => state.user.token);
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formVisible, setFormVisible] = useState(false);

  const handleFormToggle = () => setFormVisible(!formVisible);

  const handleDeleteOrder = async (): Promise<void> => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success("تم حذف الطلب بنجاح");
        setTimeout(() => navigate("/viewOrders"), 1500);
      } else {
        toast.error("فشل حذف الطلب");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  useEffect(() => {
    fetch(`http://localhost:5000/api/orders/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrderData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, [orderId, token]);

  return (
    <div className="update-order-container" style={{ direction: "rtl" }}>
      <ToastContainer position="top-right" autoClose={1000} />
      {/* <div className="order-header"> */}
        <h2>معلومات الفاتورة</h2>
        {/* <button className="delete-button" onClick={handleDeleteOrder}>حذف الطلب</button> */}
      {/* </div> */}
      <OrderReceipt orderData={orderData} loading={loading} />
      <PaymentInfo payments={orderData?.payments} />
      <h2 className="toggle-form-title" onClick={handleFormToggle}>
        {formVisible ? "إخفاء النموذج" : "إضافة دفع جديد؟"}
      </h2>
      {formVisible && (
        <AddPaymentForm
          orderData={orderData}
          orderId={orderId}
          setOrderData={setOrderData}
        />
      )}
    </div>
  );
}

export default UpdateOrder;
