import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'destructive';
  title?: string;
}

export function Alert({ className, variant = 'info', title, children, ...props }: AlertProps) {
  const icons = {
    info: <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />,
    destructive: <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 shrink-0" />,
  };

  const variants = {
    info: 'border-blue-900/50 bg-blue-950/30 text-blue-200',
    success: 'border-emerald-900/50 bg-emerald-950/30 text-emerald-200',
    warning: 'border-amber-900/50 bg-amber-950/30 text-amber-200',
    destructive: 'border-rose-900/50 bg-rose-950/30 text-rose-200',
  };

  return (
    <div
      role="alert"
      className={cn('relative flex gap-3 rounded-lg border p-4 text-sm', variants[variant], className)}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
