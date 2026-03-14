import React from "react";

type Area = { _id: string; name: string };
type PlacementOption = { value: string; label: string };
type PendingChanges = Record<string, string> | null;

type UpdateCustomerModalsProps = {
  areas: Area[];
  closeDeleteModal: () => void;
  confirmOpen: boolean;
  deleteStep: 1 | 2;
  isMutating: boolean;
  pendingChanges: PendingChanges;
  placementOptions: PlacementOption[];
  performHardDelete: () => void;
  setConfirmOpen: (open: boolean) => void;
  setDeleteStep: (step: 1 | 2) => void;
  setPendingChanges: (changes: PendingChanges) => void;
  showDeleteModal: boolean;
  submitUpdate: () => void;
};

export default function UpdateCustomerModals({
  areas,
  closeDeleteModal,
  confirmOpen,
  deleteStep,
  isMutating,
  pendingChanges,
  placementOptions,
  performHardDelete,
  setConfirmOpen,
  setDeleteStep,
  setPendingChanges,
  showDeleteModal,
  submitUpdate,
}: UpdateCustomerModalsProps) {
  return (
    <>
      {confirmOpen && pendingChanges && (
        <div className="ucx-modal" role="dialog" aria-modal="true">
          <div className="ucx-modal__panel">
            <div className="ucx-modal__header">
              <h3>تأكيد تحديث الزبون</h3>
              <button
                className="ucx-iconBtn"
                onClick={() => {
                  if (!isMutating) {
                    setConfirmOpen(false);
                    setPendingChanges(null);
                  }
                }}
                aria-label="إغلاق"
                disabled={isMutating}
              >
                ✕
              </button>
            </div>
            <div className="ucx-modal__body">
              <p className="ucx-hint">راجع التعديلات التالية قبل حفظها:</p>
              <ul className="ucx-summary">
                {pendingChanges.name && (
                  <li>
                    <strong>الاسم:</strong> {pendingChanges.name}
                  </li>
                )}
                {pendingChanges.phone && (
                  <li>
                    <strong>الهاتف:</strong> {pendingChanges.phone}
                  </li>
                )}
                {pendingChanges.address && (
                  <li>
                    <strong>العنوان:</strong> {pendingChanges.address}
                  </li>
                )}
                {pendingChanges.areaId && (
                  <li>
                    <strong>المنطقة الجديدة:</strong>{" "}
                    {areas.find((area) => area._id === pendingChanges.areaId)?.name ||
                      pendingChanges.areaId}
                  </li>
                )}
                {pendingChanges.placement && (
                  <li>
                    <strong>الموضع داخل المنطقة:</strong>{" "}
                    {
                      placementOptions.find(
                        (opt) => String(opt.value) === String(pendingChanges.placement)
                      )?.label
                    }
                  </li>
                )}
              </ul>
            </div>
            <div className="ucx-modal__actions">
              <button
                className="ucx-btn secondary"
                onClick={() => {
                  if (!isMutating) {
                    setConfirmOpen(false);
                    setPendingChanges(null);
                  }
                }}
                disabled={isMutating}
              >
                تعديل
              </button>
              <button
                className="ucx-btn primary"
                onClick={submitUpdate}
                disabled={isMutating}
              >
                {isMutating ? "جارٍ الحفظ…" : "تأكيد الحفظ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="ucx-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delTitle"
        >
          <div className="ucx-modal__panel">
            <div className="ucx-modal__header">
              <h3 id="delTitle">حذف نهائي للزبون</h3>
              <button
                className="ucx-iconBtn"
                onClick={closeDeleteModal}
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            {deleteStep === 1 && (
              <div className="ucx-modal__body">
                <p>
                  هذا الإجراء <strong>لا يمكن التراجع عنه</strong>. سيتم حذف
                  الزبون نهائيًا من النظام.
                </p>
                <div className="ucx-modal__actions">
                  <button className="ucx-btn secondary" onClick={closeDeleteModal}>
                    إلغاء
                  </button>
                  <button
                    className="ucx-btn danger"
                    onClick={() => setDeleteStep(2)}
                  >
                    متابعة
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="ucx-modal__body">
                <p className="ucx-dangerText">
                  تأكيد أخير: قد يكون لدى الزبون <strong>طلبات مرتبطة</strong>.
                  إن وُجدت سيُرفض الحذف.
                </p>
                <div className="ucx-modal__actions">
                  <button className="ucx-btn secondary" onClick={closeDeleteModal}>
                    إلغاء
                  </button>
                  <button
                    className="ucx-btn hard"
                    onClick={performHardDelete}
                    disabled={isMutating}
                  >
                    {isMutating ? "جارٍ الحذف..." : "حذف نهائي"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
