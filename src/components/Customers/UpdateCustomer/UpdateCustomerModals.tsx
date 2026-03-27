import React from "react";
import type { UpdateCustomerPayload } from "../../../features/customers/apiCustomers";
import { t } from "../../../utils/i18n";

type Area = { _id: string; name: string };
type PlacementOption = { value: string; label: string };

type UpdateCustomerModalsProps = {
  areas: Area[];
  closeDeleteModal: () => void;
  confirmOpen: boolean;
  deleteStep: 1 | 2;
  isMutating: boolean;
  pendingChanges: UpdateCustomerPayload | null;
  placementOptions: PlacementOption[];
  performHardDelete: () => void;
  setConfirmOpen: (open: boolean) => void;
  setDeleteStep: (step: 1 | 2) => void;
  setPendingChanges: (changes: UpdateCustomerPayload | null) => void;
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
              <h3>{t("updateCustomer.modal.confirmUpdateTitle")}</h3>
              <button
                type="button"
                className="ucx-iconBtn"
                onClick={() => {
                  if (!isMutating) {
                    setConfirmOpen(false);
                    setPendingChanges(null);
                  }
                }}
                aria-label={t("updateCustomer.modal.close")}
                disabled={isMutating}
              >
                ✕
              </button>
            </div>
            <div className="ucx-modal__body">
              <p className="ucx-hint">{t("updateCustomer.modal.reviewHint")}</p>
              <ul className="ucx-summary">
                {pendingChanges.name && (
                  <li>
                    <strong>{t("updateCustomer.modal.fieldName")}</strong>{" "}
                    {pendingChanges.name}
                  </li>
                )}
                {pendingChanges.phone && (
                  <li>
                    <strong>{t("updateCustomer.modal.fieldPhone")}</strong>{" "}
                    {pendingChanges.phone}
                  </li>
                )}
                {pendingChanges.address && (
                  <li>
                    <strong>{t("updateCustomer.modal.fieldAddress")}</strong>{" "}
                    {pendingChanges.address}
                  </li>
                )}
                {pendingChanges.areaId && (
                  <li>
                    <strong>{t("updateCustomer.modal.fieldNewArea")}</strong>{" "}
                    {areas.find((area) => area._id === pendingChanges.areaId)?.name ||
                      pendingChanges.areaId}
                  </li>
                )}
                {pendingChanges.placement && (
                  <li>
                    <strong>{t("updateCustomer.modal.fieldPlacement")}</strong>{" "}
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
                type="button"
                className="ucx-btn secondary"
                onClick={() => {
                  if (!isMutating) {
                    setConfirmOpen(false);
                    setPendingChanges(null);
                  }
                }}
                disabled={isMutating}
              >
                {t("updateCustomer.modal.backEdit")}
              </button>
              <button
                type="button"
                className="ucx-btn primary"
                onClick={submitUpdate}
                disabled={isMutating}
              >
                {isMutating
                  ? t("updateCustomer.modal.saving")
                  : t("updateCustomer.modal.confirmSave")}
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
              <h3 id="delTitle">{t("updateCustomer.modal.deleteTitle")}</h3>
              <button
                type="button"
                className="ucx-iconBtn"
                onClick={closeDeleteModal}
                aria-label={t("updateCustomer.modal.close")}
              >
                ✕
              </button>
            </div>

            {deleteStep === 1 && (
              <div className="ucx-modal__body">
                <p
                  dangerouslySetInnerHTML={{
                    __html: t("updateCustomer.modal.deleteStep1"),
                  }}
                />
                <div className="ucx-modal__actions">
                  <button type="button" className="ucx-btn secondary" onClick={closeDeleteModal}>
                    {t("updateCustomer.modal.cancel")}
                  </button>
                  <button
                    type="button"
                    className="ucx-btn danger"
                    onClick={() => setDeleteStep(2)}
                  >
                    {t("updateCustomer.modal.continue")}
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="ucx-modal__body">
                <p
                  className="ucx-dangerText"
                  dangerouslySetInnerHTML={{
                    __html: t("updateCustomer.modal.deleteStep2"),
                  }}
                />
                <div className="ucx-modal__actions">
                  <button type="button" className="ucx-btn secondary" onClick={closeDeleteModal}>
                    {t("updateCustomer.modal.cancel")}
                  </button>
                  <button
                    type="button"
                    className="ucx-btn hard"
                    onClick={performHardDelete}
                    disabled={isMutating}
                  >
                    {isMutating
                      ? t("updateCustomer.modal.deleting")
                      : t("updateCustomer.modal.deleteConfirm")}
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
