'use client'

interface DataPoint {
  month: string
  gmv: number
  revenue: number
}

interface RevenueChartProps {
  data: DataPoint[]
}

const CHART_LEFT = 58
const CHART_RIGHT = 600
const CHART_TOP = 12
const CHART_BOTTOM = 165
const CHART_W = CHART_RIGHT - CHART_LEFT
const CHART_H = CHART_BOTTOM - CHART_TOP
const BAR_W = 18
const BAR_GAP = 6
const GROUP_W = BAR_W * 2 + BAR_GAP

function fmtK(n: number) {
  return n >= 1000 ? `€${(n / 1000).toFixed(0)}k` : `€${n}`
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const maxVal = Math.max(...data.map(d => d.gmv))
  const roundedMax = Math.ceil(maxVal / 10000) * 10000
  const gridLevels = [0, 0.25, 0.5, 0.75, 1]
  const slotW = CHART_W / data.length

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center gap-5 mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 inline-block flex-shrink-0" style={{ background: '#370E4D', borderRadius: '2px' }} />
          <span
            className="text-[10px] uppercase tracking-[0.1em]"
            style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}
          >
            GMV
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 inline-block flex-shrink-0" style={{ background: '#9B7FB5', borderRadius: '2px' }} />
          <span
            className="text-[10px] uppercase tracking-[0.1em]"
            style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}
          >
            Platform Revenue
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 640 200`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        aria-label="Revenue chart"
      >
        {/* Grid lines */}
        {gridLevels.map(p => {
          const y = CHART_BOTTOM - p * CHART_H
          return (
            <g key={p}>
              <line
                x1={CHART_LEFT} y1={y}
                x2={CHART_RIGHT} y2={y}
                stroke="#E8E8E8"
                strokeWidth={p === 0 ? 1.5 : 1}
              />
              {p > 0 && (
                <text
                  x={CHART_LEFT - 6}
                  y={y + 4}
                  textAnchor="end"
                  fill="#6B6B6B"
                  style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '9px' }}
                >
                  {fmtK(p * roundedMax)}
                </text>
              )}
            </g>
          )
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const slotCenter = CHART_LEFT + slotW * i + slotW / 2
          const x1 = slotCenter - GROUP_W / 2
          const x2 = x1 + BAR_W + BAR_GAP

          const h1 = (d.gmv / roundedMax) * CHART_H
          const h2 = (d.revenue / roundedMax) * CHART_H

          return (
            <g key={d.month}>
              {/* GMV bar */}
              <rect
                x={x1}
                y={CHART_BOTTOM - h1}
                width={BAR_W}
                height={h1}
                fill="#370E4D"
                rx={2}
              />
              {/* Revenue bar */}
              <rect
                x={x2}
                y={CHART_BOTTOM - h2}
                width={BAR_W}
                height={h2}
                fill="#9B7FB5"
                rx={2}
              />
              {/* Month label */}
              <text
                x={slotCenter}
                y={CHART_BOTTOM + 16}
                textAnchor="middle"
                fill="#6B6B6B"
                style={{ fontFamily: 'var(--font-league-spartan)', fontSize: '10px' }}
              >
                {d.month}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
