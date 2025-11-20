import React, { useState, useEffect, useCallback } from "react";
import "./RecordOrder.css"; // RecordOrder.tsx
import {
  getAdjustedInvoiceSums,
  projectAfterOrder,
} from "../../../utils/invoicePreview";
// (optional) for LBP pretty print
import { fmtLBP } from "../../../utils/money";

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
} from "../../../redux/Shipment/action";
import {
  setProductId,
  setProductName,
  setProductPrice,
} from "../../../redux/Order/action";
import { Link, useNavigate } from "react-router-dom";
import { getProductTypeFromDB, saveRequest } from "../../../utils/indexedDB";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";
import CustomerInvoices from "../../Customers/CustomerInvoices/CustomerInvoices";
import { selectRoundProgress } from "../../../redux/selectors/shipment";
// ---- Types (top of RecordOrder.tsx) ----
type RootState = {
  user: { companyId: string; token: string };
  order: {
    customer_Id: string;
    customer_name: string;
    phone: string;
    product_name: string;
    product_id: string | number;
    product_price: number;
  };
  shipment: {
    _id: string;
    exchangeRateLBP?: number;
    delivered?: number;
    returned?: number;
    dollarPayments?: number;
    liraPayments?: number;
  };
};

type CustomerData = {
  hasDiscount?: boolean;
  valueAfterDiscount?: number;
};

type Props = {
  customerData?: CustomerData | null;
  isExternal?: boolean;
};

type Payment = { amount: number; currency: "USD" | "LBP" };

type OrderPayload = {
  delivered: number;
  returned: number;
  customerid: string;
  productId: string | number;
  shipmentId: string;
  payments: Payment[];
  // your code uses 2 (internal) or 3 (external)
  type?: 2 | 3;
};

const RecordOrder: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const companyId = useSelector((s: RootState) => s.user.companyId);
  const { targetRound, /* deliveredThisRound, */ remainingRound } =
    useSelector(selectRoundProgress);
    const remaining = remainingRound;
  const token = useSelector((s: RootState) => s.user.token);
  const customerId = useSelector((s: RootState) => s.order.customer_Id);
  const customerName = useSelector((s: RootState) => s.order.customer_name);
  const customerPhoneRaw = useSelector((s: RootState) => s.order.phone);
  const shipmentId = useSelector((s: RootState) => s.shipment._id);
  const product_name = useSelector((s: RootState) => s.order.product_name);
  const productId = useSelector((s: RootState) => s.order.product_id);
  const productPrice = useSelector((s: RootState) => s.order.product_price);
  const reduxRateLBP =
    useSelector((s: RootState) => s.shipment.exchangeRateLBP) || undefined;
  const shipmentDelivered =
    useSelector((s: RootState) => s.shipment.delivered) ?? 0;
  const shipmentReturned =
    useSelector((s: RootState) => s.shipment.returned) ?? 0;
  const shipmentUsd =
    useSelector((s: RootState) => s.shipment.dollarPayments) ?? 0;
  const shipmentLbp =
    useSelector((s: RootState) => s.shipment.liraPayments) ?? 0;

  const [showLbpPad, setShowLbpPad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overModal, setOverModal] = useState<{ want: number } | null>(null);
  const [form, setForm] = useState({
    delivered: 0,
    returned: 0,
    paidUSD: 0,
    paidLBP: 0,
  });
  const [maxReturnable, setMaxReturnable] = useState<number>(0);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Empty => 0 (stay numeric)
    const clean = value === "" ? "0" : value;
  
    // numeric only, strip leading zeros except “0”
    const cleaned = String(clean).replace(/^0+(?!$)/, "");
    if (Number.isNaN(Number(cleaned))) return;
  
    let next = parseInt(cleaned, 10);
  
    if (name === "delivered") {
      next = Math.max(0, Math.min(next, remaining));
    }
    if (name === "returned") {
      next = Math.max(0, Math.min(next, maxReturnable));
    }
  
    setForm((p) => ({ ...p, [name]: next }));
  };
  useEffect(() => {
    let cancelled = false;
    if (!customerId) {
      setMaxReturnable(0);
      return;
    }

    (async () => {
      try {
        const sums = await getAdjustedInvoiceSums(customerId, companyId);
        if (cancelled) return;
        const limit = Math.max(0, sums?.bottlesLeft || 0);
        setMaxReturnable(limit);
        setForm((prev) => {
          if (prev.returned > limit) {
            return { ...prev, returned: limit };
          }
          return prev;
        });
      } catch (error) {
        console.error("Failed to load current bottles left", error);
        if (!cancelled) {
          setMaxReturnable(0);
          setForm((prev) =>
            prev.returned > 0 ? { ...prev, returned: 0 } : prev
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [customerId, companyId]);

  

  /* ---------- cache default product ---------- */
  useEffect(() => {
    (async () => {
      try {
        const cached = await getProductTypeFromDB(companyId);
        if (cached) {
          console.log("product is in indexed db");
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
    ? (props.customerData?.valueAfterDiscount || 0) *
      (Number(form.delivered) || 0)
    : (productPrice || 0) * (Number(form.delivered) || 0);


  const handleLbpChange = useCallback(
    (val: number) => setForm((p) => ({ ...p, paidLBP: val })),
    []
  );

  const inc = (field: keyof typeof form) =>
    setForm((p) => {
      const step = field === "paidLBP" ? 1000 : 1;
      let next = Number(p[field] || 0) + step;
      if (field === "delivered") next = Math.min(next, remaining);
      if (field === "returned") next = Math.min(next, maxReturnable);
      return { ...p, [field]: Math.max(0, next) };
    });

  const dec = (field: keyof typeof form) =>
    setForm((p) => {
      const step = field === "paidLBP" ? 1000 : 1;
      return { ...p, [field]: Math.max(0, Number(p[field] || 0) - step) };
    });
  function buildOrderMessage({
    customerName,
    productName,
    payload, // { delivered, returned, payments: [...] }
    checkoutUSD, // number
    preview, // { bottlesLeftAfter, totalUsdAfter }
    lastRateLBP, // number | undefined
  }: {
    customerName: string;
    productName: string;
    payload: { delivered: number; returned: number; payments: Payment[] };
    checkoutUSD: number;
    preview: { bottlesLeftAfter: number; totalUsdAfter: number };
    lastRateLBP?: number;
  }) {
    const sumUSD = (payload.payments || [])
    .filter((p) => p.currency === "USD")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const sumLBP = (payload.payments || [])
    .filter((p) => p.currency === "LBP")
    .reduce((s, p) => s + (p.amount || 0), 0);

    const usdStr = sumUSD ? `${sumUSD} $` : "0 $";
    const lbpStr = sumLBP ? `${sumLBP.toLocaleString()} ل.ل` : "0 ل.ل";

    const overallUSD = Math.max(0, Number(preview.totalUsdAfter || 0)).toFixed(
      2
    );
    const overallLBP =
      lastRateLBP && Number(lastRateLBP) > 0
        ? ` (${fmtLBP(preview.totalUsdAfter * lastRateLBP)})`
        : "";

    return `مرحباً ${customerName} 

تم تسجيل طلبك (${productName}):

المسلّمة: ${payload.delivered}
المرجعة: ${payload.returned}
الحساب: ${checkoutUSD.toFixed(2)} $
المدفوع: ${usdStr} + ${lbpStr}

القناني المتبقية بعد الطلب: ${preview.bottlesLeftAfter}
الرصيد الإجمالي بعد الطلب: ${overallUSD} $${overallLBP}

شكراً لتعاملكم معنا`;
  }

  function normalizePhone(raw: string, defaultCountry = "961"): string {
    if (!raw) return "";
    const cleaned = raw.replace(/[^0-9]/g, ""); // digits only

    // 00CC... -> strip 00
    if (cleaned.startsWith("00")) return cleaned.slice(2);

    // Already has a country code? allow common ones directly
    if (/^(961|963|1)\d+/.test(cleaned)) return cleaned;

    // Lebanese local with leading 0: 03xxxxxx, 70xxxxxx, etc.
    if (defaultCountry === "961" && cleaned.length === 8) {
      // already 8-digit local (e.g., 78881318)
      return defaultCountry + cleaned;
    }
    if (
      defaultCountry === "961" &&
      cleaned.length === 9 &&
      cleaned.startsWith("0")
    ) {
      // e.g., 078881318 or 03123456
      return defaultCountry + cleaned.slice(1);
    }

    // Fallback: just prefix default country
    return defaultCountry + cleaned;
  }


  const actuallySubmit = async (
    payload: OrderPayload,
    waWindow?: Window | null,
    waMessage?: string | null
  ) => {
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

    // after success (ONLINE branch), instead of rebuilding the message:
    if (customerPhoneRaw && waMessage) {
      const normalizedPhone = normalizePhone(customerPhoneRaw);
      const encoded = encodeURIComponent(waMessage);
      const url = `https://wa.me/${normalizedPhone}?text=${encoded}`;
      if (waWindow && !waWindow.closed) {
        setTimeout(() => {
          try {
            waWindow.location.href = url;
          } catch {
            window.location.assign(url);
          }
        }, 0);
      } else {
        window.location.assign(url);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 👇 Only pre-open if we have a phone to message
    const waWindow = customerPhoneRaw ? window.open("", "_blank") : null;
    // normalize inputs
    const dDelivered = Number(form.delivered) || 0;
    const dReturned = Number(form.returned) || 0;
    const payUSD = Number(form.paidUSD) || 0;
    const payLBP = Number(form.paidLBP) || 0;

    // if target reached or user tried > remaining → show modal
    // over-modal guard
    if (
      targetRound > 0 &&
      (remaining === 0 ? dDelivered > 0 : dDelivered > remaining)
    ) {
      setOverModal({ want: dDelivered });
      return;
    }

    setIsSubmitting(true);

const payments: Payment[] = [];
if (payUSD > 0) payments.push({ amount: payUSD, currency: "USD" });
if (payLBP > 0) payments.push({ amount: payLBP, currency: "LBP" });

const orderPayload: OrderPayload = {
  delivered: dDelivered,
  returned: dReturned,
  customerid: customerId,
  productId,
  shipmentId,
  payments,
  type: props.isExternal ? 3 : 2,
};


    // 1) Get “before” and ensure we have a rate
    const before = await getAdjustedInvoiceSums(customerId, companyId);

    // Prefer order of precedence: invoice snapshot → redux → IDB fallback already done inside getAdjustedInvoiceSums
    const effectiveRateLBP = before.lastRateLBP ?? reduxRateLBP;

    // 2) Project after
    const { bottlesLeftAfter, totalUsdAfter } = projectAfterOrder(
      {
        bottlesLeft: before?.bottlesLeft || 0,
        totalSumUSD: before?.totalSumUSD || 0,
        lastRateLBP: effectiveRateLBP,
      },
      orderPayload,
      checkout,
      effectiveRateLBP // ⬅️ pass the same rate here
    );

    // 3) Build message using the SAME rate for display
    const waMessage = customerPhoneRaw
      ? buildOrderMessage({
          customerName,
          productName: product_name,
          payload: orderPayload,
          checkoutUSD: checkout,
          preview: { bottlesLeftAfter, totalUsdAfter },
          lastRateLBP: effectiveRateLBP, // ⬅️ same rate so LBP equivalent prints too
        })
      : null;

    try {
      await actuallySubmit(orderPayload, waWindow, waMessage);
      // Give the browser a tick to navigate the pre-opened tab, then go back
      setTimeout(() => navigate(-1), 150);
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
          المنتج: {product_name} • {productPrice}$
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
              <button
                type="button"
                onClick={() => dec("delivered")}
                aria-label="طرح"
              >
                −
              </button>
              <input
                type="number"
                name="delivered"
                value={form.delivered}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button
                type="button"
                onClick={() => inc("delivered")}
                aria-label="إضافة"
              >
                +
              </button>
            </div>
            <div className={`roc-hint ${remaining === 0 ? "locked" : ""}`}>
              المتبقي في هذه الجولة: <strong>{remaining}</strong>{" "}
              {remaining === 0 && (
                <>
                  • <span className="lock">مغلق</span>
                </>
              )}
            </div>
          </div>

          {/* Returned */}
          <div className="roc-stepper">
            <div className="roc-stepper-label">المرجعة</div>
            <div className="roc-stepper-ctrl">
              <button
                type="button"
                onClick={() => dec("returned")}
                aria-label="طرح"
              >
                −
              </button>
              <input
                type="number"
                name="returned"
                value={form.returned}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button
                type="button"
                onClick={() => inc("returned")}
                aria-label="إضافة"
              >
                +
              </button>
            </div>
            <div className={`roc-hint ${maxReturnable === 0 ? "locked" : ""}`}>
              الحد الأقصى للإرجاع: <strong>{maxReturnable}</strong>{" "}
              {maxReturnable === 0 && (
                <>
                  • <span className="lock">لا يمكنك إرجاع أكثر من القناني المتبقية</span>
                </>
              )}
            </div>
          </div>

          {/* USD */}
          <div className="roc-stepper">
            <div className="roc-stepper-label">الدولار</div>
            <div className="roc-stepper-ctrl">
              <button
                type="button"
                onClick={() => dec("paidUSD")}
                aria-label="طرح"
              >
                −
              </button>
              <input
                type="number"
                name="paidUSD"
                value={form.paidUSD}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <button
                type="button"
                onClick={() => inc("paidUSD")}
                aria-label="إضافة"
              >
                +
              </button>
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
          <div className="roc-lbp-label">المدفوع بالليرة</div>
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
              <p>
                الهدف لهذه الشحنة: <strong>{targetRound}</strong>
              </p>
              <p>
                المسلّم حتى الآن: <strong>{shipmentDelivered}</strong>
              </p>
              <p>
                المتبقي: <strong>{remaining}</strong>
              </p>
              <p>
                طلبت تسليم: <strong>{overModal.want}</strong>
              </p>
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

                  const payments: {
                    amount: number;
                    currency: "USD" | "LBP";
                  }[] = [];
                  if (payUSD > 0)
                    payments.push({ amount: payUSD, currency: "USD" });
                  if (payLBP > 0)
                    payments.push({ amount: payLBP, currency: "LBP" });

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
              <button className="btn ghost" onClick={() => setOverModal(null)}>
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
