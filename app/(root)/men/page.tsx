import { redirect } from 'next/navigation'

// Backend GET /products has no gender filter — redirect to catalog without fake param.
export default function MenPage() {
  redirect('/bekleidung')
}
