import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={`ds-card ${className}`.trim()} {...rest} />
}
