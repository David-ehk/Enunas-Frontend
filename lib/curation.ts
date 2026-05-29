export type Segment = 'streetwear' | 'cultural' | 'athleisure' | 'experimental' | 'star'

export interface CurationData {
  trendy: string[]
  drops: string[]
  recommendations: Record<Segment, string[]>
}

const STORAGE_KEY = 'enunas_curation_v1'

function empty(): CurationData {
  return {
    trendy: [],
    drops: [],
    recommendations: { streetwear: [], cultural: [], athleisure: [], experimental: [], star: [] },
  }
}

export function getCuration(): CurationData {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty()
    const p = JSON.parse(raw) as Partial<CurationData>
    return {
      trendy: p.trendy ?? [],
      drops:  p.drops ?? [],
      recommendations: {
        streetwear:   p.recommendations?.streetwear   ?? [],
        cultural:     p.recommendations?.cultural     ?? [],
        athleisure:   p.recommendations?.athleisure   ?? [],
        experimental: p.recommendations?.experimental ?? [],
        star:         p.recommendations?.star         ?? [],
      },
    }
  } catch {
    return empty()
  }
}

export function saveCuration(data: CurationData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
