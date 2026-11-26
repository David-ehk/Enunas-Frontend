import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import CheckoutAuthModal from './CheckoutAuthModal'

const auth = { isAuthenticated: false, refreshUser: vi.fn() }
vi.mock('@/app/context/AuthContext', () => ({ useAuth: () => auth }))
// Google's script cannot run here. The popup must not depend on which method signed the visitor in.
vi.mock('@/components/auth/GoogleLoginButton', () => ({ default: () => null }))

beforeEach(() => { auth.isAuthenticated = false; vi.useFakeTimers() })
afterEach(() => { cleanup(); vi.useRealTimers() })

const confirmation = () => screen.queryByText('Du bist angemeldet.')
const wait = (ms: number) => act(() => { vi.advanceTimersByTime(ms) })

describe('CheckoutAuthModal', () => {
  it('stays open with the sign-in form while the visitor is a guest', () => {
    const onClose = vi.fn()
    render(<CheckoutAuthModal open onClose={onClose} />)
    wait(10_000)

    expect(screen.getByPlaceholderText('E-Mail')).toBeTruthy()
    expect(confirmation()).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('confirms the sign-in, then closes by itself, however the visitor signed in', () => {
    const onClose = vi.fn()
    const view = render(<CheckoutAuthModal open onClose={onClose} />)

    // Only the auth state changes: no form callback is involved.
    auth.isAuthenticated = true
    view.rerender(<CheckoutAuthModal open onClose={onClose} />)

    expect(confirmation()).not.toBeNull()
    expect(screen.queryByPlaceholderText('E-Mail')).toBeNull()
    wait(500)
    expect(onClose).not.toHaveBeenCalled() // long enough to be read
    wait(2000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('is not held open by the checkout page re-rendering', () => {
    const onClose = vi.fn()
    auth.isAuthenticated = true
    // A new function on every render, as the checkout page passes it.
    const view = render(<CheckoutAuthModal open onClose={() => onClose()} />)
    for (let i = 0; i < 5; i++) {
      wait(500)
      view.rerender(<CheckoutAuthModal open onClose={() => onClose()} />)
    }

    expect(onClose).toHaveBeenCalled()
  })

  it('does not call close while it is not open', () => {
    const onClose = vi.fn()
    auth.isAuthenticated = true
    render(<CheckoutAuthModal open={false} onClose={onClose} />)
    wait(10_000)

    expect(onClose).not.toHaveBeenCalled()
  })
})
