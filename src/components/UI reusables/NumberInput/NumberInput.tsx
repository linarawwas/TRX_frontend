import React, { ChangeEvent } from 'react';
import './NumberInput.css';

interface NumberInputProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, name, value, onChange }) => {
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
};

export default NumberInput;
