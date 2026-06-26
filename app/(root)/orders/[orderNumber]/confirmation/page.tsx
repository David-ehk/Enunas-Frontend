import ConfirmationClient from './ConfirmationClient'

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ upsell?: string }>
}) {
  const { orderNumber } = await params
  const { upsell } = await searchParams
  return <ConfirmationClient orderNumber={orderNumber} isUpsell={upsell === 'true'} />
}
