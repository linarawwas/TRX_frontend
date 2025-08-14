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
  const shipmentId = useSelector((s) => s.shipment._id);

  const productName = useSelector((s) => s.order.product_name);
  const productId = useSelector((s) => s.order.product_id);
  const productPrice = useSelector((s) => s.order.product_price);

  // Shipment totals (for incremental updates)
  const shipmentDelivered = useSelector((s) => s.shipment.delivered) ?? 0;
  const shipmentReturned  = useSelector((s) => s.shipment.returned) ?? 0;
  const shipmentUsd       = useSelector((s) => s.shipment.dollarPayments) ?? 0;
  const shipmentLbp       = useSelector((s) => s.shipment.liraPayments) ?? 0;

  // Target enforcement
  const target            = useSelector((s) => s.shipment.target) ?? 0;
  const remaining         = Math.max(0, (target || 0) - (shipmentDelivered || 0));

  const [showLbpPad, setShowLbpPad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overModal, setOverModal] = useState(null); // { want: number } | null

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
    ? (props.customerData?.valueAfterDiscount || 0) * (Number(form.delivered) || 0)
    : (productPrice || 0) * (Number(form.delivered) || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (value === "") {
      setForm((p) => ({ ...p, [name]: "" }));
      return;
    }

    // keep numeric only, strip leading zeros
    const cleaned = String(value).replace(/^0+(?!$)/, "");
    if (isNaN(cleaned)) return;

    let next = parseInt(cleaned, 10);

    if (name === "delivered") {
      // clamp to remaining
      next = Math.max(0, Math.min(next, remaining));
    }

    setForm((p) => ({ ...p, [name]: next }));
  };

  const handleLbpChange = useCallback(
    (val) => setForm((p) => ({ ...p, paidLBP: val })),
    []
  );

  const inc = (field) =>
    setForm((p) => {
      const step = field === "paidLBP" ? 1000 : 1;
      let next = Number(p[field] || 0) + step;
      if (field === "delivered") next = Math.min(next, remaining);
      return { ...p, [field]: Math.max(0, next) };
    });

  const dec = (field) =>
    setForm((p) => {
      const step = field === "paidLBP" ? 1000 : 1;
      return { ...p, [field]: Math.max(0, Number(p[field] || 0) - step) };
    });

  const actuallySubmit = async (payload) => {
    const request = {
      url: "http://localhost:5000/api/orders",
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    };

    // ------- OFFLINE: queue + optimistic local increments -------
    if (!navigator.onLine) {
      await saveRequest(request);
      dispatch(addPendingOrder(customerId));

      if (payload.delivered)
        dispatch(setShipmentDelivered(shipmentDelivered + payload.delivered));
      if (payload.returned)
        dispatch(setShipmentReturned(shipmentReturned + payload.returned));

      const sumUSD = (payload.payments || [])
        .filter((p) => p.currency === "USD")
        .reduce((s, p) => s + (p.amount || 0), 0);
      const sumLBP = (payload.payments || [])
        .filter((p) => p.currency === "LBP")
        .reduce((s, p) => s + (p.amount || 0), 0);

      if (sumUSD) dispatch(setShipmentPaymentsInDollars(shipmentUsd + sumUSD));
      if (sumLBP) dispatch(setShipmentPaymentsInLiras(shipmentLbp + sumLBP));

      if (!payload.delivered && !payload.returned && !sumUSD && !sumLBP) {
        dispatch(addCustomerWithEmptyOrder(customerId));
      } else {
        dispatch(addCustomerWithFilledOrder(customerId));
      }

      toast.info("📡 سيتم حفظ الطلب عند عودة الاتصال");
      navigate(-1);
      return;
    }

    // ------- ONLINE -------
    const res = await fetch(request.url, request.options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast.error(`❌ ${data.error || data.message || "فشل إنشاء الطلب"}`);
      return;
    }

    if (payload.delivered)
      dispatch(setShipmentDelivered(shipmentDelivered + payload.delivered));
    if (payload.returned)
      dispatch(setShipmentReturned(shipmentReturned + payload.returned));

    const sumUSD = (payload.payments || [])
      .filter((p) => p.currency === "USD")
      .reduce((s, p) => s + (p.amount || 0), 0);
    const sumLBP = (payload.payments || [])
      .filter((p) => p.currency === "LBP")
      .reduce((s, p) => s + (p.amount || 0), 0);

    if (sumUSD) dispatch(setShipmentPaymentsInDollars(shipmentUsd + sumUSD));
    if (sumLBP) dispatch(setShipmentPaymentsInLiras(shipmentLbp + sumLBP));

    dispatch(removePendingOrder(customerId));
    fetchAndCacheCustomerInvoice(customerId, token).catch(() => {});

    if (!payload.delivered && !payload.returned && !sumUSD && !sumLBP) {
      dispatch(addCustomerWithEmptyOrder(customerId));
    } else {
      dispatch(addCustomerWithFilledOrder(customerId));
    }

    toast.success("✅ تم تسجيل الطلب");
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // normalize inputs
    const dDelivered = Number(form.delivered) || 0;
    const dReturned  = Number(form.returned)  || 0;
    const payUSD     = Number(form.paidUSD)   || 0;
    const payLBP     = Number(form.paidLBP)   || 0;

    // if target reached or user tried > remaining → show modal
    if (target > 0 && (remaining === 0 ? dDelivered > 0 : dDelivered > remaining)) {
      setOverModal({ want: dDelivered });
      return;
    }

    setIsSubmitting(true);

    const payments = [];
    if (payUSD > 0) payments.push({ amount: payUSD, currency: "USD" });
    if (payLBP > 0) payments.push({ amount: payLBP, currency: "LBP" });

    const orderPayload = {
      delivered: dDelivered,
      returned: dReturned,
      customerid: customerId,
      productId,      // numeric code
      shipmentId,     // ObjectId
      payments,
    };

    try {
      await actuallySubmit(orderPayload);
    } catch {
      toast.error("❌ فشل الاتصال بالشبكة");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Render UI ---------------- */
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
          {/* Delivered */}
          <div className="roc-stepper">
            <div className="roc-stepper-label">المسلّمة</div>
            <div className="roc-stepper-ctrl">
              <button type="button" onClick={() => dec("delivered")} aria-label="طرح">−</button>
              <input
                type="number"
                name="delivered"
                value={form.delivered}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button type="button" onClick={() => inc("delivered")} aria-label="إضافة">+</button>
            </div>
            <div className={`roc-hint ${remaining === 0 ? "locked" : ""}`}>
              المتبقي في هذه الشحنة: <strong>{remaining}</strong> {remaining === 0 && <>• <span className="lock">مغلق</span></>}
            </div>
          </div>

          {/* Returned */}
          <div className="roc-stepper">
            <div className="roc-stepper-label">المرجعة</div>
            <div className="roc-stepper-ctrl">
              <button type="button" onClick={() => dec("returned")} aria-label="طرح">−</button>
              <input
                type="number"
                name="returned"
                value={form.returned}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button type="button" onClick={() => inc("returned")} aria-label="إضافة">+</button>
            </div>
          </div>

          {/* USD */}
          <div className="roc-stepper">
            <div className="roc-stepper-label">الدولار</div>
            <div className="roc-stepper-ctrl">
              <button type="button" onClick={() => dec("paidUSD")} aria-label="طرح">−</button>
              <input
                type="number"
                name="paidUSD"
                value={form.paidUSD}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button type="button" onClick={() => inc("paidUSD")} aria-label="إضافة">+</button>
            </div>
          </div>
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
            {form.paidLBP ? Number(form.paidLBP).toLocaleString() : "—"} ل.ل
          </button>

          <div className="roc-chip-row">
            {[1000, 10000, 50000, 100000].map((v) => (
              <button
                type="button"
                key={v}
                className="roc-chip"
                onClick={() => handleLbpChange((Number(form.paidLBP) || 0) + v)}
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
          <button className="record-order-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="loading-dots">
                جاري التسجيل<span>.</span><span>.</span><span>.</span>
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
        initialValue={Number(form.paidLBP) || 0}
        onClose={() => setShowLbpPad(false)}
        onConfirm={(val) => {
          handleLbpChange(val);
          setShowLbpPad(false);
        }}
      />

      {/* Over-target modal */}
      {overModal && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-card" dir="rtl">
            <h3 className="confirm-title">تجاوز الهدف غير مسموح</h3>
            <div className="confirm-body">
              <p>الهدف لهذه الشحنة: <strong>{target}</strong></p>
              <p>المسلّم حتى الآن: <strong>{shipmentDelivered}</strong></p>
              <p>المتبقي: <strong>{remaining}</strong></p>
              <p>طلبت تسليم: <strong>{overModal.want}</strong></p>
              <p className="confirm-warning">
                لا يمكنك تسليم أكثر من المتبقي ضمن هذه الشحنة.
              </p>
            </div>
            <div className="confirm-actions">
              <button
                className="btn secondary"
                onClick={() => {
                  // set to remaining (keep editing)
                  setForm((p) => ({ ...p, delivered: remaining }));
                  setOverModal(null);
                }}
              >
                اضبطها إلى المتبقي
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  // set then submit immediately
                  const payUSD = Number(form.paidUSD) || 0;
                  const payLBP = Number(form.paidLBP) || 0;
                  const dReturned = Number(form.returned) || 0;

                  const payments = [];
                  if (payUSD > 0) payments.push({ amount: payUSD, currency: "USD" });
                  if (payLBP > 0) payments.push({ amount: payLBP, currency: "LBP" });

                  setOverModal(null);
                  actuallySubmit({
                    delivered: remaining,
                    returned: dReturned,
                    customerid: customerId,
                    productId,
                    shipmentId,
                    payments,
                  }).catch(() => {});
                }}
              >
                اضبط وأرسل الآن
              </button>
              <button
                className="btn danger"
                onClick={() => {
                  setOverModal(null);
                  navigate("/startShipment");
                }}
              >
                ابدأ شحنة جديدة
              </button>
              <button
                className="btn ghost"
                onClick={() => setOverModal(null)}
              >
                تعديل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordOrder;
