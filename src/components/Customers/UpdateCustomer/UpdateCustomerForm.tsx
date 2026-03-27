import React from "react";
import { t } from "../../../utils/i18n";

type Area = { _id: string; name: string };
type PlacementOption = { value: string; label: string };

type CustomerData = {
  name?: string;
  phone?: string;
  address?: string;
  sequence?: number | null;
};

type UpdatedInfo = {
  name: string;
  phone: string;
  address: string;
  areaId: string;
  placement: string;
};

type UpdateCustomerFormProps = {
  areas: Area[];
  customerData: CustomerData | null;
  editOpen: boolean;
  placementLoading: boolean;
  placementOptions: PlacementOption[];
  targetAreaId: string;
  updatedInfo: UpdatedInfo;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function UpdateCustomerForm({
  areas,
  customerData,
  editOpen,
  placementLoading,
  placementOptions,
  targetAreaId,
  updatedInfo,
  onChange,
  onSubmit,
}: UpdateCustomerFormProps) {
  if (!editOpen) {
    return null;
  }

  return (
    <form className="ucx-formCard" onSubmit={onSubmit}>
      <h3 className="ucx-formCard__title">{t("updateCustomer.form.title")}</h3>

      <div className="ucx-fields">
        <div className="ucx-field">
          <label htmlFor="ucx-name" className="ucx-label">
            {t("updateCustomer.form.name")}
          </label>
          <input
            id="ucx-name"
            className="ucx-input"
            type="text"
            name="name"
            value={updatedInfo.name}
            placeholder={customerData?.name || t("updateCustomer.form.placeholderNewName")}
            onChange={onChange}
          />
        </div>

        <div className="ucx-field">
          <label htmlFor="ucx-phone" className="ucx-label">
            {t("updateCustomer.form.phone")}
          </label>
          <input
            id="ucx-phone"
            className="ucx-input"
            type="text"
            name="phone"
            value={updatedInfo.phone}
            placeholder={customerData?.phone || t("updateCustomer.form.placeholderNewPhone")}
            onChange={onChange}
          />
        </div>

        <div className="ucx-field ucx-field--full">
          <label htmlFor="ucx-address" className="ucx-label">
            {t("updateCustomer.form.address")}
          </label>
          <input
            id="ucx-address"
            className="ucx-input"
            type="text"
            name="address"
            value={updatedInfo.address}
            placeholder={customerData?.address || t("updateCustomer.form.placeholderNewAddress")}
            onChange={onChange}
          />
        </div>

        <div className="ucx-field ucx-field--full">
          <label htmlFor="ucx-area" className="ucx-label">
            {t("updateCustomer.form.area")}
          </label>
          <select
            id="ucx-area"
            name="areaId"
            className="ucx-select"
            value={updatedInfo.areaId || ""}
            onChange={onChange}
          >
            <option value="">{t("updateCustomer.form.selectArea")}</option>
            {areas.map((area) => (
              <option key={area._id} value={area._id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ucx-field ucx-field--full">
          <label htmlFor="ucx-placement" className="ucx-label">
            {t("updateCustomer.form.placement")}
          </label>
          <select
            id="ucx-placement"
            name="placement"
            className="ucx-select"
            value={updatedInfo.placement}
            onChange={onChange}
            disabled={placementLoading || !targetAreaId}
          >
            <option value="">
              {targetAreaId
                ? t("updateCustomer.form.keepPlacement")
                : t("updateCustomer.form.chooseAreaFirst")}
            </option>
            {placementOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <small className="ucx-hint">
            {placementLoading
              ? t("updateCustomer.form.placementLoading")
              : t("updateCustomer.form.placementHint")}
          </small>
        </div>

        {customerData?.sequence != null && (
          <div className="ucx-field ucx-field--full">
            <label className="ucx-label">{t("updateCustomer.form.currentSequence")}</label>
            <div className="ucx-readonly">#{customerData.sequence}</div>
          </div>
        )}
      </div>

      <div className="ucx-formCard__actions">
        <button className="ucx-btn primary ucx-btn--sm" type="submit">
          {t("updateCustomer.form.submit")}
        </button>
      </div>
    </form>
  );
}
