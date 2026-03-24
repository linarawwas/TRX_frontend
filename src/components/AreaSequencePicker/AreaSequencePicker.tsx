import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import "./AreaSequencePicker.css";
import {
  fetchCustomersByArea,
  reorderAreaCustomers,
} from "../../features/areas/api";

interface Customer {
  _id: string;
  name?: string;
  sequence?: number;
}

interface AreaSequencePickerProps {
  token: string;
  companyId: string;
  areaId: string;
  currentCustomerId?: string;
  value?: string;
  mode?: "picker" | "apply";
  onChange?: (value: string) => void;
  onApplied?: () => void;
  disabled?: boolean;
  title?: string;
}

/**
 * Reusable area-sequence placement picker.
 */
const AreaSequencePicker: React.FC<AreaSequencePickerProps> = ({
  token,
  companyId,
  areaId,
  currentCustomerId,
  value = "__END__",
  mode = "picker",
  onChange,
  onApplied,
  disabled = false,
  title = "تغيير الترتيب داخل المنطقة",
}) => {
  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState(value);
  const [busy, setBusy] = useState(false);

  // keep internal in sync if parent controls value
  useEffect(() => setPos(value), [value]);

  // load customers for this area (ordered)
  useEffect(() => {
    if (!areaId) {
      setList([]);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCustomersByArea(token, areaId);
        const sorted = [...data].sort((a: Customer, b: Customer) => {
          const sa = a.sequence ?? Number.POSITIVE_INFINITY;
          const sb = b.sequence ?? Number.POSITIVE_INFINITY;
          if (sa !== sb) return sa - sb;
          return (a.name || "").localeCompare(b.name || "", "ar");
        });
        setList(sorted);
      } catch (e) {
        console.error(e);
        toast.error("تعذر تحميل زبائن هذه المنطقة");
      } finally {
        setLoading(false);
      }
    })();
  }, [areaId, token]);

  // reset selection when area changes
  useEffect(() => {
    if (!areaId) return;
    setPos("__END__");
    onChange && onChange("__END__");
  }, [areaId, onChange]);

  // options, excluding the current customer (if provided)
  const options = useMemo(
    () => list.filter((c) => c._id !== currentCustomerId),
    [list, currentCustomerId]
  );

  const handleSelect = (v: string) => {
    setPos(v);
    onChange && onChange(v);
  };

  // only used in "apply" mode (update-customer flow)
  const applyNow = async () => {
    if (mode !== "apply") return;
    if (!areaId || !currentCustomerId) {
      toast.error("بيانات غير مكتملة");
      return;
    }

    const currentOrder = list.map((c) => c._id);
    const withoutMe = currentOrder.filter((id) => id !== currentCustomerId);

    let next: string[] = [];
    if (pos === "__START__") next = [currentCustomerId, ...withoutMe];
    else if (pos === "__END__") next = [...withoutMe, currentCustomerId];
    else {
      const idx = withoutMe.indexOf(pos);
      next =
        idx === -1
          ? [...withoutMe, currentCustomerId]
          : [
              ...withoutMe.slice(0, idx + 1),
              currentCustomerId,
              ...withoutMe.slice(idx + 1),
            ];
    }

    setBusy(true);
    try {
      const response = await reorderAreaCustomers(
        token,
        areaId,
        companyId,
        next
      );
      const data = response.data;
      if (!response.ok) {
        const message =
          typeof data?.error === "string" ? data.error : "تعذر حفظ الترتيب";
        toast.error(message);
        return;
      }
      toast.success("تم تحديث ترتيب الزبائن");
      onApplied && onApplied();
    } catch (e) {
      toast.error("خطأ في الشبكة");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`sequence-form ${disabled ? "is-disabled" : ""}`}>
      <div className="sequence-form__title">{title}</div>

      <div className="sequence-form__row">
        <label className="sequence-form__label">الموضع:</label>
        <select
          className="sequence-form__select"
          value={pos}
          onChange={(e) => handleSelect(e.target.value)}
          disabled={disabled || loading || !areaId || busy}
        >
          <option value="__START__">في بداية القائمة</option>
          <option value="__END__">في نهاية القائمة</option>
          {options.length > 0 && (
            <optgroup label="ضعه بعد:">
              {options.map((c) => (
                <option key={c._id} value={c._id}>
                  {typeof c.sequence === "number" ? `#${c.sequence} — ` : ""}
                  {c.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {mode === "apply" && (
        <button
          className="sequence-form__btn"
          type="button"
          onClick={applyNow}
          disabled={busy || !areaId}
        >
          {busy ? "جارٍ التطبيق…" : "تطبيق"}
        </button>
      )}
    </div>
  );
};

export default AreaSequencePicker;

