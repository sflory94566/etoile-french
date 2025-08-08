
import React from 'react';
export function Card({ className='', children, ...props }: any){
  return <div className={['bg-white rounded-2xl border border-slate-200', className].join(' ')} {...props}>{children}</div>;
}
export function CardHeader({ className='', children }: any){ return <div className={['p-4 border-b border-slate-100', className].join(' ')}>{children}</div> }
export function CardTitle({ className='', children }: any){ return <div className={['text-lg font-semibold', className].join(' ')}>{children}</div> }
export function CardContent({ className='', children }: any){ return <div className={['p-4', className].join(' ')}>{children}</div> }
export function CardFooter({ className='', children }: any){ return <div className={['p-4 border-t border-slate-100 flex items-center gap-2', className].join(' ')}>{children}</div> }
