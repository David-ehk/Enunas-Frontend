interface PflegeAccordionContentProps {
  careInstructions: string | null;
}

// The brand writes these per product ("30°C Maschinenwäsche, nicht bleichen, liegend trocknen").
// They arrive as one comma-separated line, so we split them into a list rather than printing the
// raw string — and we no longer append a generic filler sentence that read identically on every
// product and was set in a monospace font that is not part of the Enunas type system.
function splitInstructions(raw: string): string[] {
  return raw
    .split(/[,;·]|\s+\|\s+/)
    .map(part => part.trim())
    .filter(Boolean);
}

export default function PflegeAccordionContent({ careInstructions }: PflegeAccordionContentProps) {
  if (!careInstructions?.trim()) {
    return (
      <span
        className="text-enunas-gray-medium italic"
        style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
      >
        Keine Pflegehinweise hinterlegt.
      </span>
    );
  }

  const parts = splitInstructions(careInstructions);

  // A single instruction reads better as a sentence than as a one-item list.
  if (parts.length <= 1) {
    return (
      <p
        className="text-[16px] leading-[1.7] text-enunas-black"
        style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
      >
        {careInstructions.trim()}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {parts.map(part => (
        <li key={part} className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-[9px] h-px w-3 shrink-0 bg-enunas-gray-medium"
          />
          <span
            className="text-[16px] leading-[1.7] text-enunas-black"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)' }}
          >
            {part}
          </span>
        </li>
      ))}
    </ul>
  );
}
