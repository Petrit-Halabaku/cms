import { FramedLightboxGallery } from "@/components/FramedLightboxGallery";
import type { Locale } from "@/lib/database.types";
import { listGalleryImages } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { storageUrl } from "@/lib/site";

/**
 * Home "Projects" band — photographs dropped into the `projects/` folder of the
 * `media` Storage bucket, shown in the shared framed grid. Clicking a frame opens
 * the full-screen lightbox (arrows / ←→ keys / Escape). Renders nothing until at
 * least one image is uploaded, so it self-manages without CMS wiring.
 */
export async function ProjectsShowcase({ locale }: { locale: Locale }) {
  const images = await listGalleryImages("projects");
  if (images.length === 0) return null;

  const dict = getDictionary(locale);

  return (
    <section className="border-y border-line bg-white py-10 sm:py-16" aria-label={dict.projects.heading}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">
          <span aria-hidden className="mt-2.5 block h-3.5 w-3.5 shrink-0 bg-brand-700 sm:mt-3.5" />
          <div>
            <h2 className="font-display text-3xl text-slate-900 sm:text-4xl">
              {dict.projects.heading}
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-slate-600">
              {dict.projects.subheading}
            </p>
          </div>
        </div>

        <FramedLightboxGallery
          variant="carousel"
          priorityFirst
          images={images.map((image) => ({
            src: storageUrl("media", image.path),
            alt: image.alt,
          }))}
        />
      </div>
    </section>
  );
}
