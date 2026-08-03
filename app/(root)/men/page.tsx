import { redirect } from 'next/navigation'

export default function MenPage() {
  redirect('/bekleidung?gender=herren')
}
