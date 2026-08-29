// Shared S3 presigned-upload mechanics — the part of the upload contract that's identical
// regardless of what's being uploaded (brand logo, brand hero, product image). Verified live
// against production; see brandApi.ts for the purpose-specific presign calls.

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export class UploadValidationError extends Error {}

export function validateImageFile(file: File, maxSizeMB: number): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new UploadValidationError('Nicht unterstütztes Format. Erlaubt: JPG, PNG, WebP.')
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new UploadValidationError(`Datei zu groß (max. ${maxSizeMB} MB).`)
  }
}

// `host` and `content-length` are forbidden headers — browsers refuse to let JS set them and
// silently strip/reject the request if you try (this is what caused the very first "Failed to
// fetch" during verification). The browser sets both itself from the request URL/body, and the
// presigned URL's signature still matches since they were included when it was signed server-side.
const BROWSER_MANAGED_HEADERS = new Set(['host', 'content-length'])

export async function uploadFileToS3(
  file: File,
  presign: { uploadUrl: string; requiredHeaders: Record<string, string> },
): Promise<void> {
  const headers: Record<string, string> = {}
  for (const [key, value] of Object.entries(presign.requiredHeaders)) {
    if (!BROWSER_MANAGED_HEADERS.has(key.toLowerCase())) headers[key] = value
  }

  let res: Response
  try {
    res = await fetch(presign.uploadUrl, { method: 'PUT', body: file, headers })
  } catch {
    throw new Error('Upload zu S3 fehlgeschlagen (Netzwerk- oder CORS-Fehler).')
  }
  if (!res.ok) {
    throw new Error(`Upload zu S3 fehlgeschlagen (${res.status}).`)
  }
}
