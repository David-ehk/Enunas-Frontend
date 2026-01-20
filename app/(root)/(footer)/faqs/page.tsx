import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

// Test muss alles noch überarbeitet werden

export default function faqs() {
  return (
    <div>
        <div>
            <h2> Herzlich willkommen!</h2>
            <h2> Wie können wir dir heute helfen ?</h2>
        </div>

        <Accordion type="single" collapsible>
            <AccordionItem value="shipping-1">
                <AccordionTrigger>Versand & Rückgabe</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>• Versand in 2–4 Werktagen</p>
                    <p>• Kostenloser Versand ab 50€</p>
                    <p>• Rückgabe innerhalb 14 Tagen</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

               <AccordionItem value="shipping-2">
                <AccordionTrigger>Versand & Rückgabe</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>• Versand in 2–4 Werktagen</p>
                    <p>• Kostenloser Versand ab 50€</p>
                    <p>• Rückgabe innerhalb 14 Tagen</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

               <AccordionItem value="shipping-3">
                <AccordionTrigger>Versand & Rückgabe</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>• Versand in 2–4 Werktagen</p>
                    <p>• Kostenloser Versand ab 50€</p>
                    <p>• Rückgabe innerhalb 14 Tagen</p>
                  </div>
                </AccordionContent>
              </AccordionItem>


               <AccordionItem value="shipping-4">
                <AccordionTrigger>Versand & Rückgabe</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>• Versand in 2–4 Werktagen</p>
                    <p>• Kostenloser Versand ab 50€</p>
                    <p>• Rückgabe innerhalb 14 Tagen</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
        </Accordion>

    </div>
  )
}
