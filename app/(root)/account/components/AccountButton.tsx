import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface AccountButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger'
}

export default function AccountButton({
  variant = 'primary',
  className,
  children,
  ...props
}: AccountButtonProps) {
  if (variant === 'danger') {
    return (
      <button
        className={cn(
          'group relative overflow-hidden border border-enunas-error text-enunas-error',
          'font-cormorant text-[18px] tracking-[0.06em]',
          'px-8 py-4 transition-colors duration-300 ease-out-expo cursor-pointer',
          'hover:bg-enunas-error hover:text-white',
          className
        )}
        {...props}
      >
        <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-current opacity-40 transition-all duration-500 ease-out group-hover:w-[70%] group-hover:opacity-60" />
        <span className="relative z-10">{children}</span>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-current opacity-40 transition-all duration-500 ease-out group-hover:w-[70%] group-hover:opacity-60" />
      </button>
    )
  }

  return (
    <button
      className={cn(
        'group relative overflow-hidden bg-enunas-purple text-white',
        'font-cormorant text-[18px] tracking-[0.06em]',
        'px-8 py-4 transition-colors duration-300 ease-out-expo cursor-pointer',
        'hover:bg-enunas-purple-dark disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
      <span className="relative z-10">{children}</span>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
    </button>
  )
}
