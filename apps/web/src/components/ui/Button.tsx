import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'emerald' | 'amber' | 'purple';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-600/30',
      outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs',
      ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
      destructive: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-600/30',
      emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-sm',
      amber: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:opacity-90 shadow-sm',
      purple: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-sm',
    };

    const sizeStyles = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 rounded-lg px-3 text-xs',
      lg: 'h-12 rounded-xl px-6 text-base',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
