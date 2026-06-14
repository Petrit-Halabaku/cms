import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

type Props = {
  /** Small uppercase label above the title, e.g. the nav section name. */
  kicker?: string;
  title: string;
  intro?: string;
};

/** Shared inner-page header: kicker, oversized split title, mullion lines. */
export function PageHero({ kicker, title, intro }: Props) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-paper">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-0 left-1/4 h-full w-px bg-line/70" />
        <span className="absolute top-0 left-2/4 h-full w-px bg-line/70" />
        <span className="absolute top-0 left-3/4 h-full w-px bg-line/70" />
        <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(219,230,246,0.7),transparent)]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {kicker && (
          <Reveal y={12}>
            <p className="kicker">{kicker}</p>
          </Reveal>
        )}
        <SplitHeading
          as="h1"
          text={title}
          onScroll={false}
          delay={0.1}
          className="mt-5 max-w-4xl font-display text-4xl leading-[0.95] text-slate-900 sm:text-6xl"
        />
        {intro && (
          <Reveal delay={0.4} y={18}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">{intro}</p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
