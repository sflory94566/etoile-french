
import React, { useState } from 'react';
export function Tabs({ value, onValueChange, children }: any){ return <div>{children}</div> }
export function TabsList({ className='', children }: any){ return <div className={['inline-grid bg-slate-100 rounded-xl p-1', className].join(' ')}>{children}</div> }
export function TabsTrigger({ value, className='', children, onClick }: any){ 
  return <button onClick={onClick} className={['px-4 py-2 rounded-lg text-sm hover:bg-white', className].join(' ')}>{children}</button>;
}
export function TabsContent({ value, className='', children }: any){ return <div className={className}>{children}</div> }
