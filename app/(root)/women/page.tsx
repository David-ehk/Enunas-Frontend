import { redirect } from 'next/navigation'

export default function WomenPage() {
  redirect('/bekleidung?gender=damen')
}
