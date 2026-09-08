'use client'

import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { validateImageFile, uploadFileToS3, UploadValidationError } from '@/lib/api/upload'
import type { MediaUploadUrlResponse } from '@/lib/api/modules/brandApi'

interface ImageDropzoneProps {
  label: string
  // Hides the visible <label> text above the drop area while keeping it as the aria-label —
  // for compact contexts (e.g. admin's narrow sidebar) where a section heading already
  // explains what the dropzone is for.
  hideLabel?: boolean
  hint?: string
  currentUrl?: string | null
  maxSizeMB: number
  // Tailwind aspect-ratio class for the drop area, e.g. 'aspect-square', 'aspect-[21/9]'.
  aspect?: string
  getUploadUrl: (contentType: string, contentLength: number) => Promise<MediaUploadUrlResponse>
  // Caller registers the uploaded key against the product/brand (PATCH /brandpartner/me with
  // logoStorageKey/heroStorageKey, or POST /products/{id}/media/images with storageKey) and
  // updates its own state — this component only handles the drag/drop + S3 part.
  onUploaded: (key: string) => Promise<void>
  disabled?: boolean
}

export default function ImageDropzone({
  label, hideLabel = false, hint, currentUrl, maxSizeMB, aspect = 'aspect-square', getUploadUrl, onUploaded, disabled = false,
}: ImageDropzoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const busy = disabled || uploading

  async function handleFile(file: File) {
    setError(null)
    try {
      validateImageFile(file, maxSizeMB)
    } catch (e) {
      setError(e instanceof UploadValidationError ? e.message : 'Ungültige Datei.')
      return
    }
    setUploading(true)
    try {
      const presign = await getUploadUrl(file.type, file.size)
      await uploadFileToS3(file, presign)
      await onUploaded(presign.key)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (busy) return
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  return (
    <div>
      {!hideLabel && (
        <label className="block text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium mb-1.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>
          {label}
        </label>
      )}

      <div
        onDragOver={e => { e.preventDefault(); if (!busy) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex={busy ? -1 : 0}
        onKeyDown={e => { if (!busy && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click() } }}
        aria-label={currentUrl ? `${label} ersetzen` : `${label} hochladen`}
        className={`relative ${aspect} w-full overflow-hidden border transition-colors duration-200 ease-out-quart group ${busy ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
        style={{
          borderStyle: currentUrl ? 'solid' : 'dashed',
          borderWidth: currentUrl ? 1 : 1.5,
          borderColor: dragOver ? '#370E4D' : currentUrl ? '#E8E8E8' : '#D4D4CE',
          background: dragOver ? 'rgba(55,14,77,0.05)' : currentUrl ? '#F5F5F0' : '#FAFAF8',
        }}
      >
        {currentUrl && (
          // Preview of a freshly uploaded S3 asset; no known dimensions/priority
          // to justify next/image here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}

        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center transition-opacity duration-200 ease-out-quart"
          style={{
            background: currentUrl ? 'rgba(10,10,10,0.45)' : 'transparent',
            opacity: currentUrl && !dragOver && !uploading ? 0 : 1,
          }}
        >
          {uploading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-5 h-5" style={{ color: dragOver ? '#370E4D' : currentUrl ? '#fff' : '#C0C0BC' }} />
              <p className="text-[11px]" style={{ fontFamily: 'var(--font-league-spartan)', color: dragOver ? '#370E4D' : currentUrl ? '#fff' : '#9B9B9B' }}>
                {currentUrl ? 'Ersetzen' : 'Datei hierher ziehen oder klicken'}
              </p>
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={busy}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />

      {error ? (
        <p className="text-[11px] text-[#8B1E3F] mt-1.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>{error}</p>
      ) : hint ? (
        <p className="text-[10px] text-[#C0C0BC] mt-1.5" style={{ fontFamily: 'var(--font-league-spartan)' }}>{hint}</p>
      ) : null}
    </div>
  )
}
