'use client'

import { useState, useEffect } from 'react'
import { brandApi } from '@/lib/api/modules/brandApi'
import type { AdminApiProduct, ApiProductColor, ApiProductImage } from '@/types/api'
import { SectionCard, Loader } from '../../../admin/_components/shared'
import ImageDropzone from '@/components/ui/ImageDropzone'
import { Star, Trash2 } from 'lucide-react'
import { COLOR_LABELS, COLOR_SWATCHES } from './constants'

// An image is either tagged to one colourway or left "shared" (productColorId null — shown for
// every colourway). The PDP gallery for a swatch = its own images ∪ all shared images. Images are
// managed in colour groups: "Alle Farben (geteilt)" plus one per colourway.
const SHARED_GROUP_ID = null as number | null

interface ColourGroup {
  id: number | null   // null = the shared group
  label: string
  hex: string | null
}

function colourGroupsFor(product: AdminApiProduct): ColourGroup[] {
  const shared: ColourGroup = { id: SHARED_GROUP_ID, label: 'Alle Farben (geteilt)', hex: null }

  // Prefer the backend's colors[] (real ProductColor ids); fall back to distinct variant colours.
  const fromColors: ApiProductColor[] = product.colors ?? []
  const source = fromColors.length > 0
    ? fromColors.map(c => ({ id: c.id, key: c.colorFamily ?? c.color, name: c.color }))
    : Array.from(
        new Map(
          (product.variants ?? [])
            .filter(v => v.colorId != null)
            .map(v => [v.colorId as number, { id: v.colorId as number, key: v.colorFamily ?? v.color ?? '', name: v.color ?? '' }]),
        ).values(),
      )

  return [
    shared,
    ...source.map(c => ({
      id: c.id,
      label: COLOR_LABELS[c.key] ?? c.name ?? 'Farbe',
      hex: COLOR_SWATCHES[c.key] ?? '#E8E8E8',
    })),
  ]
}

export default function ImagesSection({
  product,
  onImagesChanged,
}: {
  product: AdminApiProduct
  /** Keeps the product list's row thumbnail in sync — it used to show the empty placeholder
   *  until the brand hit "Aktualisieren", which read as a failed upload. */
  onImagesChanged?: (imageUrls: string[]) => void
}) {
  const [images, setImages]     = useState<ApiProductImage[]>([])
  const [loading, setLoading]   = useState(true)
  const [uploadErr, setUploadErr] = useState<string | null>(null)
  const [busyId, setBusyId]     = useState<string | null>(null)

  const groups = colourGroupsFor(product)
  const hasColourways = groups.length > 1

  useEffect(() => {
    brandApi.images.list(product.id)
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false))
  }, [product.id])

  function publish(next: ApiProductImage[]) {
    setImages(next)
    onImagesChanged?.(next.map(i => i.imageUrl))
  }

  // Canonical re-fetch after a mutation — the backend owns the one-primary-per-group rule, so
  // reconciling it client-side would only drift.
  async function refresh() {
    try {
      publish(await brandApi.images.list(product.id))
    } catch { /* keep the optimistic state */ }
  }

  function uploadFor(colourId: number | null) {
    return async (key: string) => {
      setUploadErr(null)
      try {
        await brandApi.images.add(product.id, key, colourId != null ? { productColorId: colourId } : {})
        await refresh()
      } catch {
        setUploadErr('Bild konnte nicht gespeichert werden.')
      }
    }
  }

  async function deleteImage(imageId: string) {
    setBusyId(imageId)
    try {
      await brandApi.images.delete(product.id, imageId)
      publish(images.filter(i => i.id !== imageId))
    } catch { /* silent */ }
    finally { setBusyId(null) }
  }

  async function setPrimary(imageId: string) {
    setBusyId(imageId)
    try {
      await brandApi.images.update(product.id, imageId, { primary: true })
      await refresh()
    } catch { /* silent */ }
    finally { setBusyId(null) }
  }

  async function reassignColour(imageId: string, colourId: number | null) {
    setBusyId(imageId)
    try {
      await brandApi.images.update(
        product.id, imageId,
        colourId != null ? { productColorId: colourId } : { unassignColor: true },
      )
      await refresh()
    } catch { /* silent */ }
    finally { setBusyId(null) }
  }

  const sharedCount = images.filter(i => (i.productColorId ?? null) === SHARED_GROUP_ID).length
  const showNudge = hasColourways && groups.length > 2 && sharedCount > 0

  return (
    <SectionCard title="Produktbilder">
      <div className="p-6 space-y-6">
        {loading ? <Loader /> : (
          <>
            {showNudge && (
              <p className="text-[11px] text-[#7A5C1E] bg-[#7A5C1E]/8 border border-[#7A5C1E]/20 px-3 py-2"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Tipp: Weise Bilder einer Farbe zu, damit Kund:innen pro Farbvariante die passenden Fotos sehen.
              </p>
            )}

            {groups.map(group => {
              const groupImages = images.filter(i => (i.productColorId ?? null) === group.id)
              const isShared = group.id === SHARED_GROUP_ID
              return (
                <div key={group.id ?? 'shared'} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {group.hex
                      ? <span className="w-3.5 h-3.5 shrink-0 border border-black/10" style={{ background: group.hex }} />
                      : <span className="w-3.5 h-3.5 shrink-0 border border-dashed border-[#C0C0BC]" />}
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#2D2D2D] font-medium"
                      style={{ fontFamily: 'var(--font-league-spartan)' }}>
                      {group.label}
                    </p>
                    <span className="text-[10px] text-[#C0C0BC]">{groupImages.length}</span>
                  </div>

                  {isShared && hasColourways && (
                    <p className="text-[10px] text-[#9B9B9B]" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                      Diese Bilder werden für alle Farbvarianten angezeigt.
                    </p>
                  )}

                  {groupImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {groupImages.map(img => (
                        <div key={img.id} className="space-y-1.5">
                          <div className="relative group rounded-none overflow-hidden aspect-[3/4] bg-[#F5F5F0]">
                            <img src={img.imageUrl} alt={img.altText ?? ''} className="w-full h-full object-cover" />
                            {img.primary && (
                              <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#370E4D] text-white text-[9px] px-1.5 py-0.5 uppercase tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                <Star className="w-2.5 h-2.5 fill-current" /> Titel
                              </span>
                            )}
                            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              {!img.primary && (
                                <button
                                  onClick={() => setPrimary(img.id)}
                                  disabled={busyId === img.id}
                                  title="Als Titelbild setzen"
                                  className="w-7 h-7 rounded-none bg-black/60 flex items-center justify-center text-white hover:bg-[#370E4D] transition-colors"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteImage(img.id)}
                                disabled={busyId === img.id}
                                title="Bild löschen"
                                className="w-7 h-7 rounded-none bg-black/60 flex items-center justify-center text-white hover:bg-rose-600 transition-colors"
                              >
                                {busyId === img.id ? <span className="text-[10px]">…</span> : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          {hasColourways && (
                            <select
                              value={img.productColorId ?? ''}
                              onChange={e => reassignColour(img.id, e.target.value === '' ? null : Number(e.target.value))}
                              disabled={busyId === img.id}
                              className="w-full text-[10px] border border-[#E8E8E8] bg-white rounded-none px-1.5 py-1 focus:outline-none focus:border-[#370E4D]/50"
                              style={{ fontFamily: 'var(--font-league-spartan)' }}
                            >
                              {groups.map(g => (
                                <option key={g.id ?? 'shared'} value={g.id ?? ''}>{g.label}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="max-w-xs">
                    <ImageDropzone
                      label={groupImages.length > 0 ? 'Weiteres Bild hinzufügen' : 'Bild hinzufügen'}
                      hint="JPG, PNG, WebP · max. 10 MB"
                      maxSizeMB={10}
                      aspect="aspect-[3/4]"
                      getUploadUrl={(contentType, contentLength) => brandApi.images.getUploadUrl(product.id, contentType, contentLength)}
                      onUploaded={uploadFor(group.id)}
                    />
                  </div>
                </div>
              )
            })}

            {uploadErr && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{uploadErr}</p>}
          </>
        )}
      </div>
    </SectionCard>
  )
}
