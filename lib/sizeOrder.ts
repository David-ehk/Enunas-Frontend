// Canonical clothing order. Numeric (shoe) sizes sort numerically after these,
// and unrecognised values are kept rather than dropped — unlike sortedSizes()
// in the slug page's types, which filters to a whitelist.
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'XXXL'];

export const sortSizes = (sizes: string[]): string[] =>
  [...sizes].sort((a, b) => {
    const na = Number(a), nb = Number(b);
    const aNum = a.trim() !== '' && !isNaN(na);
    const bNum = b.trim() !== '' && !isNaN(nb);
    if (aNum && bNum) return na - nb;
    const ia = SIZE_ORDER.indexOf(a.trim().toUpperCase());
    const ib = SIZE_ORDER.indexOf(b.trim().toUpperCase());
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
