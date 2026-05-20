import Link from 'next/link';

export default function SizeGuideRow() {
  return (
    <div className="flex justify-between items-baseline w-full max-w-[460px] mb-[18px]">
      <Link
        href="/info/groessentabelle"
        className="
          font-league-spartan text-[12px] tracking-[0.08em]
          text-enunas-black
          border-b border-enunas-black
          pb-0.5
          transition-colors duration-200
          hover:text-enunas-purple hover:border-enunas-purple
        "
      >
        Größentabelle
      </Link>
      <Link
        href="/info/passform-finden"
        className="
          font-league-spartan text-[12px] tracking-[0.08em]
          text-enunas-black
          border-b border-enunas-black
          pb-0.5
          transition-colors duration-200
          hover:text-enunas-purple hover:border-enunas-purple
        "
      >
        Passform entdecken
      </Link>
    </div>
  );
}
