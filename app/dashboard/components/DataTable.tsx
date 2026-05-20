interface DataTableProps {
  headers: string[]
  rows: React.ReactNode[][]
  emptyMessage?: string
}

export default function DataTable({ headers, rows, emptyMessage = 'No data' }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full border-collapse">
        <thead>
          <tr style={{ background: '#F5F5F0', borderBottom: '1px solid #E8E8E8' }}>
            {headers.map(h => (
              <th
                key={h}
                className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.12em] whitespace-nowrap"
                style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B', fontWeight: 600 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-10 text-center text-sm"
                style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr
                key={ri}
                className="transition-colors duration-150 hover:bg-[#F5F5F0]/50"
                style={{ borderBottom: '1px solid #E8E8E8' }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-3.5 text-sm align-middle"
                    style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
