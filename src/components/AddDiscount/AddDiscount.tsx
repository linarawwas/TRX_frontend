import React, { useState, useEffect, type ChangeEvent } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import "./AddDiscount.css";
import { useCompanyAreas } from "../../features/customers/hooks/useCompanyAreas";
import { useAreaCustomers } from "../../features/areas/hooks/useAreaCustomers";
import { useCompanyExchangeRate } from "../../features/finance/hooks/useCompanyExchangeRate";
import { useUpdateCustomerDiscount } from "../../features/customers/hooks/useUpdateCustomerDiscount";

interface Customer {
  _id: string;
  name: string;
}

type DiscountCurrency = "USD" | "LBP";

interface FormData {
  areaId: string;
  customerId: string;
  hasDiscount: boolean;
  noteAboutCustomer: string;
  discountCurrency: DiscountCurrency; // input currency (UI only)
  valueAfterDiscount: number | ""; // user input
}

type AddDiscountProps = {
  /** When true, omit page title and use full-width layout for use inside a dialog. */
  embedded?: boolean;
};

const AddDiscount: React.FC<AddDiscountProps> = ({ embedded = false }) => {
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const token = useSelector((state: RootState) => state.user.token);

  const [formData, setFormData] = useState<FormData>({
    areaId: "",
    customerId: "",
    hasDiscount: true,
    noteAboutCustomer: "",
    discountCurrency: "USD",
    valueAfterDiscount: "",
  });

  // Helpers
  const fmtRate = (r: number | null) =>
    r ? `${r.toLocaleString("ar-LB")} ل.ل / 1$` : "—";

  const toNumber = (v: number | "") => (typeof v === "number" ? v : 0);

  const { areas: areaOptions, error: areasError } = useCompanyAreas(
    token,
    Boolean(token && companyId)
  );
  const { customers, error: customersError } = useAreaCustomers(
    token,
    formData.areaId,
    Boolean(token && formData.areaId)
  );
  const { exchangeRate } = useCompanyExchangeRate(token, Boolean(token));
  const { submit: submitDiscount, loading } = useUpdateCustomerDiscount(token);

  useEffect(() => {
    if (areasError) toast.error("خطأ في تحميل المناطق");
  }, [areasError]);

  useEffect(() => {
    if (customersError) toast.error("خطأ في تحميل العملاء");
  }, [customersError]);

  // Input handlers
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value as string | boolean }));
  };

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      valueAfterDiscount: val === "" ? "" : parseFloat(val),
    }));
  };

  // Derived preview: when user enters LBP, show the USD equivalent (read-only)
  const usdPreview =
    formData.discountCurrency === "LBP" && exchangeRate && exchangeRate > 0
      ? toNumber(formData.valueAfterDiscount) / exchangeRate
      : null;

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!token) {
      toast.error("جلسة المستخدم غير متاحة");
      return;
    }

    if (!formData.areaId || !formData.customerId) {
      toast.error("يرجى اختيار المنطقة والعميل");
      return;
    }

    if (
      formData.valueAfterDiscount === "" ||
      isNaN(Number(formData.valueAfterDiscount))
    ) {
      toast.error("يرجى إدخال قيمة الخصم بشكل صحيح");
      return;
    }

    // Always store discount in USD for backend consistency
    let valueAfterDiscountUSD = 0;
    if (formData.discountCurrency === "USD") {
      valueAfterDiscountUSD = toNumber(formData.valueAfterDiscount);
    } else {
      // LBP input -> need a server-managed rate to convert
      if (!exchangeRate || exchangeRate <= 0) {
        toast.error(
          "لا يمكن التحويل من ليرة إلى دولار لأن سعر الصرف غير متاح حالياً"
        );
        return;
      }
      valueAfterDiscountUSD =
        toNumber(formData.valueAfterDiscount) / exchangeRate;
    }

    // Normalize to 2 decimals
    valueAfterDiscountUSD = Math.round(valueAfterDiscountUSD * 100) / 100;

    // Payload to backend (always USD)
    const payload = {
      hasDiscount: formData.hasDiscount,
      noteAboutCustomer: formData.noteAboutCustomer,
      discountCurrency: "USD", // always normalized
      valueAfterDiscount: valueAfterDiscountUSD, // USD value
    };

    try {
      const response = await submitDiscount(formData.customerId, payload);
      if (response.error) throw new Error(response.error);

      toast.success("تم حفظ الخصم بنجاح!");

      setFormData({
        areaId: "",
        customerId: "",
        hasDiscount: true,
        noteAboutCustomer: "",
        discountCurrency: "USD",
        valueAfterDiscount: "",
      });
    } catch {
      toast.error("فشل حفظ الخصم. حاول مرة أخرى.");
    }
  };

  return (
    <div
      className={`add-discount-container${embedded ? " add-discount-container--embedded" : ""}`}
      dir="rtl"
    >
      {!embedded ? (
        <h1 className="title">إضافة خصم للعميل</h1>
      ) : null}
      <form onSubmit={handleSubmit}>
        <label>
          المنطقة:
          <select
            value={formData.areaId}
            onChange={(e) => handleInputChange("areaId", e.target.value)}
          >
            <option value="">اختر منطقة</option>
            {areaOptions.map((area) => (
              <option key={area._id} value={area._id}>
                {area.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          العميل:
          <select
            value={formData.customerId}
            onChange={(e) => handleInputChange("customerId", e.target.value)}
            disabled={!formData.areaId}
          >
            <option value="">اختر عميل</option>
            {(customers as Customer[]).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          شرح مختصر:
          <textarea
            value={formData.noteAboutCustomer}
            onChange={(e) =>
              handleInputChange("noteAboutCustomer", e.target.value)
            }
            placeholder="مثال: زبون يدفع آخر الشهر"
          />
        </label>

        <div className="row">
          <label className="grow">
            القيمة بعد الخصم:
            <input
              type="number"
              step="0.01"
              min="0" // ✅ allow 0 now
              value={
                formData.valueAfterDiscount === ""
                  ? ""
                  : formData.valueAfterDiscount
              }
              onChange={handleValueChange}
              inputMode="decimal"
            />
          </label>

          <label>
            عملة الإدخال:
            <select
              value={formData.discountCurrency}
              onChange={(e) =>
                handleInputChange(
                  "discountCurrency",
                  e.target.value as DiscountCurrency
                )
              }
            >
              <option value="USD">دولار</option>
              <option value="LBP">ليرة</option>
            </select>
          </label>
        </div>

        {/* Read-only context about rate & preview when LBP */}
        <div className="hint">
          <div>
            سعر الصرف (قراءة فقط): <strong>{fmtRate(exchangeRate)}</strong>
          </div>
          {formData.discountCurrency === "LBP" &&
          formData.valueAfterDiscount !== "" &&
          exchangeRate ? (
            <div>
              المعادِل بالدولار:{" "}
              <strong>{(usdPreview ?? 0).toFixed(2)} $</strong>
            </div>
          ) : null}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "يتم الإرسال..." : "إرسال"}
        </button>
      </form>
    </div>
  );
};

export default AddDiscount;
