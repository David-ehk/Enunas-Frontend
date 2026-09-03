import ConfirmationClient from './ConfirmationClient'
import { UPSELL_ENABLED } from '@/lib/featureFlags'

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ upsell?: string }>
}) {
  const { orderNumber } = await params
  const { upsell } = await searchParams
  // While the upsell is switched off, `?upsell=true` is ignored outright — the confirmation always
  // renders the plain thank-you, even if someone types the parameter by hand.
  const isUpsell = UPSELL_ENABLED && upsell === 'true'
  return <ConfirmationClient orderNumber={orderNumber} isUpsell={isUpsell} />
}
