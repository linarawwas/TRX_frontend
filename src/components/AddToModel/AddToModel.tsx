// for profits, expenses, products, and shipments:

import React, { useState, useCallback, ChangeEvent, FormEvent, useMemo, useRef } from "react";
import "./AddToModel.css";
import VerticalNumberPicker from "./VerticalNumberPicker";
import TripleDigitPicker from "./TripleDigitPicker";

interface FieldConfig {
  label: string;
  "input-type": "text" | "number" | "slider" | "selectOption" | "numberPicker" | "tripleDigit";
  options?: { value: string | number | boolean; label: string }[];
  required?: boolean;            // default: true
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface ModelFields {
  [key: string]: FieldConfig;
}

interface Props {
  modelName: string;
  title: string;
  buttonLabel: string;
  modelFields: ModelFields;
  onSubmit: (data: Record<string, any>) => Promise<any>;
  initialValues?: Record<string, string | number | boolean>;
  validate?: (data: Record<string, any>) => string | null; // return error message or null
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
}

const AddToModel: React.FC<Props> = ({
  modelName,
  title,
  buttonLabel,
  modelFields,
  onSubmit,
  initialValues = {},
  validate,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({ ...initialValues });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const inFlight = useRef(false);

  // Autofocus first field name
  const firstFieldName = useMemo(() => Object.keys(modelFields)[0] ?? "", [modelFields]);

  const setField = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const cfg = modelFields[name];
    if (!cfg) return;

    // Normalize numbers
    if (cfg["input-type"] === "number") {
      setField(name, value === "" ? "" : Number(value));
    } else if (type === "select-one") {
      setField(name, value);
    } else {
      setField(name, value);
    }
  };

  const handleNumberPickerChange = useCallback((fieldName: string, val: number) => {
    setField(fieldName, val);
  }, [setField]);

  // Build payload with numeric normalization where applicable
  const buildPayload = useCallback(() => {
    const payload: Record<string, any> = {};
    for (const [name, cfg] of Object.entries(modelFields)) {
      const v = formData[name];
      if (cfg["input-type"] === "number" || cfg["input-type"] === "numberPicker") {
        payload[name] = v === "" || v === undefined ? "" : Number(v);
      } else {
        payload[name] = v;
      }
    }
    return payload;
  }, [formData, modelFields]);

  // Basic required check (can be overridden with validate())
  const validateLocal = useCallback((): string | null => {
    for (const [name, cfg] of Object.entries(modelFields)) {
      const required = cfg.required !== false; // default true
      if (!required) continue;
      const v = formData[name];
      if (v === undefined || v === null || v === "") {
        return `يرجى تعبئة الحقل: ${cfg.label}`;
      }
    }
    return null;
  }, [formData, modelFields]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || inFlight.current) return; // hard guard

    // Validation
    setStatusMsg(null);
    const localErr = validateLocal();
    if (localErr) {
      setStatusMsg(localErr);
      return;
    }
    const customErr = validate?.(formData) ?? null;
    if (customErr) {
      setStatusMsg(customErr);
      return;
    }

    // Lock UI
    setIsSubmitting(true);
    inFlight.current = true;
    setStatusMsg("جارٍ الحفظ...");

    try {
      const payload = buildPayload();
      const result = await onSubmit(payload);
      setStatusMsg("تم الحفظ بنجاح ✅");
      onSuccess?.(result);

      // Optional: reset fields after success (comment out if you prefer to keep values)
      setFormData({});
    } catch (error: any) {
      setStatusMsg(error?.message || "حدث خطأ غير متوقع. حاول مجددًا.");
    } finally {
      // keep the success message visible for a moment
      setTimeout(() => {
        setIsSubmitting(false);
        inFlight.current = false;
        setStatusMsg(null);
      }, 800);
    }
  };

  return (
    <div className={`add-model-container ${isSubmitting ? "submitting" : ""}`} dir="rtl" aria-busy={isSubmitting}>
      {/* Progress bar */}
      {isSubmitting && <div className="submit-bar" aria-hidden="true" />}

      <h1 className="add-model-title">{title}</h1>

      <form className="add-model-form" onSubmit={handleSubmit}>
        {/* Status line for SR/visual feedback */}
        {statusMsg && (
          <div className="status-line" role="status" aria-live="polite">
            {isSubmitting && <span className="spinner" aria-hidden="true" />}
            {statusMsg}
          </div>
        )}

        {Object.entries(modelFields).map(([fieldName, fieldConfig], idx) => {
          const required = fieldConfig.required !== false;
          const commonProps = {
            name: fieldName,
            value: formData[fieldName] ?? "",
            onChange: handleChange,
            disabled: isSubmitting,
            "aria-required": required,
            "aria-label": fieldConfig.label,
          } as const;

          if (fieldConfig["input-type"] === "text" || fieldConfig["input-type"] === "number") {
            return (
              <label key={fieldName} className="field">
                <span className="field-label">
                  {fieldConfig.label} {required && <span className="req">*</span>}
                </span>
                <input
                  {...commonProps}
                  type={fieldConfig["input-type"]}
                  placeholder={fieldConfig.placeholder ?? fieldConfig.label}
                  min={fieldConfig.min}
                  max={fieldConfig.max}
                  step={fieldConfig.step}
                  inputMode={fieldConfig["input-type"] === "number" ? "decimal" : "text"}
                  autoFocus={idx === 0 && fieldName === firstFieldName}
                />
              </label>
            );
          }

          if (fieldConfig["input-type"] === "slider") {
            return (
              <label key={fieldName} className="field">
                <span className="field-label">
                  {fieldConfig.label} {required && <span className="req">*</span>}
                </span>
                <input
                  {...commonProps}
                  id={fieldName}
                  type="range"
                  min={fieldConfig.min ?? 0}
                  max={fieldConfig.max ?? 400}
                  step={fieldConfig.step ?? 10}
                  className="vertical-slider"
                />
                <div className="hint">{formData[fieldName] ?? 0}</div>
              </label>
            );
          }

          if (fieldConfig["input-type"] === "selectOption") {
            return (
              <label key={fieldName} className="field">
                <span className="field-label">
                  {fieldConfig.label} {required && <span className="req">*</span>}
                </span>
                <select {...commonProps}>
                  <option value="">{`اختر ${fieldConfig.label}`}</option>
                  {fieldConfig.options?.map((opt, i) => (
                    <option key={i} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          if (fieldConfig["input-type"] === "numberPicker") {
            return (
              <div key={fieldName} className="field">
                <span className="field-label">
                  {fieldConfig.label} {required && <span className="req">*</span>}
                </span>
                <VerticalNumberPicker
                  value={Number(formData[fieldName] ?? 0)}
                  onChange={(val) => handleNumberPickerChange(fieldName, val)}
                  label={fieldConfig.label}
                  disabled={isSubmitting}
                />
              </div>
            );
          }

          // default: triple digit picker
          return (
            <div key={fieldName} className="field">
              <span className="field-label">
                {fieldConfig.label} {required && <span className="req">*</span>}
              </span>
              <TripleDigitPicker
                onChange={(val) => setField(fieldName, String(val))}
                disabled={isSubmitting}
              />
            </div>
          );
        })}

        <div className="actions">
          {onCancel && (
            <button
              type="button"
              className="btn secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              إلغاء
            </button>
          )}
          <button
            className={`btn primary ${isSubmitting ? "loading" : ""}`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span className="btn-text">جارٍ الحفظ…</span>
              </>
            ) : (
              <span className="btn-text">{buttonLabel}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddToModel;
