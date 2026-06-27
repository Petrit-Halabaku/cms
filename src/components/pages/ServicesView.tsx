import { Check } from "lucide-react";

import {
  EditorialContainer,
  EditorialHero,
  FeatureCard,
  FramedPhoto,
  PaneHeading,
} from "@/components/pages/editorial";
import { Reveal } from "@/components/motion/Reveal";
import type { Locale } from "@/lib/database.types";
import { servicesContent, type ServiceSection } from "@/data/services";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";

/** Bespoke services page built on the shared editorial system. */
export function ServicesView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const basePath = basePathFor(locale);
  const { hero, sections, featureCards } = servicesContent;

  return (
    <>
      <EditorialHero
        breadcrumbLabel={dict.nav.home}
        breadcrumbHref={basePath || "/"}
        title={hero.title}
        subtitle={dict.footer.tagline}
        image={{ path: "services/services.webp", alt: hero.title }}
        specs={hero.categories.map((label) => ({ label }))}
      />

      {sections.map((section, i) => (
        <ServiceBlock key={section.id} section={section} index={i} flip={i % 2 === 1} />
      ))}

      <section className="bg-brand-950 py-16 text-white sm:py-24">
        <EditorialContainer>
          <Reveal>
            <PaneHeading text={featureCards.heading} split accent light />
          </Reveal>
          <Reveal stagger={0.1} className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {featureCards.cards.map((card) => (
              <FeatureCard key={card.title} title={card.title} image={card.image} />
            ))}
          </Reveal>
        </EditorialContainer>
      </section>
    </>
  );
}

function ServiceBlock({
  section,
  index,
  flip,
}: {
  section: ServiceSection;
  index: number;
  flip: boolean;
}) {
  return (
    <section className="border-b border-line py-14 sm:py-20">
      <EditorialContainer className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className={flip ? "lg:order-2" : ""}>
          <FramedPhoto image={section.image} index={index} />
        </Reveal>

        <Reveal y={20} delay={0.1} className={flip ? "lg:order-1" : ""}>
          <PaneHeading text={section.heading} />

          {section.subheading && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed font-medium text-slate-800">
              {section.subheading}
            </p>
          )}
          {section.body && (
            <p className="mt-4 max-w-xl leading-relaxed text-slate-600">{section.body}</p>
          )}

          <ul className="mt-7 space-y-px border-t border-line">
            {section.items.map((item) => (
              <li
                key={item}
                className="group flex items-start gap-4 border-b border-line py-3.5 transition-colors hover:bg-brand-50/50"
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="text-sm leading-snug text-slate-700 sm:text-base">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </EditorialContainer>
    </section>
  );
}
