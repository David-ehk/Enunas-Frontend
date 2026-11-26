import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import Storefront from './Storefront'
import { storefrontApi } from '@/lib/api'
import type { CurationData } from '@/types/api'

const saved: CurationData = {
  trendy: [],
  drops: [],
  recommendations: { streetwear: [], cultural: [], athleisure: [], experimental: [], star: [] },
}

function deferred<T>() {
  let resolve!: (v: T) => void
  const promise = new Promise<T>(r => { resolve = r })
  return { promise, resolve }
}

const saveButton = () => screen.queryByRole('button', { name: /Änderungen speichern|Wird gespeichert/ })

beforeEach(() => { localStorage.clear() })
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('Storefront curation editor', () => {
  it('offers nothing to edit until the saved lists have loaded', async () => {
    const load = deferred<CurationData>()
    vi.spyOn(storefrontApi.admin, 'getCuration').mockReturnValue(load.promise)
    render(<Storefront products={[]} />)

    // Anything edited now would be overwritten when the load finishes.
    expect(screen.queryByText('Kuratierte Auswahl')).toBeNull()
    expect(saveButton()).toBeNull()

    await act(async () => { load.resolve(saved) })
    expect(screen.getByText('Kuratierte Auswahl')).toBeTruthy()
    expect(saveButton()).not.toBeNull()
  })

  it('shows the error and no editor when loading fails', async () => {
    vi.spyOn(storefrontApi.admin, 'getCuration').mockRejectedValue(new Error('down'))
    await act(async () => { render(<Storefront products={[]} />) })

    expect(screen.getByRole('alert').textContent).toContain('konnte nicht geladen werden')
    expect(saveButton()).toBeNull()
  })

  it('blocks edits while a save is in flight, so the server response cannot discard them', async () => {
    vi.spyOn(storefrontApi.admin, 'getCuration').mockResolvedValue(saved)
    const save = deferred<CurationData>()
    vi.spyOn(storefrontApi.admin, 'saveCuration').mockReturnValue(save.promise)
    await act(async () => { render(<Storefront products={[]} />) })

    fireEvent.click(saveButton()!)
    expect(screen.getByText('Kuratierte Auswahl').closest('[inert]')).not.toBeNull()

    await act(async () => { save.resolve(saved) })
    expect(screen.getByText('Kuratierte Auswahl').closest('[inert]')).toBeNull()
  })

  it('keeps the editor and shows the message when a save is rejected', async () => {
    vi.spyOn(storefrontApi.admin, 'getCuration').mockResolvedValue(saved)
    vi.spyOn(storefrontApi.admin, 'saveCuration').mockRejectedValue(new Error('Unbekannte Produkt-ID'))
    await act(async () => { render(<Storefront products={[]} />) })

    await act(async () => { fireEvent.click(saveButton()!) })
    expect(screen.getByRole('alert').textContent).toContain('Unbekannte Produkt-ID')
    expect(screen.getByText('Kuratierte Auswahl')).toBeTruthy()
  })
})
