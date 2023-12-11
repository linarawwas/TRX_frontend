import React, { ChangeEvent } from 'react';
import './SelectInput.css';

interface SelectInputProps {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, name, value, options, onChange }) => {
  return (
    <label className="order-label">
      {label}
      <select className="orderType order-select-element" name={name} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SelectInput;
