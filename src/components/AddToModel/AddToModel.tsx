// AddToModel.tsx
import React, { useState, useCallback, ChangeEvent, FormEvent, useMemo, useRef } from "react";
import "./AddToModel.css";
import VerticalNumberPicker from "./VerticalNumberPicker";
import TripleDigitPicker from "./TripleDigitPicker";

interface FieldConfig {
  label: string;
  "input-type": "text" | "number" | "slider" | "selectOption" | "numberPicker" | "tripleDigit";
  options?: { value: string | number | boolean; label: string }[];
  required?: boolean;
  placeholder?: string;
  min?: number; max?: number; step?: number;
}
interface ModelFields { [key: string]: FieldConfig; }

interface Props {
  modelName: string;
  title: string;
  buttonLabel: string;
  modelFields: ModelFields;
  onSubmit: (data: Record<string, any>) => Promise<any>;
  initialValues?: Record<string, string | number | boolean>;
  validate?: (data: Record<string, any>) => string | null;
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
  /** Optional builder to customize confirm content (title/body) */
  confirmBuilder?: (data: Record<string, any>) => { title?: string; body?: React.ReactNode } | null;
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
  confirmBuilder,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({ ...initialValues });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const inFlight = useRef(false);

  const firstFieldName = useMemo(() => Object.keys(modelFields)[0] ?? "", [modelFields]);

  const setField = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const cfg = modelFields[name];
    if (!cfg) return;
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

  const validateLocal = useCallback((): string | null => {
    for (const [name, cfg] of Object.entries(modelFields)) {
      const required = cfg.required !== false;
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
    if (isSubmitting || inFlight.current) return;

    setStatusMsg(null);
    const localErr = validateLocal();
    if (localErr) { setStatusMsg(localErr); return; }

    const customErr = validate?.(formData) ?? null;
    if (customErr) { setStatusMsg(customErr); return; }

    // ✅ Pass validation → open confirm sheet instead of sending
    setShowConfirm(true);
  };

  const actuallySend = async () => {
    if (isSubmitting || inFlight.current) return;
    setIsSubmitting(true);
    inFlight.current = true;
    setStatusMsg("جارٍ الحفظ...");
    try {
      const payload = buildPayload();
      const result = await onSubmit(payload);
      setStatusMsg("تم الحفظ بنجاح ✅");
      onSuccess?.(result);
      setFormData({});
      setShowConfirm(false);
    } catch (error: any) {
      setStatusMsg(error?.message || "حدث خطأ غير متوقع. حاول مجددًا.");
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
        inFlight.current = false;
        setStatusMsg(null);
      }, 800);
    }
  };

  // Default confirm body: compact summary table
  const defaultConfirm = () => (
    <>
      <p className="confirm-note">راجع القيم قبل الإرسال:</p>
      <div className="confirm-list">
        {Object.entries(modelFields).map(([k, cfg]) => (
          <div key={k} className="confirm-row">
            <div className="confirm-key">{cfg.label}</div>
            <div className="confirm-val">{String(formData[k] ?? "—")}</div>
          </div>
        ))}
      </div>
    </>
  );

  const confirmContent = confirmBuilder?.(formData) || {};
  const confirmTitle = confirmContent.title ?? `تأكيد ${modelName}`;
  const confirmBody  = confirmContent.body  ?? defaultConfirm();

  return (
    <div className={`add-model-container ${isSubmitting ? "submitting" : ""}`} dir="rtl" aria-busy={isSubmitting}>
      {isSubmitting && <div className="submit-bar" aria-hidden="true" />}

      <h1 className="add-model-title">{title}</h1>

      <form className="add-model-form" onSubmit={handleSubmit}>
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
            <button type="button" className="btn secondary" onClick={onCancel} disabled={isSubmitting}>
              إلغاء
            </button>
          )}
          <button className={`btn primary ${isSubmitting ? "loading" : ""}`} type="submit" disabled={isSubmitting}>
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

      {/* Confirm Sheet */}
      {showConfirm && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-card" dir="rtl">
            <h3 className="confirm-title">{confirmTitle}</h3>
            <div className="confirm-body">{confirmBody}</div>
            <div className="confirm-actions">
              <button className="btn secondary" onClick={() => setShowConfirm(false)} disabled={isSubmitting}>
                تعديل
              </button>
              <button className="btn primary" onClick={actuallySend} disabled={isSubmitting}>
                تأكيد الإرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToModel;
