import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  setShipmentProfitsInLiras,
  setShipmentProfitsInUSD,
} from "../../../redux/Shipment/action";
import AddToModel from "../../AddToModel/AddToModel";

type ProfitForm = {
  name: string;
  value: number | string;          // AddToModel may send strings
  paymentCurrency: "USD" | "LBP";
};

const AddProfits: React.FC = () => {
  const shipmentId = useSelector((s: RootState) => s.shipment._id);
  const token = useSelector((s: RootState) => s.user.token);
  const dispatch = useDispatch();

  const profitsLBP = useSelector((s: any) => s.shipment.profitsInLiras) ?? 0;
  const profitsUSD = useSelector((s: any) => s.shipment.profitsInUSD) ?? 0;

  const handleSubmit = async (formData: ProfitForm) => {
    try {
      // normalize + validate
      const valueNum = Number(formData.value);
      const currency =
        String(formData.paymentCurrency).toUpperCase() === "LBP" ? "LBP" : "USD";

      if (!formData.name?.trim()) {
        toast.error("يرجى إدخال اسم الربح");
        return;
      }
      if (!Number.isFinite(valueNum) || valueNum < 0) {
        toast.error("قيمة غير صالحة");
        return;
      }
      if (!shipmentId) {
        toast.error("لا توجد شحنة محددة");
        return;
      }

      // Do NOT send companyId or exchangeRate; backend derives them
      const payload = {
        name: formData.name.trim(),
        value: valueNum,
        paymentCurrency: currency,
        shipmentId,
      };

      const res = await fetch("http://localhost:5000/api/extraProfits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(`فشل تسجيل الربح: ${data.error || res.statusText}`);
        return;
      }

      // update live shipment totals
      if (currency === "USD") {
        dispatch(setShipmentProfitsInUSD(Number(profitsUSD) + valueNum));
      } else {
        dispatch(setShipmentProfitsInLiras(Number(profitsLBP) + valueNum));
      }

      toast.success("تم تسجيل الربح الإضافي");
      return res;
    } catch (err: any) {
      toast.error(`خطأ في الشبكة: ${err?.message || err}`);
      throw err;
    }
  };

  const profitsConfig = {
    "component-related-fields": {
      modelName: "الأرباح الإضافية",
      title: "إضافة إلى الأرباح",
      "button-label": "إضافة ربح",
    },
    "model-related-fields": {
      name: { label: "الاسم", "input-type": "text" },
      value: { label: "القيمة", "input-type": "number" },
      paymentCurrency: {
        label: "عملة الدفع",
        "input-type": "selectOption",
        options: [
          { value: "USD", label: "دولار أمريكي" },
          { value: "LBP", label: "ليرة لبنانية" },
        ],
      },
    },
  };

  return (
    <AddToModel
      modelName={profitsConfig["component-related-fields"].modelName}
      title={profitsConfig["component-related-fields"].title}
      buttonLabel={profitsConfig["component-related-fields"]["button-label"]}
      modelFields={profitsConfig["model-related-fields"]}
      onSubmit={handleSubmit}
    />
  );
};

export default AddProfits;
