import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAdjustedInvoiceSums,
  projectAfterOrder,
} from "../../../utils/invoicePreview";
import { fmtLBP } from "../../../utils/money";
import {
  addCustomerWithEmptyOrder,
  addCustomerWithFilledOrder,
  addPendingOrder,
  removePendingOrder,
  setShipmentDelivered,
  setShipmentPaymentsInDollars,
  setShipmentPaymentsInLiras,
  setShipmentReturned,
} from "../../../redux/Shipment/action";
import {
  setProductId,
  setProductName,
  setProductPrice,
} from "../../../redux/Order/action";
import { getProductTypeFromDB, saveRequest } from "../../../utils/indexedDB";
import { fetchAndCacheCustomerInvoice } from "../../../utils/apiHelpers";
import { API_BASE } from "../../../config/api";
import {
  selectRoundProgress,
  selectShipmentExchangeRateLBP,
  selectShipmentLiveTotals,
  selectShipmentMeta,
} from "../../../redux/selectors/shipment";
import { RootState } from "../../../redux/store";

export type RecordOrderCustomerData = {
  hasDiscount?: boolean;
  valueAfterDiscount?: number;
};

export type RecordOrderProps = {
  customerData?: RecordOrderCustomerData | null;
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
  type?: 2 | 3;
};

type FormState = {
  delivered: number;
  returned: number;
  paidUSD: number;
  paidLBP: number;
};

function buildPayments(form: FormState): Payment[] {
  const payments: Payment[] = [];
  const payUSD = Number(form.paidUSD) || 0;
  const payLBP = Number(form.paidLBP) || 0;

  if (payUSD > 0) payments.push({ amount: payUSD, currency: "USD" });
  if (payLBP > 0) payments.push({ amount: payLBP, currency: "LBP" });

  return payments;
}

function buildOrderMessage({
  customerName,
  productName,
  payload,
  checkoutUSD,
  preview,
  lastRateLBP,
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
  const overallUSD = Math.max(0, Number(preview.totalUsdAfter || 0)).toFixed(2);
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

شكراً لتعاملكم معنا
______________

تم الإرسال بواسطة برنامج TRX للذكاء التجاري، بتطوير لينة الرواس.، لخدماتنا البرمجية: info@theagilelabs.com`;
}

function normalizePhone(raw: string, defaultCountry = "961"): string {
  if (!raw) return "";
  const cleaned = raw.replace(/[^0-9]/g, "");

  if (cleaned.startsWith("00")) return cleaned.slice(2);
  if (/^(961|963|1)\d+/.test(cleaned)) return cleaned;

  if (defaultCountry === "961" && cleaned.length === 8) {
    return defaultCountry + cleaned;
  }
  if (
    defaultCountry === "961" &&
    cleaned.length === 9 &&
    cleaned.startsWith("0")
  ) {
    return defaultCountry + cleaned.slice(1);
  }

  return defaultCountry + cleaned;
}

export function useRecordOrderController(props: RecordOrderProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const companyId = useSelector((s: RootState) => s.user.companyId);
  const token = useSelector((s: RootState) => s.user.token);
  const customerId = useSelector((s: RootState) => s.order.customer_Id) || "";
  const customerName = useSelector((s: RootState) => s.order.customer_name);
  const customerPhoneRaw = useSelector((s: RootState) => s.order.phone);
  const productName = useSelector((s: RootState) => s.order.product_name);
  const productId = useSelector((s: RootState) => s.order.product_id) || "";
  const productPrice = useSelector((s: RootState) => s.order.product_price);
  const { id: shipmentId } = useSelector(selectShipmentMeta);
  const reduxRateLBP = useSelector(selectShipmentExchangeRateLBP) || undefined;
  const {
    delivered: shipmentDelivered,
    returned: shipmentReturned,
    dollarPayments: shipmentUsd,
    liraPayments: shipmentLbp,
  } = useSelector(selectShipmentLiveTotals);
  const { targetRound, remainingRound } = useSelector(selectRoundProgress);

  const remaining = remainingRound;
  const [showLbpPad, setShowLbpPad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overModal, setOverModal] = useState<{ want: number } | null>(null);
  const [form, setForm] = useState<FormState>({
    delivered: 0,
    returned: 0,
    paidUSD: 0,
    paidLBP: 0,
  });
  const [maxReturnable, setMaxReturnable] = useState(0);

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
        setForm((prev) =>
          prev.returned > limit ? { ...prev, returned: limit } : prev
        );
      } catch (error) {
        // Keep the form usable even if invoice preview data fails.
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
  }, [companyId, customerId]);

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

  const checkout = useMemo(
    () =>
      props.customerData?.hasDiscount
        ? (props.customerData?.valueAfterDiscount || 0) *
          (Number(form.delivered) || 0)
        : (productPrice || 0) * (Number(form.delivered) || 0),
    [form.delivered, productPrice, props.customerData]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const clean = value === "" ? "0" : value;
    const cleaned = String(clean).replace(/^0+(?!$)/, "");
    if (Number.isNaN(Number(cleaned))) return;

    let next = parseInt(cleaned, 10);
    if (name === "delivered") next = Math.max(0, Math.min(next, remaining));
    if (name === "returned") next = Math.max(0, Math.min(next, maxReturnable));

    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const handleLbpChange = useCallback((val: number) => {
    setForm((prev) => ({ ...prev, paidLBP: val }));
  }, []);

  const inc = (field: keyof FormState) =>
    setForm((prev) => {
      const step = field === "paidLBP" ? 1000 : 1;
      let next = Number(prev[field] || 0) + step;
      if (field === "delivered") next = Math.min(next, remaining);
      if (field === "returned") next = Math.min(next, maxReturnable);
      return { ...prev, [field]: Math.max(0, next) };
    });

  const dec = (field: keyof FormState) =>
    setForm((prev) => {
      const step = field === "paidLBP" ? 1000 : 1;
      return { ...prev, [field]: Math.max(0, Number(prev[field] || 0) - step) };
    });

  const actuallySubmit = useCallback(
    async (
      payload: OrderPayload,
      waWindow?: Window | null,
      waMessage?: string | null
    ): Promise<boolean> => {
      const request = {
        url: `${API_BASE}/api/orders`,
        options: {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      };

      const sumUSD = (payload.payments || [])
        .filter((p) => p.currency === "USD")
        .reduce((s, p) => s + (p.amount || 0), 0);
      const sumLBP = (payload.payments || [])
        .filter((p) => p.currency === "LBP")
        .reduce((s, p) => s + (p.amount || 0), 0);

      if (!navigator.onLine) {
        await saveRequest(request);
        dispatch(addPendingOrder(customerId));

        if (payload.delivered) {
          dispatch(setShipmentDelivered(shipmentDelivered + payload.delivered));
        }
        if (payload.returned) {
          dispatch(setShipmentReturned(shipmentReturned + payload.returned));
        }
        if (sumUSD) dispatch(setShipmentPaymentsInDollars(shipmentUsd + sumUSD));
        if (sumLBP) dispatch(setShipmentPaymentsInLiras(shipmentLbp + sumLBP));

        if (!payload.delivered && !payload.returned && !sumUSD && !sumLBP) {
          dispatch(addCustomerWithEmptyOrder(customerId));
        } else {
          dispatch(addCustomerWithFilledOrder(customerId));
        }

        toast.info("📡 سيتم حفظ الطلب عند عودة الاتصال");
        navigate(-1);
        return true;
      }

      const res = await fetch(request.url, request.options);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(`❌ ${data.error || data.message || "فشل إنشاء الطلب"}`);
        return false;
      }

      if (payload.delivered) {
        dispatch(setShipmentDelivered(shipmentDelivered + payload.delivered));
      }
      if (payload.returned) {
        dispatch(setShipmentReturned(shipmentReturned + payload.returned));
      }
      if (sumUSD) dispatch(setShipmentPaymentsInDollars(shipmentUsd + sumUSD));
      if (sumLBP) dispatch(setShipmentPaymentsInLiras(shipmentLbp + sumLBP));

      dispatch(removePendingOrder(customerId));
      fetchAndCacheCustomerInvoice(customerId || "", token || "").catch(() => {});

      if (!payload.delivered && !payload.returned && !sumUSD && !sumLBP) {
        dispatch(addCustomerWithEmptyOrder(customerId));
      } else {
        dispatch(addCustomerWithFilledOrder(customerId));
      }

      toast.success("✅ تم تسجيل الطلب");

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

      return true;
    },
    [
      customerId,
      customerPhoneRaw,
      dispatch,
      navigate,
      shipmentDelivered,
      shipmentLbp,
      shipmentReturned,
      shipmentUsd,
      token,
    ]
  );

  const buildOrderPayload = useCallback(
    (overrides?: Partial<OrderPayload>): OrderPayload => ({
      delivered: Number(form.delivered) || 0,
      returned: Number(form.returned) || 0,
      customerid: customerId,
      productId,
      shipmentId,
      payments: buildPayments(form),
      type: props.isExternal ? 3 : 2,
      ...overrides,
    }),
    [customerId, form, productId, props.isExternal, shipmentId]
  );

  const submitOrder = useCallback(
    async (payload: OrderPayload, waWindow?: Window | null): Promise<boolean> => {
      const before = await getAdjustedInvoiceSums(customerId, companyId);
      const effectiveRateLBP = before.lastRateLBP ?? reduxRateLBP;
      const { bottlesLeftAfter, totalUsdAfter } = projectAfterOrder(
        {
          bottlesLeft: before?.bottlesLeft || 0,
          totalSumUSD: before?.totalSumUSD || 0,
          lastRateLBP: effectiveRateLBP,
        },
        payload,
        checkout,
        effectiveRateLBP
      );

      const waMessage = customerPhoneRaw
        ? buildOrderMessage({
            customerName,
            productName,
            payload,
            checkoutUSD: checkout,
            preview: { bottlesLeftAfter, totalUsdAfter },
            lastRateLBP: effectiveRateLBP,
          })
        : null;

      return actuallySubmit(payload, waWindow, waMessage);
    },
    [
      actuallySubmit,
      checkout,
      companyId,
      customerId,
      customerName,
      customerPhoneRaw,
      productName,
      reduxRateLBP,
    ]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const delivered = Number(form.delivered) || 0;
    if (
      targetRound > 0 &&
      (remaining === 0 ? delivered > 0 : delivered > remaining)
    ) {
      setOverModal({ want: delivered });
      return;
    }

    setIsSubmitting(true);
    const waWindow = customerPhoneRaw ? window.open("", "_blank") : null;

    try {
      const didSubmit = await submitOrder(buildOrderPayload(), waWindow);
      if (didSubmit) {
        setTimeout(() => navigate(-1), 150);
      }
    } catch {
      toast.error("❌ فشل الاتصال بالشبكة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustDeliveredToRemaining = () => {
    setForm((prev) => ({ ...prev, delivered: remaining }));
    setOverModal(null);
  };

  const submitRemainingNow = async () => {
    setOverModal(null);
    await actuallySubmit(
      buildOrderPayload({
        delivered: remaining,
        type: undefined,
      })
    );
  };

  const goToNewShipment = () => {
    setOverModal(null);
    navigate("/startShipment");
  };

  const closeOverModal = () => setOverModal(null);

  return {
    checkout,
    closeOverModal,
    customerId,
    customerName,
    form,
    goToNewShipment,
    handleChange,
    handleLbpChange,
    handleSubmit,
    inc,
    dec,
    isSubmitting,
    maxReturnable,
    overModal,
    productName,
    productPrice,
    remaining,
    setShowLbpPad,
    shipmentDelivered,
    showLbpPad,
    submitRemainingNow,
    targetRound,
    adjustDeliveredToRemaining,
  };
}
