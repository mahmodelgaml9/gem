
import React, { TextareaHTMLAttributes } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { clsx } from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  id: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  wrapperClassName?: string;
  labelClassName?: string;
  textareaClassName?: string;
  errorClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  id,
  error,
  registration,
  wrapperClassName,
  labelClassName,
  textareaClassName,
  errorClassName,
  rows = 3,
  ...props
}) => {
  const baseTextareaClasses =
    'block w-full appearance-none rounded-md border border-neutral-light px-3 py-2 placeholder-neutral-DEFAULT shadow-sm focus:border-primary-DEFAULT focus:outline-none focus:ring-1 focus:ring-primary-DEFAULT sm:text-sm transition-colors duration-150 ease-in-out';
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
      <div className="mt-1">
        <textarea
          id={id}
          rows={rows}
          className={clsx(baseTextareaClasses, errorClasses, textareaClassName)}
          {...registration}
          {...props}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className={clsx('mt-1 text-xs text-red-600', errorClassName)} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;
