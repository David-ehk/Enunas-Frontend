// The backend now returns a guaranteed, non-null `message` on every error path — but always in
// English ("Authentication required", "Access denied", …). The UI is German, so infra-layer
// statuses get our own copy keyed on the status code. Domain-specific messages (a 400 that lists
// the accepted enum values, a 409 that names the product and tells the brand to archive it)
// carry information we cannot reconstruct from a status alone, so those pass through verbatim.
// The untranslated string is always preserved on FetchError.serverMessage for logs.

const GENERIC = 'Ein Fehler ist aufgetreten.';

// Infra-layer statuses: the backend message is boilerplate, so ours is strictly better.
const BY_STATUS: Record<number, string> = {
  401: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
  403: 'Dafür fehlt dir die Berechtigung.',
  405: 'Diese Aktion ist hier nicht möglich.',
  406: 'Dieses Antwortformat wird nicht unterstützt.',
  415: 'Das Format der Anfrage wird nicht unterstützt.',
};

const CONCURRENT_EDIT =
  'Der Eintrag wurde zwischenzeitlich geändert. Bitte lade die Seite neu und versuche es erneut.';

export function germanErrorMessage(status: number, serverMessage?: string | null): string {
  const fixed = BY_STATUS[status];
  if (fixed) return fixed;

  // 409 covers two very different things: an optimistic-locking clash (boilerplate English,
  // worth translating) and a domain refusal that names the record and the way out (keep it).
  if (status === 409) {
    if (serverMessage && /modified concurrently/i.test(serverMessage)) return CONCURRENT_EDIT;
    return serverMessage || CONCURRENT_EDIT;
  }

  if (status >= 500) return 'Serverfehler. Bitte versuche es später erneut.';

  return serverMessage || GENERIC;
}
