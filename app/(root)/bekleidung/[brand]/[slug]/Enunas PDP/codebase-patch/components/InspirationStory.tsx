interface InspirationStoryProps {
  text: string | null;
}

/**
 * Editorial italic pull-quote with a left purple accent bar.
 * Hidden when null.
 */
export default function InspirationStory({ text }: InspirationStoryProps) {
  if (!text) return null;
  return (
    <div className="max-w-[360px] py-3.5 pl-[18px] mb-[26px] text-left border-l-2 border-enunas-purple">
      <span className="block font-league-spartan text-[9px] tracking-[0.25em] uppercase text-enunas-purple mb-1.5">
        Inspiration
      </span>
      <p className="font-cormorant italic text-base leading-[1.45] text-enunas-gray-dark m-0">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}
