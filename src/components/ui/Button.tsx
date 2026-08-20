import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-bold uppercase tracking-[0.15em] transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-[10px] gap-1.5',
    md: 'px-5 py-2.5 text-xs gap-2',
    lg: 'px-7 py-3.5 text-xs tracking-[0.2em] gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#1A1A1A] hover:bg-[#333333] text-[#F9F7F2] border border-[#1A1A1A]',
    secondary: 'bg-[#F2EFE9] hover:bg-[#E5E0D6] text-[#1A1A1A] border border-[#1A1A1A]',
    outline: 'bg-transparent hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-[#F9F7F2] border border-[#1A1A1A]',
    danger: 'bg-[#8E2828] hover:bg-[#6D1E1E] text-[#F9F7F2] border border-[#8E2828]',
    ghost: 'bg-transparent hover:bg-[#F2EFE9] text-[#1A1A1A] border border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      <span>{children}</span>
    </button>
  );
};

