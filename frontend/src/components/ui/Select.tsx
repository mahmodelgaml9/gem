
import React, { SelectHTMLAttributes } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  id: string;
  options: SelectOption[];
  error?: string;
  registration?: UseFormRegisterReturn;
  wrapperClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  errorClassName?: string;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  options,
  error,
  registration,
  wrapperClassName,
  labelClassName,
  selectClassName,
  errorClassName,
  placeholder,
  ...props
}) => {
  const baseSelectClasses =
    'block w-full appearance-none rounded-md border bg-white px-3 py-2 pr-8 shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors duration-150 ease-in-out';
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-light focus:border-primary-DEFAULT focus:ring-primary-DEFAULT';
  
  return (
    <div className={clsx('mb-4', wrapperClassName)}>
      {label && (
        <label
          htmlFor={id}
          className={clsx('block text-sm font-medium text-neutral-dark', labelClassName)}
        >
          {label}
        </label>
      )}
      <div className="relative mt-1">
        <select
          id={id}
          className={clsx(baseSelectClasses, errorClasses, selectClassName)}
          {...registration}
          {...props}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          defaultValue={props.defaultValue || (placeholder ? "" : undefined)}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-DEFAULT">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className={clsx('mt-1 text-xs text-red-600', errorClassName)} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
