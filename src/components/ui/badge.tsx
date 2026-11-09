import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'secondary' | 'outline' | 'danger' | 'info';
}

export function Badge({
  className,
  variant = 'secondary',
  ...props
}: BadgeProps) {
  const variantStyles = {
    success: 'bg-[#076E46] text-white shadow-2xs',
    warning: 'bg-[#D97706] text-white shadow-2xs',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    outline: 'border border-slate-200 bg-white text-slate-700 shadow-2xs',
    danger: 'bg-red-600 text-white shadow-2xs',
    info: 'bg-blue-600 text-white shadow-2xs',
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide leading-none',
        variantStyles,
        className
      )}
      {...props}
    />
  );
}

export default Badge;
