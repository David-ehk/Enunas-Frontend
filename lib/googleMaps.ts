// ============================================================
// Lazy Google Maps Places (New) loader
// ============================================================
//
// Google Places Autocomplete is an optional convenience feature — native browser autofill and
// manual entry must work with zero involvement from this module. Nothing here runs until a
// consumer explicitly calls loadGooglePlaces() (never on page load), and every failure path
// resolves to `false` rather than throwing, so callers can just no-op and fall back to a plain
// input.

const SCRIPT_ID = 'enunas-google-maps-script';
const READY_CALLBACK = '__enunasGoogleMapsReady';

let loadPromise: Promise<boolean> | null = null;

function placesReady(): boolean {
  return typeof google !== 'undefined' && typeof google.maps?.places?.AutocompleteSuggestion === 'function';
}

function mapsBootstrapped(): boolean {
  return typeof google !== 'undefined' && typeof google.maps?.importLibrary === 'function';
}

/**
 * Loads the Maps JS SDK and its Places (New) library, once, on first call. Cached across
 * repeated calls (e.g. multiple AddressAutocomplete instances) so the script is never injected
 * twice. Resolves `false` — never rejects — when no API key is configured or loading fails for
 * any reason; a failed load is not cached, so the next call retries.
 */
export function loadGooglePlaces(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (placesReady()) return Promise.resolve(true);

  const apiKey = process.env.NEXT_PUBLIC_MAPS_PLATFORM_API_KEY;
  if (!apiKey) return Promise.resolve(false);

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<boolean>((resolve) => {
    const importPlaces = () => {
      google.maps
        .importLibrary('places')
        .then(() => resolve(placesReady()))
        .catch(() => resolve(false));
    };

    try {
      if (mapsBootstrapped()) {
        importPlaces();
        return;
      }

      // With `loading=async`, the script's `onload` fires before google.maps.importLibrary is
      // defined, so it can't be used as the ready signal. Google invokes the `callback` param
      // once the bootstrap is ready.
      (window as unknown as Record<string, unknown>)[READY_CALLBACK] = importPlaces;

      // Script already injected and still loading — the callback above fires when it's ready.
      if (document.getElementById(SCRIPT_ID)) return;

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&v=weekly&callback=${READY_CALLBACK}`;
      script.async = true;
      script.onerror = () => {
        script.remove();
        resolve(false);
      };
      document.head.appendChild(script);
    } catch {
      resolve(false);
    }
  }).then((ready) => {
    if (!ready) loadPromise = null;
    return ready;
  });

  return loadPromise;
}
