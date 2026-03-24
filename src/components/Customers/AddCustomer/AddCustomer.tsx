// AddCustomer.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import AddToModel from "../../AddToModel/AddToModel";
import {
  createCustomerWithSequence,
  fetchActiveCustomersForArea,
} from "../../../features/customers/api";
import { useCompanyAreas } from "../../../features/customers/hooks/useCompanyAreas";

type CustomerLite = { _id: string; name: string; sequence?: number | null };

const AddCustomer: React.FC = () => {
  const token: string = useSelector((s: any) => s.user.token);

  const [afterList, setAfterList] = useState<CustomerLite[]>([]);
  const [currentAreaId, setCurrentAreaId] = useState<string>("");
  const [formKey, setFormKey] = useState(0); // re-mount to reset (we’ll keep area preselected)
  const { areas, error: areasError } = useCompanyAreas(token, Boolean(token));

  useEffect(() => {
    if (areasError) toast.error("تعذّر جلب المناطق");
  }, [areasError]);

  // load ACTIVE customers for selected area (for "after X")
  useEffect(() => {
    if (!currentAreaId) {
      setAfterList([]);
      return;
    }
    (async () => {
      try {
        const list = await fetchActiveCustomersForArea(token, currentAreaId);
        const sorted = [...(list || [])].sort((a, b) => {
          const sa = a.sequence ?? Number.POSITIVE_INFINITY;
          const sb = b.sequence ?? Number.POSITIVE_INFINITY;
          if (sa !== sb) return sa - sb;
          return (a.name || "").localeCompare(b.name || "", "ar");
        });
        setAfterList(sorted);
      } catch {
        toast.error("تعذّر جلب زبائن المنطقة");
      }
    })();
  }, [currentAreaId, token]);

  const areaOptions = useMemo(
    () =>
      areas.map((a) => ({
        value: a._id,
        label: a.name,
      })),
    [areas]
  );

  const placementOptions = useMemo(() => {
    const base = [
      { value: "__START__", label: "في بداية القائمة" },
      { value: "__END__", label: "في نهاية القائمة" },
    ];
    if (!currentAreaId || afterList.length === 0) return base;
    return [
      ...base,
      ...afterList.map((c) => ({
        value: c._id,
        label: `${c.sequence ? `#${c.sequence} — ` : ""}${c.name}`,
      })),
    ];
  }, [currentAreaId, afterList]);

  const modelFields = {
    name: { label: "الاسم", "input-type": "text", required: true },
    phone: { label: "الهاتف", "input-type": "text", required: false },
    areaId: {
      label: "المنطقة",
      "input-type": "selectOption",
      options: [{ value: "", label: "اختر منطقة" }, ...areaOptions],
      required: true,
    },
    address: { label: "العنوان", "input-type": "text", required: false },
    placement: {
      label: "الترتيب في المنطقة",
      "input-type": "selectOption",
      options: placementOptions,
      required: true,
    },
  } as const;

  const validate = (data: Record<string, any>) => {
    const name = String(data.name || "").trim();
    if (!name) return "الاسم مطلوب";
    if (!String(data.areaId || "").trim()) return "الرجاء اختيار المنطقة";
    const phone = String(data.phone || "");
    if (phone && !/^\d+$/.test(phone)) return "أدخل أرقام فقط في الهاتف";
    return null;
  };

  const onSubmit = async (data: Record<string, any>) => {
    const payload = {
      name: String(data.name).trim(),
      phone: String(data.phone || ""),
      address: String(data.address || ""),
      areaId: data.areaId,
      placement: data.placement || "__END__", // "__START__" | "__END__" | <customerId>
      startAt: 1,
    };

    const response = await createCustomerWithSequence(token, payload);
    const j = response.data;
    if (!response.ok) throw new Error((j as { error?: string })?.error || "فشل إنشاء الزبون");
    return j;
  };

  const confirmBuilder = (data: Record<string, any>) => {
    const areaLabel =
      areaOptions.find((o) => String(o.value) === String(data.areaId))?.label ||
      "—";

    let placementLabel = "—";
    if (data.placement === "__START__") placementLabel = "في بداية القائمة";
    else if (data.placement === "__END__") placementLabel = "في نهاية القائمة";
    else {
      const t =
        afterList.find((c) => String(c._id) === String(data.placement)) || null;
      placementLabel = t
        ? `بعد: ${t.sequence ? `#${t.sequence} — ` : ""}${t.name}`
        : "—";
    }

    return {
      title: "تأكيد إضافة الزبون",
      body: (
        <div className="confirm-list">
          <div className="confirm-row">
            <div className="confirm-key">الاسم</div>
            <div className="confirm-val">{String(data.name || "—")}</div>
          </div>
          <div className="confirm-row">
            <div className="confirm-key">الهاتف</div>
            <div className="confirm-val">{String(data.phone || "—")}</div>
          </div>
          <div className="confirm-row">
            <div className="confirm-key">المنطقة</div>
            <div className="confirm-val">{areaLabel}</div>
          </div>
          <div className="confirm-row">
            <div className="confirm-key">العنوان</div>
            <div className="confirm-val">{String(data.address || "—")}</div>
          </div>
          <div className="confirm-row">
            <div className="confirm-key">الترتيب</div>
            <div className="confirm-val">{placementLabel}</div>
          </div>
        </div>
      ),
    };
  };

  // keep the selected area after successful add (speeds bulk entry):
  const onSuccess = (_res: any, lastData?: Record<string, any>) => {
    const keepArea = lastData?.areaId || currentAreaId;
    setFormKey((k) => k + 1); // remount & reset
    // reapply the same area once the component remounts
    setTimeout(() => setCurrentAreaId(String(keepArea || "")), 0);
  };

  return (
    <AddToModel
      key={formKey}
      modelName="الزبائن"
      title="إضافة زبون"
      buttonLabel="إضافة الزبون"
      modelFields={modelFields as any}
      validate={validate}
      onSubmit={onSubmit}
      onSuccess={() => {
        // we also want a toast & preserve area:
        // AddToModel already clears the form; we remount to set default area back.
        onSuccess(undefined as any, { areaId: currentAreaId });
      }}
      onFieldChange={(name, value) => {
        if (name === "areaId") setCurrentAreaId(String(value || ""));
      }}
      confirmBuilder={confirmBuilder} // 👈 add this
      initialValues={{
        // optional: if you want to seed a default area, set it here
        areaId: currentAreaId || "",
        placement: "__END__",
      }}
    />
  );
};

export default AddCustomer;
