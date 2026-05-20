/**
 * Replacement body for the third accordion of ProductDetails.
 * Was: "Inspiration" — moved to top of page as a pull-quote.
 * Now: "Pflegehinweise" — clear, scannable care instructions.
 */

interface PflegeAccordionContentProps {
  careInstructions: string | null;
}

export default function PflegeAccordionContent({ careInstructions }: PflegeAccordionContentProps) {
  if (!careInstructions) {
    return (
      <span className="text-enunas-gray-medium italic">
        Keine Pflegehinweise hinterlegt — <code className="font-mono text-xs">careInstructions: null</code>
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

/* Use inside your existing AccordionContent:

  <AccordionItem value="pflege">
    <AccordionTrigger>Pflegehinweise</AccordionTrigger>
    <AccordionContent>
      <PflegeAccordionContent careInstructions={product.careInstructions} />
    </AccordionContent>
  </AccordionItem>

*/
