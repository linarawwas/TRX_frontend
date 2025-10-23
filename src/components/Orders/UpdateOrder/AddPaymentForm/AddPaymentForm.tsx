import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "./AddPaymentForm.css";

const AddPaymentForm = ({ orderId, orderData, setOrderData, onSuccess }) => {
  const token = useSelector((s) => s.user.token);

  const rateLBP = useMemo(() => {
    const v = Number(orderData?.companyExchangeRateLBPAtSale);
    return Number.isFinite(v) && v > 0 ? v : null;
  }, [orderData]);

  const [paymentCurrency, setPaymentCurrency] = useState<"" | "USD" | "LBP">("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // quick chip sets (feel free to tweak)
  const chips = paymentCurrency === "USD"
    ? [1, 5, 10, 20]
    : [10000, 50000, 100000, 300000];

  const amountNum = Number(paymentAmount);
  const canSubmit =
    !isSubmitting &&
    paymentCurrency !== "" &&
    Number.isFinite(amountNum) &&
    amountNum > 0;

  // live, client-only conversion hint (visual only)
  const hint = useMemo(() => {
    if (!rateLBP || !Number.isFinite(amountNum) || amountNum <= 0 || !paymentCurrency) return null;
    return paymentCurrency === "USD"
      ? `${(amountNum * rateLBP).toLocaleString("ar-LB")} ل.ل`
      : `$ ${(amountNum / rateLBP).toFixed(2)}`;
  }, [paymentCurrency, amountNum, rateLBP]);

  const handleChip = (v: number) => {
    const next = Number(paymentAmount || 0) + v;
    setPaymentAmount(String(next));
  };

  const resetForm = () => {
    setPaymentCurrency("");
    setPaymentAmount("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const payload = {
        paymentAmount: Number(paymentAmount),
        paymentCurrency,
      };

      const res = await fetch(
        `https://trx-api.linarawas.com/api/orders/addPayment/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || "فشل في إضافة الدفعة");
        return;
      }

      toast.success("تمت إضافة الدفعة بنجاح");

      // refresh order so receipt updates
      const updated = await fetch(`https://trx-api.linarawas.com/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (updated.ok) {
        const data = await updated.json();
        setOrderData(data);
        resetForm();
        onSuccess?.(); // close the sheet
      } else {
        toast.error("حدث خطأ عند تحميل الطلب بعد التحديث");
      }
    } catch {
      toast.error("فشل في إضافة الدفعة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className={`pay-form ${isSubmitting ? "is-submitting" : ""}`}
      onSubmit={handleSubmit}
      dir="rtl"
      aria-busy={isSubmitting}
    >
      {isSubmitting && <div className="pay-progress" aria-hidden="true" />}

      {/* Currency segment */}
      <div className="seg">
        <button
          type="button"
          className={`seg-btn ${paymentCurrency === "USD" ? "active" : ""}`}
          onClick={() => setPaymentCurrency("USD")}
          disabled={isSubmitting}
          aria-pressed={paymentCurrency === "USD"}
        >
          دولار أمريكي
        </button>
        <button
          type="button"
          className={`seg-btn ${paymentCurrency === "LBP" ? "active" : ""}`}
          onClick={() => setPaymentCurrency("LBP")}
          disabled={isSubmitting}
          aria-pressed={paymentCurrency === "LBP"}
        >
          ليرة لبنانية
        </button>
      </div>

      {/* Amount field */}
      <label className="field">
        <div className="field-label">مبلغ الدفعة</div>
        <div className="amount-wrap">
          <span className="prefix">
            {paymentCurrency === "USD" ? "$" : paymentCurrency === "LBP" ? "ل.ل" : "—"}
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder={paymentCurrency ? "0" : "اختر العملة أولاً"}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            disabled={isSubmitting || !paymentCurrency}
            className="amount-input"
            aria-describedby={hint ? "conv-hint" : undefined}
          />
        </div>
        {!!hint && (
          <div id="conv-hint" className="hint">
            ≈ {hint} {rateLBP && paymentCurrency === "USD" ? ` • ${rateLBP.toLocaleString("ar-LB")} ل.ل / $1` : ""}
          </div>
        )}
      </label>

      {/* Quick chips */}
      <div className="chips">
        {chips.map((v) => (
          <button
            type="button"
            key={v}
            className="chip"
            onClick={() => handleChip(v)}
            disabled={isSubmitting || !paymentCurrency}
          >
            +{paymentCurrency === "USD" ? v : v.toLocaleString("ar-LB")}
          </button>
        ))}
        <button
          type="button"
          className="chip clear"
          onClick={() => setPaymentAmount("")}
          disabled={isSubmitting}
        >
          مسح
        </button>
      </div>

      <button type="submit" className="pay-submit" disabled={!canSubmit}>
        {isSubmitting ? (
          <>
            <span className="btn-spin" aria-hidden="true" /> جارٍ الإضافة…
          </>
        ) : (
          "إضافة دفعة"
        )}
      </button>

      <div className="legal">
        يتم استخدام سعر الصرف المُسجّل للشركة تلقائياً. التحويلات هنا إرشادية فقط.
      </div>
    </form>
  );
};

export default AddPaymentForm;
