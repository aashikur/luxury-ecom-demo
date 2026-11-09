import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, containerClassName, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    const selectElement = (
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-white px-3.5 pr-9 py-2 text-xs text-slate-900 shadow-2xs cursor-pointer appearance-none transition-colors',
            'border-slate-200 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
      </div>
    );

    if (!label && !error && !helperText) {
      return selectElement;
    }

    return (
      <div className={cn('space-y-1.5 text-xs', containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="block font-semibold text-slate-700">
            {label}
          </label>
        )}
        {selectElement}
        {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
