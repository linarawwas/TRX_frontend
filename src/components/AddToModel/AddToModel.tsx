// for profits, expenses, products, and shipments:

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useCallback } from "react";

import "./AddToModel.css";
import VerticalNumberPicker from "./VerticalNumberPicker";
import TripleDigitPicker from "./TripleDigitPicker";
interface FieldConfig {
  label: string;
  "input-type": string | boolean | number;
  options?: { value: string | number | boolean; label: string }[];
}

interface ModelFields {
  [key: string]: FieldConfig;
}

interface Props {
  modelName: string;
  title: string;
  buttonLabel: string;
  modelFields: ModelFields;
  onSubmit: (data: any) => Promise<any>; // Adjust the type of data as per your API response
}

const AddToModel: React.FC<Props> = ({
  modelName,
  title,
  buttonLabel,
  modelFields,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  // 1. Memoize change handler per field
  const handleNumberPickerChange = useCallback(
    (fieldName: string, val: number) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: val.toString(),
      }));
    },
    [] // you can add dependencies if needed, usually none here
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData); // Don't expect a return
      console.log(`${modelName} submission complete.`);
    } catch (error: any) {
      console.error(`${modelName} got an error:`, error);
    }
  };

  return (
    <div className="add-model-container">
      <h1 className="add-model-title">{title}</h1>
      <form className="add-model-form" onSubmit={handleSubmit}>
        {Object.entries(modelFields).map(([fieldName, fieldConfig]) => {
          if (
            fieldConfig["input-type"] === "text" ||
            fieldConfig["input-type"] === "number"
          ) {
            return (
              <input
                key={fieldName}
                type={fieldConfig["input-type"]}
                name={fieldName}
                value={formData[fieldName] || ""}
                placeholder={fieldConfig.label}
                onChange={handleChange}
              />
            );
          } else if (fieldConfig["input-type"] === "slider") {
            return (
              <div key={fieldName} className="slider-container">
                <label htmlFor={fieldName}>{fieldConfig.label}</label>
                <input
                  type="range"
                  name={fieldName}
                  id={fieldName}
                  min="0"
                  max="400"
                  step="10"
                  value={formData[fieldName] || "0"}
                  onChange={handleChange}
                  className="vertical-slider"
                />
                <div>{formData[fieldName] || 0}</div>
              </div>
            );
          } else if (fieldConfig["input-type"] === "selectOption") {
            return (
              <select
                key={fieldName}
                name={fieldName}
                value={formData[fieldName] || ""}
                onChange={handleChange}
              >
                <option value="">{`Select ${fieldConfig.label}`}</option>
                {fieldConfig.options?.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            );
          } else if (fieldConfig["input-type"] === "numberPicker") {
            return (
              <VerticalNumberPicker
                key={fieldName}
                value={parseInt(formData[fieldName] || "0")}
                onChange={(val) => handleNumberPickerChange(fieldName, val)}
                label={fieldConfig.label}
              />
            );
          } else
            return (
              <div key={fieldName}>
                <label>{fieldConfig.label}</label>
                <TripleDigitPicker
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      [fieldName]: String(val),
                    }))
                  }
                />
              </div>
            );
          return null;
        })}

        <button className="add-model-button" type="submit">
          {buttonLabel}
        </button>
      </form>
    </div>
  );
};

export default AddToModel;
