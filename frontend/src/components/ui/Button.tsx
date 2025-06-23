
import React, { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react'; // Example loader icon

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean; // For Radix Slot compatibility (not implemented here)
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  type = 'button',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary-DEFAULT text-white hover:bg-primary-dark focus-visible:ring-primary-dark',
    secondary: 'bg-secondary-DEFAULT text-white hover:bg-secondary-dark focus-visible:ring-secondary-dark',
    outline: 'border border-primary-DEFAULT text-primary-DEFAULT hover:bg-primary-light/20 focus-visible:ring-primary-DEFAULT',
    ghost: 'text-primary-DEFAULT hover:bg-primary-light/20 focus-visible:ring-primary-DEFAULT',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'h-10 w-10 text-sm', // Specific for icon buttons
  };

  return (
    <button
      type={type}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        leftIcon && <span className="mr-2 -ml-1 h-5 w-5">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="ml-2 -mr-1 h-5 w-5">{rightIcon}</span>}
    </button>
  );
};

export default Button;
