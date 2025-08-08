
import React from 'react';
export function Switch({ checked=false, onCheckedChange } : any){
  return <button onClick={()=>onCheckedChange(!checked)} className={'w-12 h-6 rounded-full transition ' + (checked ? 'bg-emerald-500' : 'bg-slate-300')}>
    <div className={'w-5 h-5 bg-white rounded-full transition ' + (checked ? 'translate-x-6' : 'translate-x-1')} />
  </button>;
}
