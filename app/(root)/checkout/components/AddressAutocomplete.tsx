'use client'

import { useEffect, useRef, useState } from 'react'
import { loadGooglePlaces } from '@/lib/googleMaps'
import { parseGooglePlaceComponents } from '@/lib/address'

export interface GooglePlaceSelection {
  street?: string
  houseNumber?: string
  postalCode?: string
  city?: string
}

interface AddressAutocompleteProps {
  id: string
  name?: string
  value: string
  onChange: (value: string) => void
  onSelect: (selection: GooglePlaceSelection) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className: string
  autoComplete?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

// Keystroke-vs-autofill heuristic: only real edits trigger a Places lookup. Chrome/Edge autofill
// fires "insertReplacementText" for the input event, which is deliberately excluded here — see
// the design spec (docs/superpowers/specs/2026-08-05-checkout-address-design.md §6). Not airtight
// across every browser, but fails safe: worst case is one harmless extra lookup, never a missed
// keystroke.
const KEYSTROKE_INPUT_TYPES = new Set(['insertText', 'deleteContentBackward', 'deleteContentForward', 'insertFromPaste'])

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 3

interface Suggestion {
  label: string
  placePrediction: google.maps.places.PlacePrediction
}

export default function AddressAutocomplete({
  id,
  name,
  value,
  onChange,
  onSelect,
  placeholder,
  required,
  disabled,
  className,
  autoComplete,
  ...aria
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function endSession() {
    sessionTokenRef.current = null
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
  }

  async function fetchSuggestions(query: string) {
    const ready = await loadGooglePlaces()
    if (!ready) return

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
    }

    const requestId = ++requestIdRef.current
    try {
      const { suggestions: results } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
        sessionToken: sessionTokenRef.current,
        includedRegionCodes: ['de'],
        language: 'de',
      })
      // Stale response from an earlier keystroke — drop it.
      if (requestId !== requestIdRef.current) return

      const next = results
        .filter((s) => s.placePrediction)
        .map((s) => ({ label: s.placePrediction!.text?.text ?? '', placePrediction: s.placePrediction! }))
      setSuggestions(next)
      setOpen(next.length > 0)
      setActiveIndex(-1)
    } catch {
      // Google Places unavailable mid-session — fall back to plain typing silently.
      setSuggestions([])
      setOpen(false)
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = e.target.value
    onChange(nextValue)

    const inputType = (e.nativeEvent as InputEvent).inputType
    const isKeystroke = inputType ? KEYSTROKE_INPUT_TYPES.has(inputType) : false

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!isKeystroke || nextValue.trim().length < MIN_QUERY_LENGTH) {
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(nextValue.trim())
    }, DEBOUNCE_MS)
  }

  async function handleSelect(suggestion: Suggestion) {
    try {
      const place = suggestion.placePrediction.toPlace()
      const { place: detailed } = await place.fetchFields({ fields: ['addressComponents'] })
      const parsed = parseGooglePlaceComponents(detailed.addressComponents)
      onSelect(parsed)
      if (parsed.street) onChange(parsed.street)
    } catch {
      // Detail lookup failed — keep whatever the user had typed, no disruption.
    } finally {
      endSession()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        autoComplete={autoComplete}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // onMouseDown on a suggestion already preventDefault()s to stop this from firing on
          // click-select; the short delay is just a safety net for touch/other edge cases.
          setTimeout(() => setOpen(false), 120)
        }}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={className}
        {...aria}
      />
      {open && suggestions.length > 0 && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 bg-white border border-enunas-gray-light shadow-sm max-h-64 overflow-y-auto"
        >
          {suggestions.map((s, i) => (
            <li key={s.label + i} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(s)}
                className={`w-full text-left px-4 py-2.5 font-league-spartan text-sm text-enunas-black transition-colors duration-150 ${
                  i === activeIndex ? 'bg-enunas-off-white' : 'hover:bg-enunas-off-white'
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
