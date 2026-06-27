import { AdvantageTabs } from "@/components/pages/AdvantageTabs";
import {
  EditorialContainer,
  EditorialHero,
  FramedPhoto,
  PaneHeading,
} from "@/components/pages/editorial";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import type { Locale } from "@/lib/database.types";
import { aboutContent } from "@/data/about";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";

/** Bespoke about page built on the shared editorial system. */
export function AboutView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const basePath = basePathFor(locale);
  const { hero, experience, intro, stats, advantage } = aboutContent;

  return (
    <>
      <EditorialHero
        breadcrumbLabel={dict.nav.home}
        breadcrumbHref={basePath || "/"}
        title={hero.title}
        subtitle={dict.footer.tagline}
        image={hero.image}
        specs={[]}
      />

      {/* Experience statement */}
      <section className="border-b border-line py-14 sm:py-20">
        <EditorialContainer className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal y={20} className="lg:col-span-6">
            <p className="kicker">Experience</p>
            <p className="mt-6 font-display text-2xl leading-snug text-slate-900 sm:text-3xl lg:text-[2.5rem] lg:leading-[1.1]">
              {experience.heading}
            </p>
          </Reveal>
          <Reveal stagger={0.1} className="grid grid-cols-2 gap-4 lg:col-span-6 lg:gap-5">
            {experience.images.map((image) => (
              <FramedPhoto key={image.path} image={image} aspect="portrait" />
            ))}
          </Reveal>
        </EditorialContainer>
      </section>

      {/* Company intro */}
      <section className="border-b border-line py-14 sm:py-20">
        <EditorialContainer className="grid gap-x-16 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <PaneHeading text={intro.heading} />
            </div>
          </div>
          <Reveal y={18} className="space-y-5 lg:col-span-8">
            {intro.paragraphs.map((paragraph, i) =>
              i === 0 ? (
                <p
                  key={i}
                  className="border-l-2 border-brand-700 pl-5 font-display text-xl leading-snug text-slate-900 sm:pl-6 sm:text-2xl"
                >
                  {paragraph}
                </p>
              ) : (
                <p key={i} className="max-w-2xl leading-relaxed text-slate-600">
                  {paragraph}
                </p>
              ),
            )}
          </Reveal>
        </EditorialContainer>
      </section>

      {/* Stats */}
      <section className="bg-brand-950 py-14 text-white sm:py-20">
        <EditorialContainer>
          <Reveal stagger={0.12} className="grid grid-cols-1 border-t border-white/15 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`py-8 sm:py-10 ${i !== 0 ? "border-t border-white/15 sm:border-t-0 sm:border-l sm:pl-10" : ""}`}
              >
                <CountUp
                  value={stat.value}
                  className="block font-display text-5xl text-white sm:text-6xl"
                />
                <span className="mt-3 block text-sm tracking-wide text-white/70 uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </Reveal>
        </EditorialContainer>
      </section>

      {/* Advantage */}
      <section className="py-14 sm:py-20">
        <EditorialContainer>
          <Reveal>
            <PaneHeading text={advantage.heading} className="max-w-3xl" />
          </Reveal>
          <AdvantageTabs tabs={advantage.tabs} />
        </EditorialContainer>
      </section>
    </>
  );
}
