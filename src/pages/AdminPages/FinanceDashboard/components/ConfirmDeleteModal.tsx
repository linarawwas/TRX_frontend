// src/pages/AdminPages/FinanceDashboard/components/ConfirmDeleteModal.tsx
import React from "react";
import "./ConfirmDeleteModal.css";

interface ConfirmDeleteModalProps {
  entryDate: string;
  entryCategory: string;
  entryKind: "income" | "expense";
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function ConfirmDeleteModal({
  entryDate,
  entryCategory,
  entryKind,
  onConfirm,
  onCancel,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  return (
    <div
      className="finx-confirm-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="finx-confirm-card" dir="rtl">
        <h3 className="finx-confirm-title">حذف العملية المالية</h3>
        <div className="finx-confirm-body">
          <p className="finx-confirm-note">
            هل أنت متأكد من حذف هذه العملية؟ هذا الإجراء <strong>لا يمكن التراجع عنه</strong>.
          </p>
          <div className="finx-confirm-details">
            <div className="finx-confirm-row">
              <span className="finx-confirm-key">التاريخ:</span>
              <span className="finx-confirm-val">{entryDate}</span>
            </div>
            <div className="finx-confirm-row">
              <span className="finx-confirm-key">النوع:</span>
              <span className="finx-confirm-val">
                {entryKind === "income" ? "إيراد" : "مصروف"}
              </span>
            </div>
            <div className="finx-confirm-row">
              <span className="finx-confirm-key">الفئة:</span>
              <span className="finx-confirm-val">{entryCategory}</span>
            </div>
          </div>
        </div>
        <div className="finx-confirm-actions">
          <button
            className="finx-btn"
            onClick={onCancel}
            disabled={isDeleting}
            type="button"
          >
            إلغاء
          </button>
          <button
            className="finx-btn finx-btn--danger"
            onClick={onConfirm}
            disabled={isDeleting}
            type="button"
          >
            {isDeleting ? "جاري الحذف…" : "حذف نهائي"}
          </button>
        </div>
      </div>
    </div>
  );
}

