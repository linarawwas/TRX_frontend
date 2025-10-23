import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  setShipmentExpensesInLiras,
  setShipmentExpensesInUSD,
} from "../../../redux/Shipment/action";
import AddToModel from "../../AddToModel/AddToModel";

type ExpenseForm = {
  name: string;
  value: number | string;       // AddToModel may pass string
  paymentCurrency: "USD" | "LBP";
};

const AddExpenses: React.FC = () => {
  const shipmentId = useSelector((state: RootState) => state.shipment._id);
  const token = useSelector((state: RootState) => state.user.token);
  const dispatch = useDispatch();

  const expensesLbp = useSelector((s: any) => s.shipment.expensesInLiras) ?? 0;
  const expensesUsd = useSelector((s: any) => s.shipment.expensesInUSD) ?? 0;

  const handleSubmit = async (formData: ExpenseForm) => {
    try {
      // Normalize payload
      const valueNum = Number(formData.value);
      if (!formData.name?.trim()) {
        toast.error("يرجى إدخال اسم المصروف");
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

      // Server-managed tenancy + exchange rate: do NOT send companyId or exchangeRate
      const payload = {
        name: formData.name.trim(),
        value: valueNum,
        paymentCurrency:
          formData.paymentCurrency === "LBP" ? "LBP" : "USD",
        shipmentId,
      };

      const res = await fetch("https://trx-api.linarawas.com/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(`خطأ في تسجيل المصروف: ${data.error || res.statusText}`);
        return;
      }

      // Update local shipment totals
      if (payload.paymentCurrency === "USD") {
        dispatch(setShipmentExpensesInUSD(Number(expensesUsd) + valueNum));
      } else {
        dispatch(setShipmentExpensesInLiras(Number(expensesLbp) + valueNum));
      }

      toast.success("تم تسجيل المصروف بنجاح");
      return res;
    } catch (err: any) {
      toast.error(`خطأ في الشبكة: ${err?.message || err}`);
      throw err;
    }
  };

  const expensesConfig = {
    "component-related-fields": {
      modelName: "المصاريف",
      title: "إضافة مصاريف",
      "button-label": "إضافة مصاريف",
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
      modelName={expensesConfig["component-related-fields"].modelName}
      title={expensesConfig["component-related-fields"].title}
      buttonLabel={expensesConfig["component-related-fields"]["button-label"]}
      modelFields={expensesConfig["model-related-fields"]}
      onSubmit={handleSubmit}
    />
  );
};

export default AddExpenses;
