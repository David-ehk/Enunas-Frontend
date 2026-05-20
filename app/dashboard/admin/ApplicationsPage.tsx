'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { adminApplications } from '../lib/mockData'

type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected'

interface Application {
  name: string
  followers: string
  category: string
  submitted: string
  status: string
}

const STATUS: Record<string, string> = {
  Pending:  'bg-amber-50 text-amber-700',
  Approved: 'bg-green-50 text-green-700',
  Rejected: 'bg-red-50 text-red-700',
}

function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] font-medium ${STATUS[status] ?? 'bg-gray-100 text-gray-500'}`}
      style={{ borderRadius: '3px', fontFamily: 'var(--font-league-spartan)' }}
    >
      {status}
    </span>
  )
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(adminApplications)

  const handle = (name: string, next: ApplicationStatus) => {
    setApps(prev => prev.map(a => a.name === name ? { ...a, status: next } : a))
  }

  const pending = apps.filter(a => a.status === 'Pending')
  const resolved = apps.filter(a => a.status !== 'Pending')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] mb-0.5" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
          Enunas Admin
        </p>
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontWeight: 500, color: '#0A0A0A' }}>
          Applications
        </h2>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b" style={{ borderColor: '#E8E8E8' }}>
            <p className="text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
              Awaiting Review — {pending.length}
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: '#E8E8E8' }}>
            {pending.map(a => (
              <div key={a.name} className="flex items-center justify-between px-5 py-4 hover:bg-[#F5F5F0]/50 transition-colors duration-150">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>{a.name}</p>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-[11px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>{a.category}</span>
                    <span className="text-[11px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>{a.followers} followers</span>
                    <span className="text-[11px]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>Submitted {a.submitted}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handle(a.name, 'Approved')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-colors duration-200 hover:opacity-80"
                    style={{ background: 'rgba(26,90,60,0.1)', color: '#1A5A3C', borderRadius: '3px', fontFamily: 'var(--font-league-spartan)' }}
                  >
                    <CheckCircle size={12} />
                    Approve
                  </button>
                  <button
                    onClick={() => handle(a.name, 'Rejected')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-colors duration-200 hover:opacity-80"
                    style={{ background: 'rgba(139,30,63,0.08)', color: '#8B1E3F', borderRadius: '3px', fontFamily: 'var(--font-league-spartan)' }}
                  >
                    <XCircle size={12} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <div className="bg-white px-5 py-10 text-center" style={{ borderLeft: '3px solid #1A5A3C' }}>
          <p className="text-sm" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>All applications have been reviewed.</p>
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div className="bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b" style={{ borderColor: '#E8E8E8' }}>
            <p className="text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>
              Reviewed
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: '#E8E8E8' }}>
            {resolved.map(a => (
              <div key={a.name} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>{a.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ fontFamily: 'var(--font-league-spartan)', color: '#6B6B6B' }}>{a.category} · {a.followers} followers</p>
                </div>
                <Badge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
