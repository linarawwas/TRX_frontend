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
import { Link, useNavigate } from "react-router-dom";
import { getProductTypeFromDB, saveRequest } from "../../../utils/indexedDB";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";
import CustomerInvoices from "../../Customers/CustomerInvoices/CustomerInvoices";

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

  // NEW: pull current shipment totals so we can increment them
  const shipmentDelivered = useSelector((s) => s.shipment.delivered) ?? 0;
  const shipmentReturned = useSelector((s) => s.shipment.returned) ?? 0;
  const shipmentUsd = useSelector((s) => s.shipment.dollarPayments) ?? 0;
  const shipmentLbp = useSelector((s) => s.shipment.liraPayments) ?? 0;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // normalize inputs
    const dDelivered = Number(form.delivered) || 0;
    const dReturned = Number(form.returned) || 0;
    const payUSD = Number(form.paidUSD) || 0;
    const payLBP = Number(form.paidLBP) || 0;

    // build payments WITHOUT exchange-rate fields
    const payments = [];
    if (payUSD > 0) payments.push({ amount: payUSD, currency: "USD" });
    if (payLBP > 0) payments.push({ amount: payLBP, currency: "LBP" });

    const orderPayload = {
      delivered: dDelivered,
      returned: dReturned,
      customerid: customerId,
      productId, // numeric code
      shipmentId, // ObjectId
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

    // ------- OFFLINE: queue + optimistic local increments -------
    if (!navigator.onLine) {
      await saveRequest(request);
      dispatch(addPendingOrder(customerId));

      // increment local shipment counters so driver sees instant feedback
      if (dDelivered)
        dispatch(setShipmentDelivered(shipmentDelivered + dDelivered));
      if (dReturned)
        dispatch(setShipmentReturned(shipmentReturned + dReturned));
      if (payUSD) dispatch(setShipmentPaymentsInDollars(shipmentUsd + payUSD));
      if (payLBP) dispatch(setShipmentPaymentsInLiras(shipmentLbp + payLBP));

      // tag the customer in lists
      if (!dDelivered && !dReturned && !payUSD && !payLBP) {
        dispatch(addCustomerWithEmptyOrder(customerId));
      } else {
        dispatch(addCustomerWithFilledOrder(customerId));
      }

      toast.info("📡 سيتم حفظ الطلب عند عودة الاتصال");
      navigate(-1);
      setIsSubmitting(false);
      return;
    }

    // ------- ONLINE: submit then increment locally -------
    try {
      const res = await fetch(request.url, request.options);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(`❌ ${data.error || data.message || "فشل إنشاء الطلب"}`);
        return;
      }

      // increment local shipment counters by the deltas we just sent
      if (dDelivered)
        dispatch(setShipmentDelivered(shipmentDelivered + dDelivered));
      if (dReturned)
        dispatch(setShipmentReturned(shipmentReturned + dReturned));
      if (payUSD) dispatch(setShipmentPaymentsInDollars(shipmentUsd + payUSD));
      if (payLBP) dispatch(setShipmentPaymentsInLiras(shipmentLbp + payLBP));

      // clean up pending state if any & refresh customer invoice cache
      dispatch(removePendingOrder(customerId));
      fetchAndCacheCustomerInvoice(customerId, token).catch(() => {});

      // mark the customer as filled/empty
      if (!dDelivered && !dReturned && !payUSD && !payLBP) {
        dispatch(addCustomerWithEmptyOrder(customerId));
      } else {
        dispatch(addCustomerWithFilledOrder(customerId));
      }

      toast.success("✅ تم تسجيل الطلب");
      navigate(-1);
    } catch {
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
      <Link to={`/updateCustomer/${customerId}`}>
        <CustomerInvoices customerId={customerId} />
      </Link>

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
