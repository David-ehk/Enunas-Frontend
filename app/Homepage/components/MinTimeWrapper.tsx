'use client'
import { ReactNode } from 'react'

// The route curtain (components/PageTransition) now covers page changes, so the old timed
// "Enunas" splash is gone and content renders immediately.
export default function MinTimeWrapper({
  navbar,
  children,
  footer
}: {
  navbar?: ReactNode
  children: React.ReactNode
  footer?: ReactNode
}) {
  return (
    <>
      {navbar}
      {children}
      {footer}
    </>
  )
}
