// src/pages/AdminPages/FinanceDashboard/components/AddFinanceForm.tsx
import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Category, Payment } from "../../../../features/finance/types";
import { catAr } from "../../../../features/finance/utils/financeUtils";

type PaymentRow = {
  date?: string;
  amount: number | string;
  currency: "USD" | "LBP";
  paymentMethod?: string;
  note?: string;
  rateAtPaymentLBP?: number;
};

export interface AddFinanceFormRef {
  reset: () => void;
}

interface AddFinanceFormProps {
  cats: Category[];
  isAdmin: boolean;
  onSubmit: (payload: {
    kind: "income" | "expense";
    categoryId: string;
    date: string;
    note?: string;
    payments: Array<{
      amount: number;
      currency: "USD" | "LBP";
      paymentMethod?: string;
      note?: string;
      date: string;
    }>;
  }) => Promise<void>;
}

const AddFinanceForm = forwardRef<AddFinanceFormRef, AddFinanceFormProps>(
  ({ cats, isAdmin, onSubmit }, ref) => {
    const [form, setForm] = useState({
      kind: "expense" as "income" | "expense",
      categoryId: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });

    const [payments, setPayments] = useState<PaymentRow[]>([
      { amount: "", currency: "USD" },
    ]);

    const addPaymentRow = () =>
      setPayments((rows) => [...rows, { amount: "", currency: "USD" }]);
    const removePaymentRow = (idx: number) =>
      setPayments((rows) => rows.filter((_, i) => i !== idx));
    const updatePaymentRow = (idx: number, patch: Partial<PaymentRow>) =>
      setPayments((rows) =>
        rows.map((r, i) => (i === idx ? { ...r, ...patch } : r))
      );

    useImperativeHandle(ref, () => ({
      reset: () => {
        setForm({
          kind: "expense",
          categoryId: "",
          date: new Date().toISOString().slice(0, 10),
          note: "",
        });
        setPayments([{ amount: "", currency: "USD" }]);
      },
    }));

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAdmin || !form.categoryId) return;

      const validPayments = (payments || [])
        .map((p) => {
          const amt = Number(p.amount);
          return {
            date: form.date,
            amount: amt,
            currency: p.currency as "USD" | "LBP",
            paymentMethod: p.paymentMethod?.trim(),
            note: p.note?.trim(),
          };
        })
        .filter((p) => Number.isFinite(p.amount) && p.amount > 0);

      if (validPayments.length === 0) return;

      await onSubmit({
        kind: form.kind,
        categoryId: form.categoryId,
        date: form.date,
        note: form.note?.trim(),
        payments: validPayments,
      });
    };

    return (
      <form className="finx-form" onSubmit={handleSubmit}>
        <div className="finx-grid">
          <label className="finx-label">
            النوع
            <select
              className="finx-input"
              value={form.kind}
              onChange={(e) =>
                setForm({ ...form, kind: e.target.value as "income" | "expense" })
              }
            >
              <option value="income">إيراد</option>
              <option value="expense">مصروف</option>
            </select>
          </label>

          <label className="finx-label">
            الفئة
            <select
              className="finx-input"
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
            >
              <option value="">اختر الفئة…</option>
              {cats
                .filter((c) => c.kind === form.kind)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {catAr(c)}
                  </option>
                ))}
            </select>
          </label>

          <label className="finx-label finx-col2">
            التاريخ
            <input
              className="finx-input"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>

          <label className="finx-label finx-col2">
            ملاحظة
            <input
              className="finx-input"
              type="text"
              value={form.note || ""}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </label>
        </div>

        <div className="finx-card finx-paymentsWrap">
          <div className="finx-row finx-spaceBetween">
            <strong>الدفعات</strong>
            <button type="button" className="finx-btn" onClick={addPaymentRow}>
              + إضافة دفعة
            </button>
          </div>

          <div className="finx-payments">
            {payments.map((p, idx) => (
              <div className="finx-payrow" key={idx}>
                <label className="finx-label">
                  العملة
                  <select
                    className="finx-input"
                    value={p.currency}
                    onChange={(e) =>
                      updatePaymentRow(idx, {
                        currency: e.target.value as "USD" | "LBP",
                      })
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="LBP">ل.ل</option>
                  </select>
                </label>

                <label className="finx-label">
                  القيمة
                  <input
                    className="finx-input"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={p.amount}
                    onChange={(e) =>
                      updatePaymentRow(idx, { amount: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </label>

                <label className="finx-label">
                  طريقة الدفع
                  <input
                    className="finx-input"
                    type="text"
                    value={p.paymentMethod || ""}
                    onChange={(e) =>
                      updatePaymentRow(idx, {
                        paymentMethod: e.target.value,
                      })
                    }
                    placeholder="نقدي/مصرفي…"
                  />
                </label>

                <label className="finx-label finx-col2">
                  ملاحظة
                  <input
                    className="finx-input"
                    type="text"
                    value={p.note || ""}
                    onChange={(e) =>
                      updatePaymentRow(idx, { note: e.target.value })
                    }
                    placeholder="اختياري"
                  />
                </label>

                <div className="finx-actions finx-col2">
                  <button
                    type="button"
                    className="finx-btn danger"
                    onClick={() => removePaymentRow(idx)}
                    title="حذف الدفعة"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}

            {payments.length === 0 && (
              <div className="finx-tile">
                لا توجد دفعات. أضف دفعة أعلاه.
              </div>
            )}
          </div>
        </div>

        <div className="finx-stickyActions">
          <button
            type="submit"
            className="finx-btn primary"
            disabled={!isAdmin || !form.categoryId}
          >
            حفظ العملية
          </button>
        </div>
      </form>
    );
  }
);

AddFinanceForm.displayName = "AddFinanceForm";

export default AddFinanceForm;

