import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, containerClassName, id, rows = 4, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    const textareaElement = (
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        className={cn(
          'flex w-full rounded-lg border bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 transition-colors leading-relaxed',
          'border-slate-200 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
    );

    if (!label && !error && !helperText) {
      return textareaElement;
    }

    return (
      <div className={cn('space-y-1.5 text-xs', containerClassName)}>
        {label && (
          <label htmlFor={textareaId} className="block font-semibold text-slate-700">
            {label}
          </label>
        )}
        {textareaElement}
        {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
