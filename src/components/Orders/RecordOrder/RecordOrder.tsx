import React, { useState, useEffect, useCallback } from "react";
import "./RecordOrder.css";
import { toast, ToastContainer } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import LbpKeypad from "./LbpKeypad";

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
import SevenDigitPicker from "./LbpKeypad";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";
import CustomerInvoices from "../../Customers/CustomerInvoices/CustomerInvoices";
import axios from "axios"; // NEW

const RecordOrder = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const companyId = useSelector((s) => s.user.companyId);
  const token = useSelector((s) => s.user.token);
  const customerId = useSelector((s) => s.order.customer_Id);
  const customerName = useSelector((s) => s.order.customer_name);
  const customerPhone = useSelector((s) => s.order.customer_phone); // make sure you store this
  const areaId = useSelector((s) => s.order.area_Id);
  const shipmentId = useSelector((s) => s.shipment._id);
  const productName = useSelector((s) => s.order.product_name);
  const productId = useSelector((s) => s.order.product_id);
  const productPrice = useSelector((s) => s.order.product_price);
  const [showLbpPad, setShowLbpPad] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    delivered: 0,
    returned: 0,
    paidUSD: 0,
    paidLBP: 0,
  });

  /* ---------- cache default product ---------- */
  useEffect(() => {
    (async () => {
      try {
        const cached = await getProductTypeFromDB(companyId);
        if (cached) {
          dispatch(setProductId(cached.id));
          dispatch(setProductName(cached.type));
          dispatch(setProductPrice(cached.priceInDollars));
        }
      } catch (err) {
        console.error(err);
        toast.error("⚠️ خطأ في تحميل المنتج");
      }
    })();
  }, [companyId, dispatch]);

  /* ---------- helpers ---------- */
  const checkout = props.customerData?.hasDiscount
    ? props.customerData?.valueAfterDiscount * form.delivered
    : productPrice * form.delivered;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setForm((p) => ({ ...p, [name]: "" }));
      return;
    }
    const cleaned = value.replace(/^0+(?!$)/, "");
    if (!isNaN(cleaned)) setForm((p) => ({ ...p, [name]: parseInt(cleaned) }));
  };

  const handleLbpChange = useCallback(
    (val) => setForm((p) => ({ ...p, paidLBP: val })),
    []
  );

  const inc = (field) =>
    setForm((p) => ({
      ...p,
      [field]: Number(p[field]) + (field === "paidLBP" ? 1000 : 1),
    }));
  const dec = (field) =>
    setForm((p) => ({
      ...p,
      [field]: Math.max(Number(p[field]) - (field === "paidLBP" ? 1000 : 1), 0),
    }));

  /* ---------- main submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    /* build payments payload */
    const payments = [];
    if (form.paidUSD > 0)
      payments.push({
        amount: form.paidUSD,
        currency: "USD",
        exchangeRate: "6878aa9ac9f1a18731a5b8a4",
      });
    if (form.paidLBP > 0)
      payments.push({
        amount: form.paidLBP,
        currency: "LBP",
        exchangeRate: "6878aa9ac9f1a18731a5b8a4",
      });

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

    /* inner helper to update Redux numbers */
    const dispatchSummary = (d) => {
      dispatch(setShipmentDelivered(d.delivered));
      dispatch(setShipmentReturned(d.returned));
      dispatch(setShipmentPayments(d.paid));
      dispatch(setShipmentPaymentsInLiras(d.SumOfPaymentsInLiras));
      dispatch(setShipmentPaymentsInDollars(d.SumOfPaymentsInDollars));
    };

    /* OFFLINE branch ---------------------------------------------------- */
    if (!navigator.onLine) {
      await saveRequest(request);
      dispatch(addPendingOrder(customerId));
      toast.info("📡 سيتم حفظ الطلب عند عودة الاتصال");
      /* OPTION: you could also queue a WhatsApp job for your backend here */
      navigate(-1);
      return;
    }

    /* ONLINE branch ----------------------------------------------------- */
    try {
      const res = await fetch(request.url, request.options);
      const data = await res.json();

      if (res.ok) {
        dispatchSummary(data);
        dispatch(removePendingOrder(customerId));
        fetchAndCacheCustomerInvoice(customerId, token).catch((err) =>
          console.warn("⚠️ Failed to refresh invoice:", err)
        );

        /* mark customer in shipment lists */
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
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Render UI (unchanged) ---------------- */
  return (
    <div className="record-order-container" style={{ direction: "rtl" }}>
      <ToastContainer position="top-right" autoClose={2000} />

      <header className="roc-header">
        <h2 className="roc-title">{customerName}</h2>
        <div className="roc-product">
          المنتج: {productName} • {productPrice}$
        </div>
      </header>

      {/* compact summary pill (optional) */}
      <CustomerInvoices customerId={customerId} />

      <form className="roc-grid" onSubmit={handleSubmit}>
        {/* Steppers row */}
        <div className="roc-steppers">
          {["delivered", "returned", "paidUSD"].map((field) => (
            <div key={field} className="roc-stepper">
              <div className="roc-stepper-label">
                {field === "delivered"
                  ? "المسلّمة"
                  : field === "returned"
                  ? "المرجعة"
                  : "الدولار"}
              </div>
              <div className="roc-stepper-ctrl">
                <button
                  type="button"
                  onClick={() => dec(field)}
                  aria-label="طرح"
                >
                  −
                </button>
                <input
                  type="number"
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <button
                  type="button"
                  onClick={() => inc(field)}
                  aria-label="إضافة"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout line */}
        <div className="roc-checkout">
          <span>المطلوب:</span>
          <strong>{checkout.toFixed(2)} $</strong>
        </div>

        {/* LBP quick input */}
        <div className="roc-lbp">
          <label className="roc-lbp-label">المدفوع بالليرة</label>
          <button
            type="button"
            className="roc-lbp-field"
            onClick={() => setShowLbpPad(true)}
            aria-label="إدخال المبلغ بالليرة"
          >
            {form.paidLBP ? form.paidLBP.toLocaleString() : "—"} ل.ل
          </button>

          {/* quick chips visible inline for + common amounts */}
          <div className="roc-chip-row">
            {[1000, 10000, 50000, 100000].map((v) => (
              <button
                type="button"
                key={v}
                className="roc-chip"
                onClick={() => handleLbpChange(form.paidLBP + v)}
              >
                +{v.toLocaleString()}
              </button>
            ))}
            <button
              type="button"
              className="roc-chip roc-chip-clear"
              onClick={() => handleLbpChange(0)}
            >
              مسح
            </button>
          </div>
        </div>

        {/* sticky submit */}
        <div className="roc-submit">
          <button
            className="record-order-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading-dots">
                جاري التسجيل<span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            ) : (
              "تسجيل ✔️"
            )}
          </button>
        </div>
      </form>

      {/* LBP keypad bottom sheet */}
      <LbpKeypad
        open={showLbpPad}
        initialValue={form.paidLBP}
        onClose={() => setShowLbpPad(false)}
        onConfirm={(val) => {
          handleLbpChange(val);
          setShowLbpPad(false);
        }}
      />
    </div>
  );
};

export default RecordOrder;
