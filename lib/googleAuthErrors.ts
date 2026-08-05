import { FetchError } from '@/lib/api';

// Deliberately does NOT reuse the existing "show err.message verbatim" convention that the
// email/password login forms use — this feature's own spec says never expose backend errors
// directly for the Google path. Mapped by HTTP status for the MVP; if the backend later adds
// stable machine-readable error codes (e.g. GOOGLE_ACCOUNT_DISABLED), prefer switching on that
// here instead — call sites never need to change.
export function mapGoogleAuthError(err: unknown): string {
  if (err instanceof FetchError) {
    switch (err.status) {
      case 400:
        return 'Die Google-Anmeldung konnte nicht verifiziert werden. Bitte versuche es erneut.';
      case 409:
        return 'Dieses Konto ist derzeit gesperrt oder wartet auf Freigabe. Bitte kontaktiere den Support.';
      default:
        return 'Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut.';
    }
  }
  return 'Netzwerkfehler. Bitte überprüfe deine Verbindung und versuche es erneut.';
}
