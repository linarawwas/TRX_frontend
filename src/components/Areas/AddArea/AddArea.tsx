// AddArea.tsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import AddToModel from "../../AddToModel/AddToModel";
import { createArea, fetchDays } from "../../../features/areas/api";

type Day = { _id: string; name: string };

const dayTranslations: Record<string, string> = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

const AddArea: React.FC = () => {
  const token: string = useSelector((s: any) => s.user.token);
  const companyId: string = useSelector((s: any) => s.user.companyId);

  const [days, setDays] = useState<Day[]>([]);
  const [formKey, setFormKey] = useState(0); // used to force reset/remount after success

  useEffect(() => {
    (async () => {
      const result = await fetchDays(token);
      if (result.error) {
        toast.error(result.error || "فشل في تحميل الأيام");
        return;
      }
      setDays(Array.isArray(result.data) ? result.data : []);
    })();
  }, [token]);

  const dayOptions = useMemo(
    () =>
      days.map((d) => ({
        value: d._id,
        label: dayTranslations[d.name] || d.name,
      })),
    [days]
  );

  const modelFields = {
    name: { label: "اسم المنطقة", "input-type": "text", required: true },
    dayId: {
      label: "اليوم",
      "input-type": "selectOption",
      options: [{ value: "", label: "اختر يوماً" }, ...dayOptions],
      required: true,
    },
  } as const;

  const validate = (data: Record<string, any>) => {
    if (!String(data.name || "").trim()) return "يرجى إدخال اسم المنطقة";
    if (!String(data.dayId || "").trim()) return "الرجاء اختيار اليوم";
    return null;
  };

  const onSubmit = async (data: Record<string, any>) => {
    const payload = {
      name: String(data.name).trim(),
      dayId: data.dayId,
      companyId, // server may already infer it; include if your API expects it
    };

    const response = await createArea(token, payload);
    if (response.error || !response.data) {
      throw new Error(response.error || "فشل في إنشاء المنطقة");
    }
    toast.success("تمت إضافة المنطقة بنجاح");
    return response.data;
  };


const confirmBuilder = (data: Record<string, any>) => {
  const selected = dayOptions.find(
    (o) => String(o.value) === String(
      typeof data.dayId === "object" && data.dayId?._id ? data.dayId._id : data.dayId
    )
  );
  const dayLabel = selected?.label ?? "—";

  return {
    title: "تأكيد إضافة المنطقة",
    body: (
      <div className="confirm-list">
        <div className="confirm-row">
          <div className="confirm-key">اسم المنطقة</div>
          <div className="confirm-val">{String(data.name || "—")}</div>
        </div>
        <div className="confirm-row">
          <div className="confirm-key">اليوم</div>
          <div className="confirm-val">{dayLabel}</div>
        </div>
      </div>
    ),
  };
};


  return (
    <AddToModel
      key={formKey}
      modelName="المناطق"
      title="إضافة منطقة جديدة"
      buttonLabel="➕ إضافة المنطقة"
      modelFields={modelFields as any}
      validate={validate}
      onSubmit={onSubmit}
      onSuccess={() => setFormKey((k) => k + 1)} // clear form fully
              confirmBuilder={confirmBuilder} // 👈 add this

    />
  );
};

export default AddArea;
