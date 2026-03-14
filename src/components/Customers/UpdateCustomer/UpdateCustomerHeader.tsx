import React from "react";

type CustomerData = {
  name?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
};

type UpdateCustomerHeaderProps = {
  avatarText: string;
  customerData: CustomerData | null;
  customerId: string;
  editOpen: boolean;
  isAdmin: boolean;
  isMutating: boolean;
  restoreSequence: number | "";
  showRestoreOptions: boolean;
  onDeactivate: () => void;
  onOpenDeleteModal: () => void;
  onRecordOrder: () => void;
  onRestoreAuto: () => void;
  onRestoreSequenceChange: (value: number | "") => void;
  onRestoreWithSequence: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleEdit: () => void;
  onViewStatement: () => void;
};

export default function UpdateCustomerHeader({
  avatarText,
  customerData,
  editOpen,
  isAdmin,
  isMutating,
  restoreSequence,
  showRestoreOptions,
  onDeactivate,
  onOpenDeleteModal,
  onRecordOrder,
  onRestoreAuto,
  onRestoreSequenceChange,
  onRestoreWithSequence,
  onToggleEdit,
  onViewStatement,
}: UpdateCustomerHeaderProps) {
  return (
    <>
      <header className="ucx-hero">
        <div className="ucx-hero__left">
          <div className="ucx-avatar" aria-hidden="true">
            {avatarText}
          </div>
          <div className="ucx-hero__text">
            <h1 className="ucx-title">{customerData?.name || "الزبون"}</h1>
            <div className="ucx-sub">
              {customerData?.phone ? `📞 ${customerData.phone}` : "—"}
              {customerData?.address ? ` · 📍 ${customerData.address}` : ""}
            </div>
          </div>
        </div>

        {customerData && (
          <div className="ucx-hero__right">
            <span
              className={`ucx-chip ${customerData.isActive ? "ok" : "off"}`}
            >
              {customerData.isActive ? "نشط" : "غير نشط"}
            </span>
            {customerData.isActive ? (
              <button
                className="ucx-btn danger sm"
                onClick={onDeactivate}
                disabled={isMutating}
              >
                إيقاف
              </button>
            ) : (
              <div className="ucx-restoreBar">
                <button
                  className="ucx-btn primary sm"
                  onClick={onRestoreAuto}
                  disabled={isMutating}
                >
                  تنشيط
                </button>
                {showRestoreOptions && (
                  <form
                    className="ucx-restoreInline"
                    onSubmit={onRestoreWithSequence}
                  >
                    <label className="ucx-restoreLabel">الترتيب:</label>
                    <input
                      className="ucx-input sm"
                      type="number"
                      min={1}
                      value={restoreSequence}
                      onChange={(e) =>
                        onRestoreSequenceChange(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="مثال: 25"
                    />
                    <button
                      className="ucx-btn secondary sm"
                      type="submit"
                      disabled={isMutating}
                    >
                      حفظ
                    </button>
                  </form>
                )}
              </div>
            )}
            <button
              className={`ucx-btn ${isAdmin ? "hard sm" : "hardDisabled sm"}`}
              onClick={onOpenDeleteModal}
              disabled={!isAdmin || isMutating}
              title={isAdmin ? "حذف نهائي" : "للمشرف فقط"}
            >
              حذف نهائي
            </button>
          </div>
        )}
      </header>

      <div className="ucx-actionsRow">
        {customerData?.isActive && !isAdmin && (
          <button className="ucx-btn success" onClick={onRecordOrder}>
            تسجيل طلب خارجي
          </button>
        )}
        <button className="ucx-btn primary outline" onClick={onViewStatement}>
          كشف الحساب / إضافة دفعة
        </button>
        <button
          className="ucx-btn secondary"
          onClick={onToggleEdit}
          aria-expanded={editOpen}
        >
          {editOpen ? "إخفاء التعديل" : "تعديل معلومات الزبون"}
        </button>
      </div>
    </>
  );
}
