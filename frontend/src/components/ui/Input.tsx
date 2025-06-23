
import React, { InputHTMLAttributes } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  error?: string;
  registration?: UseFormRegisterReturn; // For react-hook-form
  wrapperClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  icon?: React.ReactNode; // Optional icon to display inside the input
  iconPosition?: 'left' | 'right';
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  type = 'text',
  error,
  registration,
  wrapperClassName,
  labelClassName,
  inputClassName,
  errorClassName,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseInputClasses =
    'block w-full appearance-none rounded-md border border-neutral-light px-3 py-2 placeholder-neutral-DEFAULT shadow-sm focus:border-primary-DEFAULT focus:outline-none focus:ring-1 focus:ring-primary-DEFAULT sm:text-sm transition-colors duration-150 ease-in-out';
  const iconPadding = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';
  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-light';


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
        {icon && iconPosition === 'left' && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-neutral-DEFAULT sm:text-sm">{icon}</span>
          </div>
        )}
        <input
          id={id}
          type={type}
          className={clsx(baseInputClasses, errorClasses, iconPadding, inputClassName)}
          {...registration}
          {...props}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {icon && iconPosition === 'right' && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-neutral-DEFAULT sm:text-sm">{icon}</span>
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className={clsx('mt-1 text-xs text-red-600', errorClassName)} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
