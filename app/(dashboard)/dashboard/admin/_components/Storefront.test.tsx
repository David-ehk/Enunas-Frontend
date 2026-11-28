import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import Storefront from './Storefront'
import { storefrontApi } from '@/lib/api'
import type { AdminApiProduct, CurationData } from '@/types/api'

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

describe('Warenkorb tab', () => {
  const products = [1, 2, 3, 4].map(id => (
    { id, name: `Produkt ${id}`, brandName: 'Marke', images: [], status: 'ACTIVE' } as unknown as AdminApiProduct
  ))

  async function open(loaded: CurationData) {
    vi.spyOn(storefrontApi.admin, 'getCuration').mockResolvedValue(loaded)
    const save = vi.spyOn(storefrontApi.admin, 'saveCuration').mockImplementation(async c => c)
    await act(async () => { render(<Storefront products={products} />) })
    return save
  }

  const openCartTab = () => fireEvent.click(screen.getByRole('button', { name: 'Warenkorb' }))

  it('saves picks to cartUpsell and leaves the other lists alone', async () => {
    const save = await open({ ...saved, trendy: ['3'], cartUpsell: [] })

    openCartTab()
    expect(screen.getByText('Erscheint im Warenkorb unter „Empfohlen für dich“')).toBeTruthy()
    fireEvent.click(screen.getByText('Produkt 1'))
    fireEvent.click(screen.getByText('Produkt 2'))
    await act(async () => { fireEvent.click(saveButton()!) })

    expect(save).toHaveBeenCalledWith({ ...saved, trendy: ['3'], cartUpsell: ['1', '2'] })
  })

  it('keeps the saved cart picks when saving from another tab', async () => {
    const save = await open({ ...saved, cartUpsell: ['2'] })

    fireEvent.click(screen.getByText('Produkt 1'))
    await act(async () => { fireEvent.click(saveButton()!) })

    expect(save).toHaveBeenCalledWith({ ...saved, trendy: ['1'], cartUpsell: ['2'] })
  })

  it('opens empty when the response has no cartUpsell', async () => {
    await open(saved)

    openCartTab()
    expect(screen.getByText('Produkte hierher ziehen oder links anklicken')).toBeTruthy()
  })

  it('marks the first 3 as shown in the cart', async () => {
    await open({ ...saved, cartUpsell: ['1', '2', '3', '4'] })

    openCartTab()
    expect(screen.getByText('Direkt sichtbar (1–3)')).toBeTruthy()
    expect(screen.getByText('+1 als Ersatz')).toBeTruthy()
    expect(screen.getByText('Ersatz, falls oben etwas fehlt')).toBeTruthy()
  })
})
