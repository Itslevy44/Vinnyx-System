import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    success: 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
    info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20',
    neutral: 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/10',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
