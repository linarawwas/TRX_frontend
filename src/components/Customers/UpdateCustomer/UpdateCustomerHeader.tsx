import React, { memo } from "react";
import type { CustomerDetail } from "../../../features/customers/apiCustomers";
import { t } from "../../../utils/i18n";

/** Minimal customer shape the header renders; aligned with `CustomerDetail` for type safety. */
export type UpdateCustomerHeaderCustomer = Pick<
  CustomerDetail,
  "name" | "phone" | "address" | "isActive"
>;

export type UpdateCustomerHeaderProps = {
  avatarText: string;
  customerData: UpdateCustomerHeaderCustomer | null;
  /** Stabilizes subtree identity when navigating between records (parent still owns data fetching). */
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

const HEADING_ID = "ucx-customer-heading";
const RESTORE_SEQUENCE_INPUT_ID = "ucx-restore-sequence";

type HeroIdentityProps = {
  avatarText: string;
  customer: UpdateCustomerHeaderCustomer | null;
};

/**
 * Avatar + page title + contact line. Pure presentation; no side effects.
 */
const HeroIdentity = memo(function HeroIdentity({
  avatarText,
  customer,
}: HeroIdentityProps) {
  const title =
    customer?.name ?? t("updateCustomer.header.customerFallback");
  const emDash = t("updateCustomer.header.emDash");
  const phone = customer?.phone;
  const address = customer?.address;

  return (
    <div className="ucx-hero__left">
      <div className="ucx-avatar" aria-hidden="true">
        {avatarText}
      </div>
      <div className="ucx-hero__text">
        <h1 className="ucx-title" id={HEADING_ID}>
          {title}
        </h1>
        <p className="ucx-sub ucx-hero__subtitle">
          {phone ? (
            <span className="ucx-hero__meta">{phone}</span>
          ) : (
            <span className="ucx-hero__meta ucx-hero__meta--placeholder">
              {emDash}
            </span>
          )}
          {address ? (
            <>
              <span className="ucx-hero__metaSep" aria-hidden="true">
                ·
              </span>
              <span className="ucx-hero__meta">{address}</span>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
});

type StatusChipProps = { isActive: boolean };

const StatusChip = memo(function StatusChip({ isActive }: StatusChipProps) {
  return (
    <span className={`ucx-chip ${isActive ? "ok" : "off"}`}>
      {isActive
        ? t("updateCustomer.status.active")
        : t("updateCustomer.status.inactive")}
    </span>
  );
});

type RestoreSequenceFormProps = {
  restoreSequence: number | "";
  isMutating: boolean;
  onSequenceChange: (value: number | "") => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const RestoreSequenceForm = memo(function RestoreSequenceForm({
  restoreSequence,
  isMutating,
  onSequenceChange,
  onSubmit,
}: RestoreSequenceFormProps) {
  return (
    <form className="ucx-restoreInline" onSubmit={onSubmit}>
      <label className="ucx-restoreLabel" htmlFor={RESTORE_SEQUENCE_INPUT_ID}>
        {t("updateCustomer.header.sequenceLabel")}
      </label>
      <input
        id={RESTORE_SEQUENCE_INPUT_ID}
        className="ucx-input sm"
        type="number"
        min={1}
        value={restoreSequence}
        onChange={(e) =>
          onSequenceChange(
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
  );
});

type HeroRightProps = {
  customer: UpdateCustomerHeaderCustomer;
  isAdmin: boolean;
  isMutating: boolean;
  restoreSequence: number | "";
  showRestoreOptions: boolean;
  onDeactivate: () => void;
  onOpenDeleteModal: () => void;
  onRestoreAuto: () => void;
  onRestoreSequenceChange: (value: number | "") => void;
  onRestoreWithSequence: (event: React.FormEvent<HTMLFormElement>) => void;
};

/**
 * Status, lifecycle actions (deactivate / restore / hard delete). Behavior matches previous inline JSX.
 */
const HeroRight = memo(function HeroRight({
  customer,
  isAdmin,
  isMutating,
  restoreSequence,
  showRestoreOptions,
  onDeactivate,
  onOpenDeleteModal,
  onRestoreAuto,
  onRestoreSequenceChange,
  onRestoreWithSequence,
}: HeroRightProps) {
  /** Matches prior JSX: only truthy `isActive` is treated as active (deactivate + chip). */
  const isActive = Boolean(customer.isActive);

  return (
    <div className="ucx-hero__right">
      <StatusChip isActive={isActive} />
      {isActive ? (
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
          {showRestoreOptions ? (
            <RestoreSequenceForm
              restoreSequence={restoreSequence}
              isMutating={isMutating}
              onSequenceChange={onRestoreSequenceChange}
              onSubmit={onRestoreWithSequence}
            />
          ) : null}
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
  );
});

type PrimaryToolbarProps = {
  customer: UpdateCustomerHeaderCustomer | null;
  isAdmin: boolean;
  editOpen: boolean;
  onRecordOrder: () => void;
  onViewStatement: () => void;
  onToggleEdit: () => void;
};

const PrimaryToolbar = memo(function PrimaryToolbar({
  customer,
  isAdmin,
  editOpen,
  onRecordOrder,
  onViewStatement,
  onToggleEdit,
}: PrimaryToolbarProps) {
  const showExternalOrder = Boolean(customer?.isActive) && !isAdmin;

  return (
    <nav
      className="ucx-actionsRow"
      aria-label={t("updateCustomer.header.actionsNavAriaLabel")}
    >
      {showExternalOrder ? (
        <button
          type="button"
          className="ucx-btn success"
          onClick={onRecordOrder}
        >
          {t("updateCustomer.header.recordOrderExternal")}
        </button>
      ) : null}
      <button
        type="button"
        className="ucx-btn primary outline"
        onClick={onViewStatement}
      >
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
    </nav>
  );
});

function UpdateCustomerHeaderInner({
  avatarText,
  customerData,
  customerId,
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
    <React.Fragment key={customerId}>
      <header
        className="ucx-hero"
        aria-label={t("updateCustomer.header.heroAriaLabel")}
        aria-busy={isMutating}
      >
        <HeroIdentity avatarText={avatarText} customer={customerData} />
        {customerData ? (
          <HeroRight
            customer={customerData}
            isAdmin={isAdmin}
            isMutating={isMutating}
            restoreSequence={restoreSequence}
            showRestoreOptions={showRestoreOptions}
            onDeactivate={onDeactivate}
            onOpenDeleteModal={onOpenDeleteModal}
            onRestoreAuto={onRestoreAuto}
            onRestoreSequenceChange={onRestoreSequenceChange}
            onRestoreWithSequence={onRestoreWithSequence}
          />
        ) : null}
      </header>

      <PrimaryToolbar
        customer={customerData}
        isAdmin={isAdmin}
        editOpen={editOpen}
        onRecordOrder={onRecordOrder}
        onViewStatement={onViewStatement}
        onToggleEdit={onToggleEdit}
      />
    </React.Fragment>
  );
}

/**
 * Customer update page — hero (identity + status/actions) and primary toolbar.
 * Stateless: all data and handlers come from the route controller; no fetching or RTK here.
 */
const UpdateCustomerHeader = memo(UpdateCustomerHeaderInner);

export default UpdateCustomerHeader;
