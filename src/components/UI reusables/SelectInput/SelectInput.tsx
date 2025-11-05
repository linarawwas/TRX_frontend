import React, { ChangeEvent, forwardRef } from 'react';
import './SelectInput.css';

interface SelectOption {
  value: string | number | boolean;
  label: string;
}

interface SelectInputProps {
  label: string;
  name: string;
  value: string | number | boolean;
  options: SelectOption[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    {
      label,
      name,
      value,
      options,
      onChange,
      id,
      disabled = false,
      required = false,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
    },
    ref
  ) => {
    const selectId = id || `select-input-${name}`;

    return (
      <label className="order-label" htmlFor={selectId}>
        {label}
        <select
          ref={ref}
          id={selectId}
          className="orderType order-select-element"
          name={name}
          value={String(value)}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy}
        >
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;
