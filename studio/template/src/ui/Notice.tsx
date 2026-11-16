import type { ReactNode } from 'react'

type NoticeProps = {
  variant?: 'info' | 'success' | 'error'
  children: ReactNode
}

// Errors interrupt assistive technology; other messages are announced politely.
export function Notice({ variant = 'info', children }: NoticeProps) {
  return (
    <div className={`ds-notice ds-notice--${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}
