// RecordOrder.tsx
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

const RecordOrder = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const companyId = useSelector((state) => state.user.companyId);

  const token = useSelector((state) => state.user.token);
  const customerId = useSelector((state) => state.order.customer_Id);
  const customerName = useSelector((state) => state.order.customer_name);
  const areaId = useSelector((state) => state.order.area_Id);
  const shipmentId = useSelector((state) => state.shipment._id);
  const productName = useSelector((state) => state.order.product_name);
  const productId = useSelector((state) => state.order.product_id);
  const productPrice = useSelector((state) => state.order.product_price);
  const pending =
    useSelector((state) => state.shipment.CustomersWithPendingOrders) || [];
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
    setForm((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
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
      dispatch(
        setShipmentPaymentsInDollars(responseData.SumOfPaymentsInDollars)
      );
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
        await fetchAndCacheCustomerInvoice(customerId, token); // 👈 added here
        if (
          !form.delivered &&
          !form.returned &&
          !form.paidUSD &&
          !form.paidLBP
        ) {
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
    }
  };

  return (
    <div className="record-order-container" style={{ direction: "rtl" }}>
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="record-order-title">🧾 تسجيل طلب: {customerName}</h1>

      <form className="record-order-form" onSubmit={handleSubmit}>
        {/* <div className="default-product-name">
          المنتج: {productName} | السعر: {productPrice} $
        </div> */}

        <div className="input-group">
          <label>📦 عدد القناني المسلّمة</label>
          <div className="input-controls">
            <button type="button" onClick={() => handleIncrement("delivered")}>
              ▲
            </button>
            <input
              type="number"
              name="delivered"
              value={form.delivered}
              onChange={handleChange}
            />
            <button type="button" onClick={() => handleDecrement("delivered")}>
              ▼
            </button>
          </div>
        </div>

        <div className="input-group">
          <label>🔁 عدد القناني المرجعة</label>
          <div className="input-controls">
            <button type="button" onClick={() => handleIncrement("returned")}>
              ▲
            </button>
            <input
              type="number"
              name="returned"
              value={form.returned}
              onChange={handleChange}
            />
            <button type="button" onClick={() => handleDecrement("returned")}>
              ▼
            </button>
          </div>
        </div>

        <div className="checkout-display">
          💰 المبلغ المطلوب: {checkout.toFixed(2)} $
        </div>

        <div className="payment-section">
          <label>💵 المدفوع بالدولار</label>
          <div className="input-controls">
            <button type="button" onClick={() => handleIncrement("paidUSD")}>
              ▲
            </button>
            <input type="text" name="paidUSD" value={form.paidUSD} />
            <button type="button" onClick={() => handleDecrement("paidUSD")}>
              ▼
            </button>
          </div>

          <label>
            💴 المدفوع بالليرة (اسحب عاموديا) <br></br>
          </label>
          <div className="picked-value-display">
            💴 المبلغ المختار: {form.paidLBP.toLocaleString()} ل.ل
          </div>

          <SevenDigitPicker onChange={handleLbpChange} />
        </div>

        <button className="record-order-button" type="submit">
          ✔️ تسجيل
        </button>
      </form>
    </div>
  );
};

export default RecordOrder;
