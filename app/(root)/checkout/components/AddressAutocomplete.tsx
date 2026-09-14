'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { loadGooglePlaces } from '@/lib/googleMaps'
import { ALLOWED_SHIPPING_COUNTRIES, parseGooglePlaceComponents } from '@/lib/address'

export interface GooglePlaceSelection {
  street?: string
  houseNumber?: string
  postalCode?: string
  city?: string
  country?: string
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

// Deliverable addresses only — keeps shops, landmarks and other businesses out of the list.
// Until a house number is typed, whole streets are included so partial input still gets
// suggestions; once one is typed, only exact addresses are returned.
const STREET_OR_ADDRESS_TYPES = ['street_address', 'premise', 'subpremise', 'route']
const EXACT_ADDRESS_TYPES = ['street_address', 'premise', 'subpremise']

// Trailing house number in what the customer typed, e.g. "Leopoldstraße 50", "Hauptstr. 12a", "Weg 3-5".
const TRAILING_HOUSE_NUMBER = /\s(\d+\s?[a-zA-Z]?(?:\s?[-/]\s?\d+\s?[a-zA-Z]?)?)\s*$/

function typedHouseNumber(query: string): string | undefined {
  return query.match(TRAILING_HOUSE_NUMBER)?.[1].replace(/\s+/g, '')
}

// Read-back of what was filled in, so the customer can see which suggestion was taken and
// whether anything still needs adding.
function describeSelection({ street, houseNumber, postalCode, city }: GooglePlaceSelection) {
  const address = [[street, houseNumber].filter(Boolean).join(' '), [postalCode, city].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')
  const missing = [!houseNumber && 'Hausnummer', !postalCode && 'PLZ'].filter(Boolean)
  return missing.length
    ? { text: `${address} — bitte ${missing.join(' und ')} ergänzen`, complete: false }
    : { text: `Übernommen: ${address}`, complete: true }
}

interface Suggestion {
  label: string
  mainText?: google.maps.places.FormattableText
  secondaryText?: string
  placePrediction: google.maps.places.PlacePrediction
}

// Emphasises the parts of Google's text that match what the customer typed.
function HighlightedText({ text }: { text: google.maps.places.FormattableText }) {
  const parts: { value: string; match: boolean }[] = []
  let cursor = 0
  for (const { startOffset, endOffset } of text.matches) {
    if (startOffset > cursor) parts.push({ value: text.text.slice(cursor, startOffset), match: false })
    parts.push({ value: text.text.slice(startOffset, endOffset), match: true })
    cursor = endOffset
  }
  if (cursor < text.text.length) parts.push({ value: text.text.slice(cursor), match: false })

  return (
    <>
      {parts.map((part, i) => (
        <span key={i} className={part.match ? 'font-medium' : undefined}>
          {part.value}
        </span>
      ))}
    </>
  )
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
  const [confirmation, setConfirmation] = useState<{ text: string; complete: boolean } | null>(null)
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
        includedPrimaryTypes: typedHouseNumber(query) ? EXACT_ADDRESS_TYPES : STREET_OR_ADDRESS_TYPES,
        includedRegionCodes: ALLOWED_SHIPPING_COUNTRIES.map((c) => c.toLowerCase()),
        language: 'de',
      })
      // Stale response from an earlier keystroke — drop it.
      if (requestId !== requestIdRef.current) return

      const next = results
        .filter((s) => s.placePrediction)
        .map((s) => {
          const prediction = s.placePrediction!
          return {
            label: prediction.text.text,
            mainText: prediction.mainText,
            secondaryText: prediction.secondaryText?.text,
            placePrediction: prediction,
          }
        })
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
    setConfirmation(null)

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
      // Google omits the number when a whole street was picked — keep the one the customer typed.
      const selection = { ...parsed, houseNumber: parsed.houseNumber ?? typedHouseNumber(value) }
      onSelect(selection)
      if (selection.street) onChange(selection.street)
      setConfirmation(describeSelection(selection))
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
          // Leaving the field without a selection completes the session: drop any pending or
          // in-flight lookup and discard the token so the next search bills as a new session.
          if (debounceRef.current) clearTimeout(debounceRef.current)
          requestIdRef.current++
          setTimeout(endSession, 120)
        }}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={className}
        {...aria}
      />
      {open && suggestions.length > 0 && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-20 left-0 right-0 mt-1 bg-white border border-enunas-gray-light shadow-sm"
        >
          {!typedHouseNumber(value) && (
            <p className="px-4 pt-3 pb-1 font-league-spartan text-[11px] text-enunas-gray-medium">
              Hausnummer eingeben für genaue Adressen
            </p>
          )}
          <ul id={`${id}-listbox`} role="listbox" className="max-h-80 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={s.label + i} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(s)}
                  className={`w-full text-left px-4 py-3 font-league-spartan transition-colors duration-150 ${
                    i === activeIndex ? 'bg-enunas-off-white' : 'hover:bg-enunas-off-white'
                  }`}
                >
                  <span className="block text-sm text-enunas-black">
                    {s.mainText ? <HighlightedText text={s.mainText} /> : s.label}
                  </span>
                  {s.secondaryText && (
                    <span className="block mt-0.5 text-xs text-enunas-gray-medium">{s.secondaryText}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {/* Google Maps Platform attribution — required when showing Places results without a Google
              map. Official logo at 16px tall, with Google's minimum clear space (10px sides/top, 5px bottom). */}
          <div className="flex justify-end border-t border-enunas-gray-light px-2.5 pt-2.5 pb-1.5">
            <Image
              src="/assets/icons/google-maps-logo-gray.svg"
              alt="Google Maps"
              width={98}
              height={18}
              unoptimized
              className="h-4 w-auto"
            />
          </div>
        </div>
      )}
      {confirmation && (
        <p
          aria-live="polite"
          className={`font-league-spartan text-[11px] mt-1 ${confirmation.complete ? 'text-enunas-success' : 'text-enunas-warning'}`}
        >
          {confirmation.text}
        </p>
      )}
    </div>
  )
}
