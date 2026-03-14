import React from "react";
import { OpeningEditor } from "./OpeningEditor";
import CustomerInvoices from "../CustomerInvoices/CustomerInvoices";

type UpdateCustomerInvoicesPanelProps = {
  customerData: { _id?: string } | null;
  customerId: string;
  invoiceReady: boolean;
  isAdmin: boolean;
  openEdit: boolean;
  token: string;
  onDoneOpeningEdit: () => void;
  onToggleOpeningEdit: () => void;
};

export default function UpdateCustomerInvoicesPanel({
  customerData,
  customerId,
  invoiceReady,
  isAdmin,
  openEdit,
  token,
  onDoneOpeningEdit,
  onToggleOpeningEdit,
}: UpdateCustomerInvoicesPanelProps) {
  return (
    <section className="ucx-card">
      <div
        className="ucx-card__header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>الرصيد الحالي</span>
        {isAdmin && (
          <button
            type="button"
            className="ucx-btn danger"
            onClick={onToggleOpeningEdit}
            title="هذه الأداة مخصّصة لتصحيح فروقات صغيرة فقط: فرق القناني المسموح به لا يتجاوز ±2. يمكن تعديل الرصيد الافتتاحي لأي قيمة."
          >
            ✎ تعديل (إداري)
          </button>
        )}
      </div>

      {isAdmin && openEdit && (
        <OpeningEditor
          customerId={customerId || ""}
          token={token || ""}
          onDone={onDoneOpeningEdit}
        />
      )}

      <div className="ucx-card__body">
        {customerData && invoiceReady ? (
          <CustomerInvoices customerId={customerId || ""} />
        ) : (
          <div className="ucx-skeleton">جارٍ التحميل…</div>
        )}
      </div>
    </section>
  );
}
