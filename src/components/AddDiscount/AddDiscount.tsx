import React, { useState, useEffect, ChangeEvent } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import "./AddDiscount.css";

interface Area {
  _id: string;
  name: string;
}

interface Customer {
  _id: string;
  name: string;
}

interface FormData {
  areaId: string;
  customerId: string;
  hasDiscount: boolean;
  noteAboutCustomer: string;
  discountCurrency: string; // "USD" | "LBP"
  valueAfterDiscount: number | ""; // can be empty string for blank input
}

const AddDiscount: React.FC = () => {
  const companyId = useSelector((state: RootState) => state.user.companyId);
  const token = useSelector((state: RootState) => state.user.token);
  const [areaOptions, setAreaOptions] = useState<Area[]>([]);
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    areaId: "",
    customerId: "",
    hasDiscount: true,
    noteAboutCustomer: "",
    discountCurrency: "USD",
    valueAfterDiscount: "",
  });

  // Fetch areas
  useEffect(() => {
    fetch(`https://trx-api.linarawas.com/api/areas/company/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAreaOptions)
      .catch((error) => toast.error("خطأ في تحميل المناطق"));
  }, [companyId, token]);

  // Fetch exchange rate
  useEffect(() => {
    fetch(`https://trx-api.linarawas.com/api/exchangeRates/6878aa9ac9f1a18731a5b8a4`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setExchangeRate(data.exchangeRateInLBP))
      .catch((error) => toast.error("خطأ في تحميل سعر الصرف"));
  }, [token]);

  // Fetch customers by area
  useEffect(() => {
    if (formData.areaId) {
      fetch(`https://trx-api.linarawas.com/api/customers/area/${formData.areaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setCustomerOptions)
        .catch((error) => toast.error("خطأ في تحميل العملاء"));
    }
  }, [formData.areaId, token]);

  // Input change for text/select fields
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Input change for the value (number) field
  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      valueAfterDiscount: val === "" ? "" : parseFloat(val),
    }));
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.areaId || !formData.customerId) {
      toast.error("يرجى اختيار المنطقة والعميل");
      setLoading(false);
      return;
    }
    if (
      formData.valueAfterDiscount === "" ||
      isNaN(Number(formData.valueAfterDiscount))
    ) {
      toast.error("يرجى إدخال قيمة الخصم بشكل صحيح");
      setLoading(false);
      return;
    }
    let dollarValue = 0;
    if (formData.discountCurrency === "USD") {
      dollarValue =
        typeof formData.valueAfterDiscount === "number"
          ? formData.valueAfterDiscount
          : 0;
    } else if (formData.discountCurrency === "LBP") {
      dollarValue =
        typeof formData.valueAfterDiscount === "number"
          ? formData.valueAfterDiscount / exchangeRate
          : 0;
    }

    // Round to 2 decimals
    dollarValue = Math.round(dollarValue * 100) / 100;

    // Prepare payload, always send as USD to backend
    const payload = {
      ...formData,
      valueAfterDiscount: dollarValue,
      discountCurrency: "USD",
    };
    console.log(payload);
    try {
      const res = await fetch(
        `https://trx-api.linarawas.com/api/customers/${formData.customerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      toast.success("تم حفظ الخصم بنجاح!");
      setFormData({
        areaId: "",
        customerId: "",
        hasDiscount: true,
        noteAboutCustomer: "",
        discountCurrency: "USD",
        valueAfterDiscount: "",
      });
    } catch (error) {
      toast.error("فشل حفظ الخصم. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-discount-container">
      <h1 className="title">إضافة خصم للعميل</h1>
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
          >
            <option value="">اختر عميل</option>
            {customerOptions.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
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
          />
        </label>

        <label>
          القيمة بعد الخصم:
          <input
            type="number"
            step="0.01"
            min="0"
            value={
              formData.valueAfterDiscount === ""
                ? ""
                : formData.valueAfterDiscount
            }
            onChange={handleValueChange}
          />
        </label>

        <label>
          عملة الخصم:
          <select
            value={formData.discountCurrency}
            onChange={(e) =>
              handleInputChange("discountCurrency", e.target.value)
            }
          >
            <option value="USD">دولار أمريكي</option>
            <option value="LBP">ليرة لبنانية</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "يتم الإرسال..." : "إرسال"}
        </button>
      </form>
    </div>
  );
};

export default AddDiscount;
