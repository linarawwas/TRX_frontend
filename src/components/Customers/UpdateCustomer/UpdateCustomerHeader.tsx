import React from "react";
import { t } from "../../../utils/i18n";

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
            <h1 className="ucx-title">
              {customerData?.name || t("updateCustomer.header.customerFallback")}
            </h1>
            <div className="ucx-sub">
              {customerData?.phone
                ? `📞 ${customerData.phone}`
                : t("updateCustomer.header.emDash")}
              {customerData?.address ? ` · 📍 ${customerData.address}` : ""}
            </div>
          </div>
        </div>

        {customerData && (
          <div className="ucx-hero__right">
            <span
              className={`ucx-chip ${customerData.isActive ? "ok" : "off"}`}
            >
              {customerData.isActive
                ? t("updateCustomer.status.active")
                : t("updateCustomer.status.inactive")}
            </span>
            {customerData.isActive ? (
              <button
                type="button"
                className="ucx-btn danger sm"
                onClick={onDeactivate}
                disabled={isMutating}
              >
                {t("updateCustomer.header.deactivate")}
              </button>
            ) : (
              <div className="ucx-restoreBar">
                <button
                  type="button"
                  className="ucx-btn primary sm"
                  onClick={onRestoreAuto}
                  disabled={isMutating}
                >
                  {t("updateCustomer.header.restore")}
                </button>
                {showRestoreOptions && (
                  <form
                    className="ucx-restoreInline"
                    onSubmit={onRestoreWithSequence}
                  >
                    <label className="ucx-restoreLabel">
                      {t("updateCustomer.header.sequenceLabel")}
                    </label>
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
                      placeholder={t("updateCustomer.header.restorePlaceholder")}
                    />
                    <button
                      className="ucx-btn secondary sm"
                      type="submit"
                      disabled={isMutating}
                    >
                      {t("updateCustomer.header.restoreSave")}
                    </button>
                  </form>
                )}
              </div>
            )}
            <button
              type="button"
              className={`ucx-btn ${isAdmin ? "hard sm" : "hardDisabled sm"}`}
              onClick={onOpenDeleteModal}
              disabled={!isAdmin || isMutating}
              title={
                isAdmin
                  ? t("updateCustomer.header.hardDeleteTitleEnabled")
                  : t("updateCustomer.header.hardDeleteTitleDisabled")
              }
            >
              {t("updateCustomer.header.hardDelete")}
            </button>
          </div>
        )}
      </header>

      <div className="ucx-actionsRow">
        {customerData?.isActive && !isAdmin && (
          <button type="button" className="ucx-btn success" onClick={onRecordOrder}>
            {t("updateCustomer.header.recordOrderExternal")}
          </button>
        )}
        <button type="button" className="ucx-btn primary outline" onClick={onViewStatement}>
          {t("updateCustomer.header.statement")}
        </button>
        <button
          type="button"
          className="ucx-btn secondary"
          onClick={onToggleEdit}
          aria-expanded={editOpen}
        >
          {editOpen
            ? t("updateCustomer.header.toggleEditHide")
            : t("updateCustomer.header.toggleEditShow")}
        </button>
      </div>
    </>
  );
}
