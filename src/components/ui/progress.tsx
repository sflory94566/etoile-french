
import React from 'react';
export function Progress({ value=0 }: any){
  return <div className='w-full h-3 bg-slate-200 rounded-full overflow-hidden'>
    <div className='h-full bg-emerald-500' style={{width: `${Math.min(100, Math.max(0, value))}%`}}/>
  </div>;
}
