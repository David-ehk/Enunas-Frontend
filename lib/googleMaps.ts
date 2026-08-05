// ============================================================
// Lazy Google Maps Places (New) loader
// ============================================================
//
// Google Places Autocomplete is an optional convenience feature — native browser autofill and
// manual entry must work with zero involvement from this module. Nothing here runs until a
// consumer explicitly calls loadGooglePlaces() (never on page load), and every failure path
// resolves to `false` rather than throwing, so callers can just no-op and fall back to a plain
// input.

let loadPromise: Promise<boolean> | null = null;

function placesReady(): boolean {
  return typeof google !== 'undefined' && typeof google.maps?.places?.AutocompleteSuggestion === 'function';
}

/**
 * Loads the Maps JS SDK and its Places (New) library, once, on first call. Cached across
 * repeated calls (e.g. multiple AddressAutocomplete instances) so the script is never injected
 * twice. Resolves `false` — never rejects — when no API key is configured or loading fails for
 * any reason.
 */
export function loadGooglePlaces(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (placesReady()) return Promise.resolve(true);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.resolve(false);

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<boolean>((resolve) => {
    try {
      const finishWithImportLibrary = () => {
        if (typeof google === 'undefined' || typeof google.maps?.importLibrary !== 'function') {
          resolve(false);
          return;
        }
        google.maps
          .importLibrary('places')
          .then(() => resolve(placesReady()))
          .catch(() => resolve(false));
      };

      if (typeof google !== 'undefined' && typeof google.maps?.importLibrary === 'function') {
        finishWithImportLibrary();
        return;
      }

      const existing = document.getElementById('enunas-google-maps-script');
      if (existing) {
        existing.addEventListener('load', finishWithImportLibrary);
        existing.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.id = 'enunas-google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&libraries=places&v=weekly`;
      script.async = true;
      script.onerror = () => resolve(false);
      script.onload = finishWithImportLibrary;
      document.head.appendChild(script);
    } catch {
      resolve(false);
    }
  });

  return loadPromise;
}
