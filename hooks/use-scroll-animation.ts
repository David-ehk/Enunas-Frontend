import { useEffect, useState, useRef, RefObject } from 'react'

interface ScrollAnimationOptions {
  threshold?: number
  triggerOnce?: boolean
}

export function useScrollAnimation(options?: ScrollAnimationOptions): {
  ref: RefObject<HTMLElement | null>
  isVisible: boolean
} {
  const ref = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (options?.triggerOnce !== false) {
            observer.disconnect()
          }
        }
      },
      { threshold: options?.threshold ?? 0.15 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [options?.threshold, options?.triggerOnce])

  return { ref, isVisible }
}
