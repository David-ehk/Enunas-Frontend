import React from 'react'
import {  AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

// Test muss alles noch überarbeitet werden

export default function faqs() {
  return (
    <div>
        <div>
            <h2> Herzlich willkommen!</h2>
            <h2> Wie können wir dir heute helfen ?</h2>
        </div>


            <AccordionItem value="shipping">
                <AccordionTrigger>Versand & Rückgabe</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>• Versand in 2–4 Werktagen</p>
                    <p>• Kostenloser Versand ab 50€</p>
                    <p>• Rückgabe innerhalb 14 Tagen</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

               <AccordionItem value="shipping">
                <AccordionTrigger>Versand & Rückgabe</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>• Versand in 2–4 Werktagen</p>
                    <p>• Kostenloser Versand ab 50€</p>
                    <p>• Rückgabe innerhalb 14 Tagen</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

               <AccordionItem value="shipping">
                <AccordionTrigger>Versand & Rückgabe</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>• Versand in 2–4 Werktagen</p>
                    <p>• Kostenloser Versand ab 50€</p>
                    <p>• Rückgabe innerhalb 14 Tagen</p>
                  </div>
                </AccordionContent>
              </AccordionItem>


               <AccordionItem value="shipping">
                <AccordionTrigger>Versand & Rückgabe</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p>• Versand in 2–4 Werktagen</p>
                    <p>• Kostenloser Versand ab 50€</p>
                    <p>• Rückgabe innerhalb 14 Tagen</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

    </div>
  )
}
