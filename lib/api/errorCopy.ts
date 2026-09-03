// The backend now returns a guaranteed, non-null `message` on every error path — but always in
// English ("Authentication required", "Access denied", …). The UI is German, so infra-layer
// statuses get our own copy keyed on the status code. Domain-specific messages (a 400 that lists
// the accepted enum values, a 409 that names the product and tells the brand to archive it)
// carry information we cannot reconstruct from a status alone, so those pass through verbatim.
// The untranslated string is always preserved on FetchError.serverMessage for logs.

const GENERIC = 'Ein Fehler ist aufgetreten.';
const SERVER_ERROR = 'Serverfehler. Bitte versuche es später erneut.';

// Infra-layer statuses: the backend message is boilerplate, so ours is strictly better.
const BY_STATUS: Record<number, string> = {
  401: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
  403: 'Dafür fehlt dir die Berechtigung.',
  405: 'Diese Aktion ist hier nicht möglich.',
  406: 'Dieses Antwortformat wird nicht unterstützt.',
  415: 'Das Format der Anfrage wird nicht unterstützt.',
};

// Stable backend failure codes. These are the whole set the backend ships today; every one of
// them comes from DELETE /products/delete/{id}. Copy is ours — the backend `message` is English
// and explicitly reworded over time, so it is never shown for a code we recognise.
//
// `remedy` drives which way out the UI offers, so a caller never invents an action the backend
// has already ruled out (a product that has been ordered can never be deleted, so offering
// "delete the listings and retry" there would be a dead end).
export type ApiErrorCode = 'PRODUCT_HAS_ORDERS' | 'PRODUCT_HAS_LISTINGS' | 'PRODUCT_REFERENCED';

export type ErrorRemedy = 'archive' | 'delete-listings' | 'support';

export const ERROR_CODE_COPY: Record<ApiErrorCode, { message: string; remedies: ErrorRemedy[] }> = {
  PRODUCT_HAS_ORDERS: {
    message:
      'Dieses Produkt wurde bereits bestellt und kann deshalb nicht mehr gelöscht werden. ' +
      'Archiviere es stattdessen — es verschwindet aus dem Shop, die Bestellhistorie bleibt erhalten.',
    remedies: ['archive'],
  },
  PRODUCT_HAS_LISTINGS: {
    message:
      'Für dieses Produkt gibt es noch Listings. Lösche zuerst die Listings und versuche es ' +
      'erneut — oder archiviere das Produkt.',
    remedies: ['delete-listings', 'archive'],
  },
  PRODUCT_REFERENCED: {
    message:
      'Dieses Produkt ist noch an anderer Stelle verknüpft und lässt sich nicht selbst löschen. ' +
      'Bitte wende dich an den Support.',
    remedies: ['support'],
  },
};

export function errorRemedies(code?: string): ErrorRemedy[] {
  if (!code) return [];
  return ERROR_CODE_COPY[code as ApiErrorCode]?.remedies ?? [];
}

const CONCURRENT_EDIT =
  'Der Eintrag wurde zwischenzeitlich geändert. Bitte lade die Seite neu und versuche es erneut.';

export function germanErrorMessage(
  status: number,
  serverMessage?: string | null,
  code?: string | null,
): string {
  // A recognised code is the most specific thing we have and outranks both the status copy and
  // the backend message. An unrecognised one is a generic failure — the set grows, and guessing
  // at an unknown code's meaning from its English message is exactly what `code` exists to stop.
  if (code) {
    const known = ERROR_CODE_COPY[code as ApiErrorCode];
    if (known) return known.message;
    return BY_STATUS[status] ?? (status >= 500 ? SERVER_ERROR : GENERIC);
  }

  const fixed = BY_STATUS[status];
  if (fixed) return fixed;

  // 409 covers two very different things: an optimistic-locking clash (boilerplate English,
  // worth translating) and a domain refusal that names the record and the way out (keep it).
  if (status === 409) {
    if (serverMessage && /modified concurrently/i.test(serverMessage)) return CONCURRENT_EDIT;
    return serverMessage || CONCURRENT_EDIT;
  }

  if (status >= 500) return SERVER_ERROR;

  return serverMessage || GENERIC;
}
