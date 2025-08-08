
import React from 'react';
export function Input({ className='', ...props }: any){
  return <input className={['border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400', className].join(' ')} {...props} />;
}
