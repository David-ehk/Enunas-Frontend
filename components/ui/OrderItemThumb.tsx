'use client'

import { useState } from 'react'
import Image from 'next/image'

/**
 * Purchase-time product thumbnail for one order line.
 *
 * `ApiOrderItem.imageUrl` is a snapshot frozen at order creation, so an order keeps showing what
 * was actually bought even after the brand swaps the product's photos. It is absent for rows that
 * predate the snapshot column and for lines whose product had no image at purchase — both render
 * the neutral placeholder. Never substitute another image: on an order line a wrong picture reads
 * as a picking error, which is worse than no picture.
 *
 * Portrait 3:4 to match the product-card ratio used across the storefront.
 */
export default function OrderItemThumb({
  src,
  alt = '',
  width = 44,
  className = '',
}: {
  src?: string | null
  alt?: string
  /** Width in px; height is derived at 3:4. */
  width?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-enunas-off-white border border-enunas-gray-light ${className}`}
      style={{ width, height: Math.round((width * 4) / 3) }}
    >
      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={`${width}px`}
          className="object-cover"
          // A dead S3 URL would otherwise leave a broken-image glyph in the row.
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <svg
            width={Math.round(width * 0.4)}
            height={Math.round(width * 0.4)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            className="text-enunas-gray-light"
          >
            <rect x="3" y="3" width="18" height="18" />
            <path d="M3 16l5-5 4 4 3-3 6 6" />
          </svg>
        </span>
      )}
    </div>
  )
}
