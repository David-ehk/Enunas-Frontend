import ConfirmationClient from './ConfirmationClient'

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  return <ConfirmationClient orderNumber={orderNumber} />
}
