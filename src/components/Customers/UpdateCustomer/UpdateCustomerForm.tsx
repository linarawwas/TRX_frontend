import React from "react";

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
      <h3 className="ucx-formCard__title">تعديل بيانات الزبون</h3>

      <div className="ucx-fields">
        <div className="ucx-field">
          <label htmlFor="ucx-name" className="ucx-label">
            الاسم
          </label>
          <input
            id="ucx-name"
            className="ucx-input"
            type="text"
            name="name"
            value={updatedInfo.name}
            placeholder={customerData?.name || "الاسم الجديد"}
            onChange={onChange}
          />
        </div>

        <div className="ucx-field">
          <label htmlFor="ucx-phone" className="ucx-label">
            الهاتف
          </label>
          <input
            id="ucx-phone"
            className="ucx-input"
            type="text"
            name="phone"
            value={updatedInfo.phone}
            placeholder={customerData?.phone || "رقم الهاتف الجديد"}
            onChange={onChange}
          />
        </div>

        <div className="ucx-field ucx-field--full">
          <label htmlFor="ucx-address" className="ucx-label">
            العنوان
          </label>
          <input
            id="ucx-address"
            className="ucx-input"
            type="text"
            name="address"
            value={updatedInfo.address}
            placeholder={customerData?.address || "العنوان الجديد"}
            onChange={onChange}
          />
        </div>

        <div className="ucx-field ucx-field--full">
          <label htmlFor="ucx-area" className="ucx-label">
            المنطقة
          </label>
          <select
            id="ucx-area"
            name="areaId"
            className="ucx-select"
            value={updatedInfo.areaId || ""}
            onChange={onChange}
          >
            <option value="">اختر المنطقة…</option>
            {areas.map((area) => (
              <option key={area._id} value={area._id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ucx-field ucx-field--full">
          <label htmlFor="ucx-placement" className="ucx-label">
            الموضع داخل المنطقة
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
              {targetAreaId ? "(احتفظ بالموضع الحالي)" : "اختر منطقة أولاً"}
            </option>
            {placementOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <small className="ucx-hint">
            {placementLoading
              ? "جارٍ تحميل مواقع الزبائن…"
              : "يمكنك تحديد موقع الزبون بالنسبة لباقي زبائن المنطقة."}
          </small>
        </div>

        {customerData?.sequence != null && (
          <div className="ucx-field ucx-field--full">
            <label className="ucx-label">الترتيب الحالي</label>
            <div className="ucx-readonly">#{customerData.sequence}</div>
          </div>
        )}
      </div>

      <div className="ucx-formCard__actions">
        <button className="ucx-btn primary ucx-btn--sm" type="submit">
          حفظ التعديلات
        </button>
      </div>
    </form>
  );
}
