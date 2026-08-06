'use client'

import { useCallback, useEffect, useState } from 'react'
import { addressApi, FetchError } from '@/lib/api'
import type { ApiUserAddress } from '@/types/api'
import {
  AddressFormValues,
  AddressSelection,
  toUserAddressDto,
} from '@/lib/address'
import AddressCard from './AddressCard'
import CheckoutAddressForm from './CheckoutAddressForm'

interface SavedAddressSelectorProps {
  onChange: (selection: AddressSelection | null) => void
  // The address book endpoint requires auth — a guest has no saved addresses to fetch, so this
  // skips that call entirely and drops straight into the manual entry form below instead of
  // surfacing a misleading "Adressen konnten nicht geladen werden" error.
  isAuthenticated: boolean
}

// Address entry/editing happens inline in the page flow, not in a popup dialog — matches the
// familiar Shopify-style checkout pattern rather than a modal interrupting the page.
type View = 'list' | 'form'

export default function SavedAddressSelector({ onChange, isAuthenticated }: SavedAddressSelectorProps) {
  const [addresses, setAddresses] = useState<ApiUserAddress[]>([])
  const [loading, setLoading] = useState(isAuthenticated)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selection, setSelection] = useState<AddressSelection | null>(null)

  const [view, setView] = useState<View>(isAuthenticated ? 'list' : 'form')
  const [formMode, setFormMode] = useState<'new' | 'edit'>('new')
  const [editingAddress, setEditingAddress] = useState<ApiUserAddress | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [rowBusyId, setRowBusyId] = useState<number | null>(null)
  const [rowError, setRowError] = useState<string | null>(null)

  // Fetched once on mount — no cart-derived dependency, so an unrelated cart re-render (e.g. a
  // quantity change) never re-triggers this and never disturbs the selection below.
  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const list = await addressApi.getAll()
      setAddresses(list)
      if (list.length > 0) {
        const preferred = list.find((a) => a.isDefault) ?? list[0]
        setSelection({ mode: 'saved', id: preferred.id })
      } else {
        // No saved addresses — automatically show the address form inline (only on a genuine
        // empty list, not on a load failure — an error still offers manual entry, just via the
        // "+ Neue Adresse hinzufügen" entry point below rather than jumping straight to a form).
        setFormMode('new')
        setEditingAddress(null)
        setView('form')
      }
    } catch (err) {
      setLoadError(err instanceof FetchError ? err.message : 'Adressen konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) load()
    // Guests skip the fetch entirely — `loading`/`view` above already default to the manual
    // entry form for them, so there's nothing to do here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Reports the resolved selection up to the checkout page. Does not run on every render — only
  // when `selection` itself changes, which never happens from an unrelated parent re-render since
  // this component is never unmounted/remounted by the parent.
  useEffect(() => { onChange(selection) }, [selection, onChange])

  function openAddForm() {
    setFormMode('new')
    setEditingAddress(null)
    setFormError(null)
    setView('form')
  }

  function openEditForm(addr: ApiUserAddress) {
    setFormMode('edit')
    setEditingAddress(addr)
    setFormError(null)
    setView('form')
  }

  async function submitAddressForm(
    mode: 'new' | 'edit',
    values: AddressFormValues,
    saveToBook: boolean,
    editTarget?: ApiUserAddress
  ) {
    setFormError(null)

    if (mode === 'edit' && editTarget) {
      setFormSubmitting(true)
      try {
        const updated = await addressApi.update(editTarget.id, toUserAddressDto(values))
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
        setView('list')
      } catch (err) {
        setFormError(err instanceof FetchError ? err.message : 'Adresse konnte nicht gespeichert werden.')
      } finally {
        setFormSubmitting(false)
      }
      return
    }

    // New / ad-hoc address — resolves immediately so the order never waits on the optional
    // "save to book" side-effect, and phone (which the address book can't store) is preserved.
    setSelection({ mode: 'new', address: values, savedToBook: false })
    setView('list')

    if (saveToBook) {
      try {
        const created = await addressApi.create(toUserAddressDto(values))
        setAddresses((prev) => [...prev, created])
        setSelection((prev) =>
          prev?.mode === 'new' && prev.address === values ? { ...prev, savedToBook: true } : prev
        )
      } catch {
        // Best-effort — the order already carries everything it needs via the ad-hoc address.
      }
    }
  }

  async function handleDelete(addr: ApiUserAddress) {
    setRowBusyId(addr.id)
    setRowError(null)
    try {
      await addressApi.remove(addr.id)
      setAddresses((prev) => {
        const next = prev.filter((a) => a.id !== addr.id)
        setSelection((prevSel) => {
          if (prevSel?.mode !== 'saved' || prevSel.id !== addr.id) return prevSel
          if (next.length === 0) return null
          const fallback = next.find((a) => a.isDefault) ?? next[0]
          return { mode: 'saved', id: fallback.id }
        })
        return next
      })
    } catch (err) {
      setRowError(err instanceof FetchError ? err.message : 'Adresse konnte nicht gelöscht werden.')
    } finally {
      setRowBusyId(null)
    }
  }

  async function handleSetDefault(addr: ApiUserAddress) {
    setRowBusyId(addr.id)
    setRowError(null)
    try {
      const updated = await addressApi.setDefault(addr.id)
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === updated.id })))
    } catch (err) {
      setRowError(err instanceof FetchError ? err.message : 'Standardadresse konnte nicht gesetzt werden.')
    } finally {
      setRowBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-6">
        <div className="w-5 h-5 border-2 border-enunas-gray-light border-t-enunas-purple rounded-full animate-spin" />
        <span className="font-league-spartan text-xs text-enunas-gray-medium">Adressen werden geladen…</span>
      </div>
    )
  }

  const usingNewAddress = selection?.mode === 'new'

  if (view === 'form') {
    return (
      <div>
        {formMode === 'edit' && (
          <h3 className="font-cormorant text-xl text-enunas-black font-light mb-4">Adresse bearbeiten</h3>
        )}
        <CheckoutAddressForm
          // "Bearbeiten" on the resolved ad-hoc summary must reopen with what was already
          // entered (selection.address), not a blank form — the key forces a remount whenever
          // that distinction (or which saved address) actually changes, not on every render.
          key={formMode === 'edit' ? `edit-${editingAddress?.id ?? 'unknown'}` : `new-${selection?.mode === 'new' ? 'prefilled' : 'blank'}`}
          mode={formMode}
          initialValues={
            formMode === 'edit'
              ? editingAddress ?? undefined
              : selection?.mode === 'new' ? selection.address : undefined
          }
          submitLabel={formMode === 'edit' ? 'Speichern' : 'Adresse verwenden'}
          onSubmit={(values, saveToBook) => submitAddressForm(formMode, values, saveToBook, editingAddress ?? undefined)}
          onCancel={addresses.length > 0 || usingNewAddress ? () => setView('list') : undefined}
          submitting={formSubmitting}
          serverError={formError}
        />
      </div>
    )
  }

  return (
    <div>
      {loadError && (
        <div className="mb-4 border border-enunas-error bg-enunas-error/5 px-4 py-3 flex items-center justify-between gap-4">
          <p className="font-league-spartan text-xs text-enunas-error">{loadError}</p>
          <button
            type="button"
            onClick={load}
            className="font-league-spartan text-[11px] uppercase tracking-[0.15em] text-enunas-error underline hover:no-underline flex-shrink-0"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {usingNewAddress && selection.mode === 'new' && (
        <div className="border border-enunas-purple bg-enunas-purple-muted p-5 mb-4">
          <p className="font-league-spartan text-sm text-enunas-black leading-relaxed">
            {selection.address.firstName} {selection.address.lastName}<br />
            {selection.address.street} {selection.address.houseNumber}<br />
            {selection.address.addressLine2 && <>{selection.address.addressLine2}<br /></>}
            {selection.address.postalCode} {selection.address.city}<br />
            Deutschland
          </p>
          {selection.savedToBook && (
            <p className="font-league-spartan text-[11px] text-enunas-success mt-2">
              ✓ Für zukünftige Bestellungen gespeichert
            </p>
          )}
          <div className="flex gap-5 mt-4">
            <button
              type="button"
              onClick={openAddForm}
              className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-gray-medium hover:text-enunas-purple transition-colors duration-200"
            >
              Bearbeiten
            </button>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setSelection(null)}
                className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-gray-medium hover:text-enunas-purple transition-colors duration-200"
              >
                Andere Adresse verwenden
              </button>
            )}
          </div>
        </div>
      )}

      {!usingNewAddress && addresses.length > 0 && (
        <div role="radiogroup" aria-label="Lieferadresse auswählen" className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={selection?.mode === 'saved' && selection.id === addr.id}
              onSelect={() => setSelection({ mode: 'saved', id: addr.id })}
              onEdit={() => openEditForm(addr)}
              onDelete={() => handleDelete(addr)}
              onSetDefault={() => handleSetDefault(addr)}
              busy={rowBusyId === addr.id}
            />
          ))}
        </div>
      )}

      {rowError && <p className="font-league-spartan text-xs text-enunas-error mb-4">{rowError}</p>}

      {!usingNewAddress && (
        <button
          type="button"
          onClick={openAddForm}
          className="font-league-spartan text-xs tracking-[0.15em] uppercase text-enunas-purple hover:text-enunas-purple-light transition-colors duration-200"
        >
          + Neue Adresse hinzufügen
        </button>
      )}
    </div>
  )
}
