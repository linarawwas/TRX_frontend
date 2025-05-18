import React, { useState, useEffect, useCallback } from "react";
import "./RecordOrder.css";
import { toast, ToastContainer } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  addCustomerWithEmptyOrder,
  addCustomerWithFilledOrder,
  addPendingOrder,
  removePendingOrder,
  setShipmentDelivered,
  setShipmentReturned,
  setShipmentPayments,
  setShipmentPaymentsInDollars,
  setShipmentPaymentsInLiras,
} from "../../../redux/Shipment/action.js";
import {
  setProductId,
  setProductName,
  setProductPrice,
} from "../../../redux/Order/action.js";
import { useNavigate } from "react-router-dom";
import { getProductTypeFromDB, saveRequest } from "../../../utils/indexedDB";
import SevenDigitPicker from "./SevenDigitPicker";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";
import CustomerInvoices from "../../Customers/CustomerInvoices/CustomerInvoices";

const RecordOrder = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const companyId = useSelector((state) => state.user.companyId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useSelector((state) => state.user.token);
  const customerId = useSelector((state) => state.order.customer_Id);
  const customerName = useSelector((state) => state.order.customer_name);
  const areaId = useSelector((state) => state.order.area_Id);
  const shipmentId = useSelector((state) => state.shipment._id);
  const productName = useSelector((state) => state.order.product_name);
  const productId = useSelector((state) => state.order.product_id);
  const productPrice = useSelector((state) => state.order.product_price);

  const [form, setForm] = useState({
    delivered: 0,
    returned: 0,
    paidUSD: 0,
    paidLBP: 0,
  });

  useEffect(() => {
    const loadProductFromCache = async () => {
      try {
        const cachedProduct = await getProductTypeFromDB(companyId);
        if (cachedProduct) {
          dispatch(setProductId(cachedProduct.id));
          dispatch(setProductName(cachedProduct.type));
          dispatch(setProductPrice(cachedProduct.priceInDollars));
        }
      } catch (err) {
        console.error(err);
        toast.error("⚠️ خطأ في تحميل المنتج");
      }
    };
    loadProductFromCache();
  }, [companyId, dispatch]);

  const checkout = props.customerData?.hasDiscount
    ? props.customerData?.valueAfterDiscount * form.delivered
    : productPrice * form.delivered;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setForm((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    const cleanedValue = value.replace(/^0+(?!$)/, "");
    if (!isNaN(cleanedValue)) {
      setForm((prev) => ({ ...prev, [name]: parseInt(cleanedValue) }));
    }
  };

  const handleLbpChange = useCallback((val) => {
    setForm((prev) => ({ ...prev, paidLBP: val }));
  }, []);

  const handleIncrement = (field) =>
    setForm((prev) => ({
      ...prev,
      [field]: Number(prev[field]) + (field === "paidLBP" ? 1000 : 1),
    }));

  const handleDecrement = (field) =>
    setForm((prev) => ({
      ...prev,
      [field]: Math.max(
        Number(prev[field]) - (field === "paidLBP" ? 1000 : 1),
        0
      ),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payments = [];
    if (form.paidUSD > 0) {
      payments.push({
        amount: form.paidUSD,
        currency: "USD",
        exchangeRate: "6537789b6ed59ef09c18213d",
      });
    }
    if (form.paidLBP > 0) {
      payments.push({
        amount: form.paidLBP,
        currency: "LBP",
        exchangeRate: "6537789b6ed59ef09c18213d",
      });
    }

    const orderPayload = {
      delivered: form.delivered,
      returned: form.returned,
      customerid: customerId,
      productId,
      areaId,
      shipmentId,
      companyId,
      payments,
    };

    const request = {
      url: "http://localhost:5000/api/orders",
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      },
    };

    const dispatchSummary = (responseData) => {
      dispatch(setShipmentDelivered(responseData.delivered));
      dispatch(setShipmentReturned(responseData.returned));
      dispatch(setShipmentPayments(responseData.paid));
      dispatch(setShipmentPaymentsInLiras(responseData.SumOfPaymentsInLiras));
      dispatch(setShipmentPaymentsInDollars(responseData.SumOfPaymentsInDollars));
    };

    if (!navigator.onLine) {
      await saveRequest(request);
      dispatch(addPendingOrder(customerId));
      toast.info("📡 سيتم حفظ الطلب عند عودة الاتصال");
      navigate(-1);
      return;
    }

    try {
      const res = await fetch(request.url, request.options);
      const data = await res.json();
      if (res.ok) {
        dispatchSummary(data);
        dispatch(removePendingOrder(customerId));
        fetchAndCacheCustomerInvoice(customerId, token).catch((err) =>
          console.warn("⚠️ Failed to refresh invoice:", err)
        );
        if (!form.delivered && !form.returned && !form.paidUSD && !form.paidLBP) {
          dispatch(addCustomerWithEmptyOrder(customerId));
        } else {
          dispatch(addCustomerWithFilledOrder(customerId));
        }
        toast.success("✅ تم تسجيل الطلب");
        navigate(-1);
      } else {
        toast.error(`❌ ${data.message}`);
      }
    } catch (err) {
      toast.error("❌ فشل الاتصال بالشبكة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="record-order-container" style={{ direction: "rtl" }}>
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="record-order-title">🧾 تسجيل طلب: {customerName}</h1>
      <CustomerInvoices />
      <form className="record-order-form" onSubmit={handleSubmit}>
        <div className="default-product-name">المنتج: {productName} | {productPrice} $</div>

        {["delivered", "returned", "paidUSD"].map((field) => (
          <div key={field} className="input-group">
            <label>
              {field === "delivered"
                ? "📦 عدد القناني المسلّمة"
                : field === "returned"
                ? "🔁 عدد القناني المرجعة"
                : "💵 المدفوع بالدولار"}
            </label>
            <div className="input-controls">
              <button type="button" onClick={() => handleIncrement(field)}>▲</button>
              <input type="number" name={field} value={form[field]} onChange={handleChange} />
              <button type="button" onClick={() => handleDecrement(field)}>▼</button>
            </div>
          </div>
        ))}

        <div className="checkout-display">💰 المبلغ المطلوب: {checkout.toFixed(2)} $</div>

        <div className="payment-section">
          <label>💴 المدفوع بالليرة (اسحب عاموديا)</label>
          <div className="picked-value-display">
            💴 المبلغ المختار: {form.paidLBP.toLocaleString()} ل.ل
          </div>
          <SevenDigitPicker onChange={handleLbpChange} />
        </div>

        <button className="record-order-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="loading-dots">
              جاري التسجيل<span>.</span><span>.</span><span>.</span>
            </span>
          ) : (
            "✔️ تسجيل"
          )}
        </button>
      </form>
    </div>
  );
};

export default RecordOrder;