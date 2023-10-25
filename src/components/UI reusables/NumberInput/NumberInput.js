import React from 'react';
import './NumberInput.css'
function NumberInput({ label, name, value, onChange }) {
  return (
    <label className="order-label">
      {label}
      <input
        className="order-input order-input-nested order-input-number"
        type="number"
        name={name}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

export default NumberInput;
