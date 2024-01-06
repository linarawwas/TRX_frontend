// for profits, expenses, products, and shipments:

// for products: 
// {
//     "component-related-fields": {
//         "modelName": "products",
//             "title": "Add to Products",
//                 "button-label": "add product",
//     },
//     "model-related-fields": {
//         "type": { "label": "Type of Product", "input-type": "text",  },
//         "priceInDollars": { "label": "Price In Dollars", "input-type": "number",  },
//         "isReturnable": { "label": "Is it Returnable?", "input-type": "selectOption", "options": [true, false] },
//     }
// }
// for shipment:
// {
//     "component-related-fields": {
//         "modelName": "shipments",
//             "title": "Enter Shipment Info",
//                 "button-label": "start shipment",
//     },
//     "model-related-fields": {
//         "carryingForDelivery": { "label": "Amount Carried For Delivery", "input-type": "number" }
//     }
// }

import React, { useState, ChangeEvent, FormEvent } from 'react';

interface FieldConfig {
  label: string;
  'input-type': string;
  options?: string[];
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

const AddToModel: React.FC<Props> = ({ modelName, title, buttonLabel, modelFields, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await onSubmit(formData);

      if (response.ok) {
        console.log(`${modelName} successfully recorded.`);
        // Additional logic specific to the model can be added here if needed
      } else {
        const errorData = await response.json();
        console.error(`Error recording ${modelName}: ${errorData.error}`);
      }
    } catch (error: any) {
      console.error(`Network error: ${error}`);
    }
  };

  return (
    <div className="add-model-container">
      <h1 className="add-model-title">{title}</h1>
      <form className="add-model-form" onSubmit={handleSubmit}>
        {Object.entries(modelFields).map(([fieldName, fieldConfig]) => {
          if (fieldConfig['input-type'] === 'text' || fieldConfig['input-type'] === 'number') {
            return (
              <input
                key={fieldName}
                type={fieldConfig['input-type']}
                name={fieldName}
                value={formData[fieldName] || ''}
                placeholder={fieldConfig.label}
                onChange={handleChange}
              />
            );
          } else if (fieldConfig['input-type'] === 'selectOption') {
            return (
              <select
                key={fieldName}
                name={fieldName}
                value={formData[fieldName] || ''}
                onChange={handleChange}
              >
                <option value="">{`Select ${fieldConfig.label}`}</option>
                {fieldConfig.options?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            );
          }
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
