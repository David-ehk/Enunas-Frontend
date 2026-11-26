'use client'

import type { ProductHighlight } from '@/lib/productHighlight'
import { INPUT, LABEL } from './constants'

const OPTIONS: { id: ProductHighlight; label: string }[] = [
  { id: 'none', label: 'Keine' },
  { id: 'collection', label: 'Kollektion' },
  { id: 'inspiration', label: 'Inspiration' },
]

const FONT = { fontFamily: 'var(--font-league-spartan)' }

/**
 * Collection or inspiration story, or neither. Both texts stay in form state, so switching back
 * and forth loses nothing; the form saves only the chosen one (see highlightFields).
 */
export default function HighlightField({
  highlight, onHighlightChange, collectionName, onCollectionNameChange, inspirationStory, onInspirationStoryChange,
}: {
  highlight: ProductHighlight
  onHighlightChange: (value: ProductHighlight) => void
  collectionName: string
  onCollectionNameChange: (value: string) => void
  inspirationStory: string
  onInspirationStoryChange: (value: string) => void
}) {
  return (
    <div>
      <p className={LABEL} style={FONT}>
        Highlight auf der Produktseite
        <span className="normal-case tracking-normal text-[#9B9B9B] ml-2">— nur eines von beiden</span>
      </p>
      <div role="group" aria-label="Highlight auf der Produktseite" className="flex gap-1.5">
        {OPTIONS.map(o => (
          <button
            key={o.id}
            type="button"
            aria-pressed={highlight === o.id}
            onClick={() => onHighlightChange(o.id)}
            className={`px-4 py-2 border text-[11px] font-medium transition-colors duration-200 ${
              highlight === o.id
                ? 'bg-[#370E4D] text-white border-[#370E4D]'
                : 'bg-white text-[#6B6B6B] border-[#E8E8E8] hover:border-[#370E4D]/50'
            }`}
            style={FONT}
          >
            {o.label}
          </button>
        ))}
      </div>

      {highlight === 'collection' && (
        <input
          aria-label="Kollektion"
          className={`${INPUT} mt-2`}
          value={collectionName}
          onChange={e => onCollectionNameChange(e.target.value)}
          placeholder="Sommer 2026"
          style={FONT}
        />
      )}
      {highlight === 'inspiration' && (
        <textarea
          aria-label="Inspirationsgeschichte"
          rows={3}
          className={`${INPUT} mt-2`}
          value={inspirationStory}
          onChange={e => onInspirationStoryChange(e.target.value)}
          placeholder="Was inspirierte dieses Produkt?"
          style={{ ...FONT, resize: 'vertical' }}
        />
      )}
    </div>
  )
}
