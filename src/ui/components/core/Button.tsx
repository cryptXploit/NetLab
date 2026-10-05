import React from 'react';
import { HapticService } from '../../../core/native/HapticService';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'secondary', 
  isLoading, 
  className = '', 
  onClick,
  disabled,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-white rounded-md px-4 py-2 font-medium',
    secondary: 'bg-elevated border border-border-strong text-secondary hover:text-primary hover:bg-border-strong rounded-md px-4 py-2 font-medium',
    ghost: 'bg-transparent text-secondary hover:bg-elevated hover:text-primary rounded-md px-4 py-2 font-medium',
    destructive: 'bg-danger/20 text-danger hover:bg-danger/30 rounded-md px-4 py-2 font-medium',
    icon: 'p-2 text-secondary hover:text-primary hover:bg-elevated rounded-md',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    HapticService.tap();
    if (onClick) onClick(e);
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};
