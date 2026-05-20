interface PflegeAccordionContentProps {
  careInstructions: string | null;
}

export default function PflegeAccordionContent({ careInstructions }: PflegeAccordionContentProps) {
  if (!careInstructions) {
    return (
      <span className="text-enunas-gray-medium italic">
        Keine Pflegehinweise hinterlegt.
      </span>
    );
  }

  return (
    <>
      <p className="text-[17px] leading-[1.7] text-enunas-black mb-3">
        {careInstructions}
      </p>
      <p className="font-mono text-[11px] tracking-[0.04em] text-enunas-gray-medium">
        Hinweise zur richtigen Reinigung und Lagerung sorgen für eine lange Lebensdauer des Produkts.
      </p>
    </>
  );
}
