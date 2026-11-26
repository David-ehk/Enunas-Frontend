import Link from 'next/link'

export default function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-block overflow-hidden bg-enunas-purple text-white px-12 py-5 hover:bg-enunas-purple-dark transition-colors duration-300 ease-out-expo"
    >
      <span className="absolute left-1/2 -translate-x-1/2 top-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
      <span className="relative z-10 font-cormorant text-[18px] tracking-[0.06em]">{children}</span>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[14%] w-full h-[1px] bg-white/60 transition-all duration-500 ease-out group-hover:w-[70%]" />
    </Link>
  )
}
