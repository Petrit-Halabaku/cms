import { AboutGallery } from "@/components/pages/AboutGallery";
import { AdvantageTabs } from "@/components/pages/AdvantageTabs";
import {
  EditorialContainer,
  EditorialHero,
  FramedPhoto,
  PaneHeading,
} from "@/components/pages/editorial";
import { Odometer } from "@/components/motion/Odometer";
import { Reveal } from "@/components/motion/Reveal";
import type { Locale } from "@/lib/database.types";
import { aboutContent } from "@/data/about";
import { listGalleryImages } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";

/** Bespoke about page built on the shared editorial system. */
export async function AboutView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const basePath = basePathFor(locale);
  const { hero, experience, intro, stats, advantage } = aboutContent;
  const gallery = await listGalleryImages("about-us/gallery");

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
      <section className="border-b border-line py-10 sm:py-20">
        <EditorialContainer className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <Reveal y={20} className="lg:col-span-6">
            <p className="kicker">Experience</p>
            <p className="mt-5 font-display text-2xl leading-snug text-slate-900 sm:mt-6 sm:text-3xl lg:text-[2.5rem] lg:leading-[1.1]">
              {experience.heading}
            </p>
          </Reveal>
          <Reveal stagger={0.1} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6 lg:gap-5">
            {experience.images.map((image) => (
              <FramedPhoto
                key={image.path}
                image={image}
                aspect="portrait"
                aspectClassName="aspect-[4/3] sm:aspect-[3/4]"
              />
            ))}
          </Reveal>
        </EditorialContainer>
      </section>

      {/* Company intro */}
      <section className="border-b border-line py-10 sm:py-20">
        <EditorialContainer className="grid gap-x-16 gap-y-6 lg:grid-cols-12">
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

      {/* Stats — rolling odometers framed like glazing */}
      <section className="bg-brand-950 py-12 text-white sm:py-24">
        <EditorialContainer>
          <Reveal y={12} className="flex items-center gap-3">
            <span aria-hidden className="block h-2.5 w-2.5 shrink-0 bg-accent" />
            <p className="kicker text-accent">By the numbers</p>
          </Reveal>

          <Reveal
            stagger={0.14}
            className="mt-10 grid grid-cols-3 gap-px overflow-hidden border border-white/12 bg-white/12"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="relative bg-brand-950 px-3 py-6 sm:px-8 sm:py-12">
                {/* Sightline tick rule — the editorial system's measurement motif. */}
                <div aria-hidden className="flex items-end gap-1.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span
                      key={i}
                      className="block w-px bg-white/30"
                      style={{ height: i % 3 === 0 ? "0.7rem" : "0.4rem" }}
                    />
                  ))}
                </div>

                <div className="relative mt-4 sm:mt-7">
                  <Odometer
                    value={stat.value}
                    suffix={stat.suffix}
                    className="font-display text-3xl leading-none text-white sm:text-7xl"
                  />
                </div>

                <span className="mt-3 block text-[0.65rem] font-medium tracking-[0.12em] text-white/60 uppercase sm:mt-6 sm:text-sm sm:tracking-[0.18em]">
                  {stat.label}
                </span>
              </div>
            ))}
          </Reveal>
        </EditorialContainer>
      </section>

      {/* Advantage */}
      <section className="py-10 sm:py-20">
        <EditorialContainer>
          <Reveal>
            <PaneHeading text={advantage.heading} className="max-w-3xl" />
          </Reveal>
          <AdvantageTabs tabs={advantage.tabs} />

          {/* Gallery — framed like windows, click to open the lightbox */}
          {gallery.length > 0 && (
            <div className="mt-16 border-t border-line pt-14 sm:mt-20 sm:pt-16">
              <Reveal y={12} className="flex items-center gap-3">
                <span aria-hidden className="block h-2.5 w-2.5 shrink-0 bg-brand-700" />
                <p className="kicker">Gallery</p>
              </Reveal>
              <AboutGallery images={gallery} />
            </div>
          )}
        </EditorialContainer>
      </section>
    </>
  );
}
