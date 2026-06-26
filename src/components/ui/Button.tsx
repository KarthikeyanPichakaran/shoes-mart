import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-red-600 text-white hover:bg-red-700': variant === 'primary',
          'bg-gray-900 text-white hover:bg-gray-700': variant === 'secondary',
          'border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 bg-white':
            variant === 'outline',
          'text-gray-700 hover:text-red-600 hover:bg-gray-50': variant === 'ghost',
        },
        {
          'text-sm px-4 py-2': size === 'sm',
          'text-sm px-6 py-3': size === 'md',
          'text-base px-8 py-4': size === 'lg',
        },
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
