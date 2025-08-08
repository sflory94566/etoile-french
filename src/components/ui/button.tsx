
import React from 'react';

export function Button({ children, className = '', variant='default', size='md', disabled=false, ...props } : any){
  const base = 'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition shadow-sm disabled:opacity-50';
  const variants: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
    outline: 'border border-slate-300 hover:bg-slate-50',
    ghost: 'hover:bg-slate-100',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
  };
  return <button className={[base, variants[variant]||variants.default, sizes[size]||sizes.md, className].join(' ')} disabled={disabled} {...props}>{children}</button>;
}
