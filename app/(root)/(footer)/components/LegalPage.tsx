'use client'

import React, { useState, useEffect } from 'react'

type ParaItem = string | string[]

export interface LegalSection {
  id: string
  num: string
  label: string
  title: string
  paras: ParaItem[]
}

export interface LegalContact {
  aside: string
  eyebrow: string
  heading: React.ReactNode
  email: string
  hours: string
}

export interface LegalPageProps {
  kicker: string
  title: React.ReactNode
  lede: string
  meta: string[]
  sections: LegalSection[]
  contact: LegalContact
}

export default function LegalPage({ kicker, title, lede, meta, sections, contact }: LegalPageProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    const sectionEls = sections
      .map(s => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: 0 }
    )

    sectionEls.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: 'var(--font-league-spartan)', color: '#0A0A0A' }}>

      {/* ── MASTHEAD ── */}
      <div className="px-6 sm:px-12 lg:px-[80px] pt-24 lg:pt-[96px]">
        <div style={{ borderTop: '2px solid #0A0A0A', paddingTop: 28 }}>
          <div className="flex justify-between items-baseline gap-4">
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#370E4D]" style={{ fontWeight: 500 }}>
              {kicker}
            </span>
            <span className="hidden sm:block text-[10px] uppercase tracking-[0.28em] text-[#6B6B6B]" style={{ fontWeight: 500 }}>
              Enunas UG — Berlin
            </span>
          </div>
        </div>

        <h1
          className="font-light m-0 leading-[0.94] tracking-[-0.01em]"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: 'clamp(52px, 8vw, 116px)', marginTop: 52, maxWidth: 1100 }}
        >
          {title}
        </h1>

        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6 lg:gap-16 pb-10 border-b border-[#DCDCD5]"
          style={{ marginTop: 44 }}
        >
          <p
            className="font-light italic leading-[1.45] text-[#2D2D2D] m-0"
            style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: 26, maxWidth: 700 }}
          >
            {lede}
          </p>
          <div className="lg:text-right">
            {meta.map((m, i) => (
              <p
                key={i}
                className="text-[10px] uppercase tracking-[0.28em] text-[#6B6B6B] m-0"
                style={{ fontWeight: 500, marginTop: i ? 10 : 0 }}
              >
                {m}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY: index + sections ── */}
      <div className="px-6 sm:px-12 lg:px-[80px] lg:grid" style={{ gridTemplateColumns: '300px 1fr' }}>

        {/* Sticky numbered index — desktop only */}
        <aside className="hidden lg:block" style={{ borderRight: '1px solid #DCDCD5' }}>
          <div className="sticky top-6" style={{ padding: '56px 40px 56px 0' }}>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#6B6B6B] m-0 mb-6" style={{ fontWeight: 500 }}>
              Inhalt
            </p>
            {sections.map((s) => {
              const active = activeId === s.id
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex gap-4 items-baseline no-underline transition-colors duration-200"
                  style={{
                    borderTop: '1px solid #DCDCD5',
                    padding: '13px 0 13px 14px',
                    marginLeft: -16,
                    borderLeft: active ? '2px solid #370E4D' : '2px solid transparent',
                  }}
                >
                  <span
                    className="text-[10px] tracking-[0.1em] flex-shrink-0"
                    style={{ fontWeight: 500, color: active ? '#370E4D' : '#6B6B6B', minWidth: 26 }}
                  >
                    {s.num}
                  </span>
                  <span
                    className="text-[12.5px] leading-[1.45] transition-all duration-200"
                    style={{ color: active ? '#0A0A0A' : '#4A4A4A', fontWeight: active ? 500 : 300 }}
                  >
                    {s.label}
                  </span>
                </a>
              )
            })}
            <div style={{ borderTop: '1px solid #DCDCD5', paddingTop: 28 }}>
              <p
                className="font-light italic text-[#6B6B6B] m-0 leading-[1.5]"
                style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: 18 }}
              >
                {contact.aside}
              </p>
            </div>
          </div>
        </aside>

        {/* Sections */}
        <main className="lg:pl-[80px]">
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              style={{ padding: '80px 0', borderBottom: '1px solid #DCDCD5' }}
            >
              <div className="flex items-center gap-5 mb-7">
                <span
                  className="font-normal flex-shrink-0"
                  style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: 22, color: '#370E4D', minWidth: 52, letterSpacing: '0.02em' }}
                >
                  {s.num}
                </span>
                <h2
                  className="font-light leading-[1.02] m-0 uppercase"
                  style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: 'clamp(24px, 2.5vw, 36px)', letterSpacing: '0.12em' }}
                >
                  {s.title}
                </h2>
              </div>

              <div className="flex flex-col lg:pl-[72px]" style={{ gap: 18, maxWidth: 780 }}>
                {s.paras.map((p, pi) =>
                  Array.isArray(p) ? (
                    <div key={pi}>
                      <p
                        className="text-[10px] uppercase tracking-[0.28em] text-[#0A0A0A] m-0 mb-2"
                        style={{ fontWeight: 500 }}
                      >
                        {p[0]}
                      </p>
                      {p.slice(1).map((line, li) => (
                        <p
                          key={li}
                          className="text-[15px] font-light leading-[1.8] text-[#3A3A3A] m-0"
                          style={{ marginTop: li ? 4 : 0 }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p key={pi} className="text-[15px] font-light leading-[1.8] text-[#3A3A3A] m-0">
                      {p}
                    </p>
                  )
                )}
              </div>
            </section>
          ))}
        </main>
      </div>

      {/* ── CONTACT CTA ── */}
      <section
        className="px-6 sm:px-12 lg:px-[80px] py-[72px] lg:py-[96px]"
        style={{ backgroundColor: '#F5F5F0', color: '#0A0A0A' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-20 items-center">
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.28em] m-0 mb-6 text-[#6B6B6B]"
              style={{ fontWeight: 500 }}
            >
              {contact.eyebrow}
            </p>
            <h2
              className="font-light leading-none m-0"
              style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: 'clamp(40px, 5vw, 68px)' }}
            >
              {contact.heading}
            </h2>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-[18px]">
            <a
              href={`mailto:${contact.email}`}
              className="font-light italic no-underline pb-1 transition-[border-color] duration-200"
              style={{
                fontFamily: 'var(--font-Cormorant-Garamond)',
                fontSize: 'clamp(20px, 2.5vw, 30px)',
                color: '#370E4D',
                borderBottom: '1px solid rgba(55,14,77,0.3)',
              }}
            >
              {contact.email}
            </a>
            <p
              className="text-[10px] uppercase tracking-[0.28em] m-0 text-[#6B6B6B]"
              style={{ fontWeight: 500 }}
            >
              {contact.hours}
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
