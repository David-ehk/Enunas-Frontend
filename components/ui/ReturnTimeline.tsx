import { RETURN_LIFECYCLE, returnStageIndex, RETURN_STAGE_LABELS } from '@/lib/api/modules/returnsApi'
import type { ReturnStatus } from '@/types/api'

/**
 * Per-return lifecycle stepper — REQUESTED → APPROVED → RECEIVED → REFUNDED.
 * Each return advances independently of every other return on the same order.
 *
 * Shared between the admin and vendor return views: unlike the surrounding status badges (which
 * legitimately use each portal's own design language), this stepper renders identically in both —
 * it was previously copy-pasted rather than reused.
 */
export default function ReturnTimeline({ status }: { status: ReturnStatus }) {
  const current = returnStageIndex(status)
  return (
    <div className="flex items-center gap-1.5">
      {RETURN_LIFECYCLE.map((stage, i) => (
        <div key={stage} className="flex items-center gap-1.5">
          <span
            className="text-[9.5px] uppercase tracking-[0.14em]"
            style={{
              fontFamily: 'var(--font-league-spartan)',
              color: current >= i ? '#370E4D' : '#C9C9C9',
              fontWeight: current === i ? 600 : 400,
            }}
          >
            {RETURN_STAGE_LABELS[stage]}
          </span>
          {i < RETURN_LIFECYCLE.length - 1 && (
            <span className="w-4 h-[1px]" style={{ background: current > i ? '#370E4D' : '#E8E8E8' }} />
          )}
        </div>
      ))}
    </div>
  )
}
