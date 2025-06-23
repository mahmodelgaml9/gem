
import React from 'react';
import { Loader2 } from 'lucide-react'; // Using lucide-react for icons
import { clsx } from 'clsx';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral'; // Color variant
  fullScreen?: boolean; // If true, centers loader on the screen
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  message,
  className,
  variant = 'primary',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'text-primary-DEFAULT',
    secondary: 'text-secondary-DEFAULT',
    accent: 'text-accent-DEFAULT',
    neutral: 'text-neutral-dark',
  };

  const loaderElement = (
    <div
      className={clsx(
        'flex flex-col items-center justify-center space-y-2',
        fullScreen ? 'fixed inset-0 z-50 bg-neutral-lightest/80 backdrop-blur-sm' : '',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={clsx(
          'animate-spin',
          sizeClasses[size],
          colorClasses[variant]
        )}
        aria-hidden="true"
      />
      {message && <p className={clsx('text-sm', colorClasses[variant])}>{message}</p>}
      {fullScreen && <span className="sr-only">Loading...</span>}
    </div>
  );

  return loaderElement;
};

export default Loader;
