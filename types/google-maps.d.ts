// ============================================================
// Minimal ambient types for the Google Maps JavaScript API's Places library (New) — just the
// surface lib/googleMaps.ts and AddressAutocomplete.tsx actually use. No @types/google.maps
// dependency: that package types the full API surface, which is far more than this optional,
// gracefully-degrading feature needs. Not a module (no import/export) so this merges into the
// global `google` namespace, matching how the script-loaded SDK exposes itself at runtime.
// ============================================================

declare namespace google.maps {
  function importLibrary(libraryName: string): Promise<unknown>;
}

declare namespace google.maps.places {
  interface AddressComponent {
    longText?: string;
    shortText?: string;
    types: string[];
  }

  class AutocompleteSessionToken {}

  interface AutocompleteSuggestionRequest {
    input: string;
    sessionToken?: AutocompleteSessionToken;
    includedPrimaryTypes?: string[];
    includedRegionCodes?: string[];
    language?: string;
  }

  interface StringRange {
    startOffset: number;
    endOffset: number;
  }

  interface FormattableText {
    text: string;
    matches: StringRange[];
  }

  class Place {
    id: string;
    addressComponents?: AddressComponent[];
    fetchFields(options: { fields: string[] }): Promise<{ place: Place }>;
  }

  class PlacePrediction {
    text: FormattableText;
    mainText?: FormattableText;
    secondaryText?: FormattableText;
    toPlace(): Place;
  }

  class AutocompleteSuggestion {
    placePrediction: PlacePrediction | null;
  }

  namespace AutocompleteSuggestion {
    function fetchAutocompleteSuggestions(
      request: AutocompleteSuggestionRequest
    ): Promise<{ suggestions: AutocompleteSuggestion[] }>;
  }
}
