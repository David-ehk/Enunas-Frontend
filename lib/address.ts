// ============================================================
// ENUNAS — Address form values, validation, and Google Places parsing
// ============================================================
//
// Frontend validation exists only for UX — it mirrors the backend's @Size/@Pattern constraints
// (see UserAddressDto / ShippingAddressDto, both verified against the Java source) closely
// enough to avoid round-trips, but the backend remains authoritative. Its error messages are
// what surface on an actual rejection.

import type { UserAddressDto } from '@/lib/api/modules/addressApi';
import type { ShippingAddressDto } from '@/lib/api/modules/orderApi';

export interface AddressFormValues {
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
}

export const EMPTY_ADDRESS_FORM: AddressFormValues = {
  firstName: '',
  lastName: '',
  street: '',
  houseNumber: '',
  addressLine2: '',
  postalCode: '',
  city: '',
  country: 'DE',
  phone: '',
};

export type AddressFormErrors = Partial<Record<keyof AddressFormValues, string>>;

// The resolved choice a customer has made at checkout — maps 1:1 onto the backend's
// @ExactlyOneAddressSource contract on CreateOrderDto (see lib/api/modules/orderApi.ts).
export type AddressSelection =
  | { mode: 'saved'; id: number }
  | { mode: 'new'; address: AddressFormValues; savedToBook: boolean };

/** Maps form values onto the saved-address-book DTO — no phone, that field doesn't exist there. */
export function toUserAddressDto(values: AddressFormValues): UserAddressDto {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    street: values.street.trim(),
    houseNumber: values.houseNumber.trim(),
    addressLine2: values.addressLine2.trim() || undefined,
    postalCode: values.postalCode.trim(),
    city: values.city.trim(),
    country: values.country,
  };
}

/** Maps form values onto the ad-hoc order-shipping DTO — includes phone. */
export function toShippingAddressDto(values: AddressFormValues): ShippingAddressDto {
  return {
    ...toUserAddressDto(values),
    phone: values.phone.trim() || undefined,
  };
}

const HOUSE_NUMBER_RE = /^[A-Za-z0-9 /-]{1,16}$/;
const GERMAN_POSTAL_CODE_RE = /^\d{5}$/;
const PHONE_RE = /^[+0-9 ()-]*$/;

/**
 * Validates address form values for UX purposes. `phone` is only checked when `requirePhone`-
 * adjacent fields matter to the caller — the field itself is always optional, so an empty value
 * never errors.
 */
export function validateAddressForm(values: AddressFormValues): AddressFormErrors {
  const errors: AddressFormErrors = {};

  if (!values.firstName.trim()) errors.firstName = 'Vorname ist erforderlich.';
  else if (values.firstName.length > 100) errors.firstName = 'Vorname ist zu lang.';

  if (!values.lastName.trim()) errors.lastName = 'Nachname ist erforderlich.';
  else if (values.lastName.length > 100) errors.lastName = 'Nachname ist zu lang.';

  if (!values.street.trim()) errors.street = 'Straße ist erforderlich.';
  else if (values.street.length > 255) errors.street = 'Straße ist zu lang.';

  if (!values.houseNumber.trim()) errors.houseNumber = 'Hausnummer ist erforderlich.';
  else if (!HOUSE_NUMBER_RE.test(values.houseNumber)) errors.houseNumber = 'Ungültige Hausnummer.';

  if (values.addressLine2.length > 255) errors.addressLine2 = 'Adresszusatz ist zu lang.';

  if (!values.postalCode.trim()) errors.postalCode = 'Postleitzahl ist erforderlich.';
  else if (values.country === 'DE' && !GERMAN_POSTAL_CODE_RE.test(values.postalCode)) {
    errors.postalCode = 'Bitte eine gültige 5-stellige PLZ eingeben.';
  }

  if (!values.city.trim()) errors.city = 'Stadt ist erforderlich.';
  else if (values.city.length > 128) errors.city = 'Stadt ist zu lang.';

  if (!values.country.trim() || values.country.length !== 2) {
    errors.country = 'Land ist erforderlich.';
  }

  if (values.phone && (values.phone.length > 30 || !PHONE_RE.test(values.phone))) {
    errors.phone = 'Ungültige Telefonnummer.';
  }

  return errors;
}

export function isAddressFormValid(values: AddressFormValues): boolean {
  return Object.keys(validateAddressForm(values)).length === 0;
}

/**
 * Parses a Google Places (New) `Place.addressComponents` array into partial address form values.
 * Never throws — an unparseable or missing component is simply omitted, leaving that field for
 * the user to fill in manually. Country is deliberately not trusted from Google: the MVP only
 * ships within Germany, so callers should keep `country: 'DE'` fixed regardless of the result.
 */
export function parseGooglePlaceComponents(
  components: google.maps.places.AddressComponent[] | undefined | null
): Partial<Pick<AddressFormValues, 'street' | 'houseNumber' | 'postalCode' | 'city'>> {
  if (!components?.length) return {};

  const byType = (type: string) =>
    components.find((c) => c.types.includes(type))?.longText ?? undefined;

  const result: Partial<Pick<AddressFormValues, 'street' | 'houseNumber' | 'postalCode' | 'city'>> = {};

  const route = byType('route');
  if (route) result.street = route;

  const streetNumber = byType('street_number');
  if (streetNumber) result.houseNumber = streetNumber;

  const postalCode = byType('postal_code');
  if (postalCode) result.postalCode = postalCode;

  // Prefer locality; German villages/small towns sometimes only carry postal_town.
  const city = byType('locality') ?? byType('postal_town');
  if (city) result.city = city;

  return result;
}
