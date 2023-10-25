import React from 'react';
import './SelectInput.css'
function SelectInput({ label, name, value, options, onChange }) {
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
}

export default SelectInput;
