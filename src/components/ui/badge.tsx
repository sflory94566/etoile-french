
import React from 'react';
export function Badge({ children, variant='default', className='' } : any){
  const variants: any = {
    default: 'bg-slate-900 text-white',
    secondary: 'bg-slate-200 text-slate-900',
    outline: 'border border-slate-300 text-slate-700 bg-white',
  };
  return <span className={['px-2.5 py-1 rounded-full text-xs font-medium', variants[variant]||variants.default, className].join(' ')}>{children}</span>;
}
