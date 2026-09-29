import { describe, it, expect } from 'vitest';
import { cancelItemsErrorMessage, reconcileCancelErrorMessage } from './errorCopy';

describe('cancelItemsErrorMessage', () => {
  it('passes the backend message through for 400 (nothing was cancelled)', () => {
    expect(cancelItemsErrorMessage(400, 'Items belong to different brands'))
      .toBe('Items belong to different brands');
  });
  it('falls back to a German message for an empty 400 body', () => {
    expect(cancelItemsErrorMessage(400, ''))
      .toBe('Ungültige Anfrage — die Artikel wurden NICHT storniert.');
  });
  it('passes the backend message through for 409', () => {
    expect(cancelItemsErrorMessage(409, 'Brand has already shipped these items'))
      .toBe('Brand has already shipped these items');
  });
  it('falls back to a German message for an empty 409 body', () => {
    expect(cancelItemsErrorMessage(409, ''))
      .toBe('Status-Konflikt — bitte Bestellung neu laden.');
  });
  it('falls back to a generic message for any other status', () => {
    expect(cancelItemsErrorMessage(500, '')).toBe('Stornierung der Artikel fehlgeschlagen.');
  });
});

describe('reconcileCancelErrorMessage', () => {
  it('passes the backend message through for 409', () => {
    expect(reconcileCancelErrorMessage(409, 'Claim is still in progress'))
      .toBe('Claim is still in progress');
  });
  it('falls back to a German message for an empty 409 body', () => {
    expect(reconcileCancelErrorMessage(409, ''))
      .toBe('Die Klärung ist noch nicht möglich — bitte erneut versuchen.');
  });
  it('falls back to a generic message for any other status', () => {
    expect(reconcileCancelErrorMessage(500, '')).toBe('Aktion fehlgeschlagen.');
  });
});
