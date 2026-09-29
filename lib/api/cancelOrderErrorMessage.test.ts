import { describe, it, expect } from 'vitest';
import { cancelOrderErrorMessage } from './errorCopy';

describe('cancelOrderErrorMessage', () => {
  it('returns refund-failed message when error mentions Mollie', () => {
    const msg = cancelOrderErrorMessage('PAID', 'Mollie refund failed');
    expect(msg).toContain('Erstattung bei Mollie fehlgeschlagen');
    expect(msg).toContain('NICHT storniert');
  });

  it('returns refund-failed message when error mentions refund', () => {
    const msg = cancelOrderErrorMessage('PAID', 'Refund operation failed');
    expect(msg).toContain('Erstattung bei Mollie fehlgeschlagen');
  });

  it('returns backend message verbatim for non-refund 409 errors', () => {
    const msg = cancelOrderErrorMessage('SHIPPED', 'Invalid status transition');
    expect(msg).toBe('Invalid status transition');
  });

  it('returns generic error for empty message', () => {
    const msg = cancelOrderErrorMessage('PENDING', '');
    expect(msg).toBe('Ein Fehler ist aufgetreten.');
  });
});
