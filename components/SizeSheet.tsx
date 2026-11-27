'use client'

import { useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import SizeWheel from '@/components/SizeWheel'
import { startIndex } from '@/lib/sizeWheel'

export interface SheetSize {
  size: string
  unavailable: boolean
}

interface SizeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  /** Top left: the colour being bought, or "Größe". */
  label: string
  sizes: SheetSize[]
  pending?: boolean
  onPick?: () => void
  onConfirm: (size: string) => void
  /** Shown above the button, e.g. why adding failed. */
  message?: ReactNode
  /** Whatever opens the sheet; it must contain a Dialog.Trigger. */
  children?: ReactNode
}

/**
 * The one size popup: a sheet that slides up from the bottom (a centred card from tablet width).
 * The size in the middle of the wheel is added with the button below. Styles: "SIZE SHEET" in
 * globals.css.
 */
export default function SizeSheet({ open, onOpenChange, children, ...body }: SizeSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
      <Dialog.Portal>
        <Dialog.Overlay className="size-sheet-scrim fixed inset-0 z-[9998]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="size-sheet fixed inset-x-0 bottom-0 z-[9999] flex max-h-[80dvh] flex-col px-6 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] font-league-spartan md:inset-0 md:m-auto md:h-fit md:max-w-md md:px-8 md:pb-8"
        >
          <SheetBody {...body} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Mounted with the sheet, so every opening starts on the middle size, and the choice stays on
// screen while the sheet slides away.
function SheetBody({ productName, label, sizes, pending = false, onPick, onConfirm, message }: Omit<SizeSheetProps, 'open' | 'onOpenChange' | 'children'>) {
  const [index, setIndex] = useState(() => startIndex(sizes))
  const current = sizes[index]
  const buyable = !!current && !current.unavailable

  return (
    <>
      <Dialog.Title className="sr-only">{`Größe für ${productName}`}</Dialog.Title>
      <div className="flex items-center justify-between gap-4">
        <span className="truncate text-[11px] uppercase tracking-[0.15em] text-enunas-gray-dark">{label}</span>
        <Dialog.Close
          aria-label="Größenauswahl schließen"
          className="-mr-3 flex h-11 w-11 shrink-0 items-center justify-center text-enunas-black"
        >
          <svg width="16" height="16" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="0.7" aria-hidden>
            <path d="M1 1l8 8M9 1L1 9" />
          </svg>
        </Dialog.Close>
      </div>

      <SizeWheel
        label={`Größe für ${productName}`}
        sizes={sizes}
        index={index}
        onIndexChange={i => { setIndex(i); onPick?.() }}
      />

      <p className="text-center text-xs leading-snug text-enunas-black [&:not(:empty)]:pb-3" aria-live="polite">{message}</p>

      {/* The product page's add-to-cart button: purple with the two white lines. */}
      <button
        type="button"
        disabled={!buyable || pending}
        onClick={() => buyable && onConfirm(current.size)}
        className="group relative w-full shrink-0 overflow-hidden bg-enunas-purple py-4 text-lg tracking-[0.04em] text-white transition-[background-color,opacity] duration-300 ease-out-expo hover:bg-enunas-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
        style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
      >
        <span aria-hidden className="absolute left-1/2 top-[10%] h-px w-full -translate-x-1/2 bg-white/70 transition-all duration-500 ease-out-expo group-hover:w-[75%]" />
        <span className="relative z-10">{buyable ? 'In den Warenkorb' : 'Ausverkauft'}</span>
        <span aria-hidden className="absolute bottom-[10%] left-1/2 h-px w-full -translate-x-1/2 bg-white/70 transition-all duration-500 ease-out-expo group-hover:w-[75%]" />
      </button>
    </>
  )
}
