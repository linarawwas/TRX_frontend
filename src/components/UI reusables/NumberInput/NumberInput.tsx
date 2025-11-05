import React, { ChangeEvent, forwardRef } from 'react';
import './NumberInput.css';

interface NumberInputProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label,
      name,
      value,
      onChange,
      id,
      disabled = false,
      min,
      max,
      step,
      required = false,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
    },
    ref
  ) => {
    const inputId = id || `number-input-${name}`;

    return (
      <label className="order-label" htmlFor={inputId}>
        {label}
        <input
          ref={ref}
          id={inputId}
          className="order-input order-input-nested order-input-number"
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          required={required}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy}
        />
      </label>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;
