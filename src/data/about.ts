/**
 * About page content. Bespoke (not CMS-driven) for now — replace this object
 * with the real data when the `about` source is provided. Image `path`s are
 * keys inside the Supabase `media` bucket (resolved via storageUrl in the view).
 */

export type AboutImage = { path: string; alt: string };

export type AdvantagePanel = {
  image: AboutImage;
  heading: string;
  body: string;
  link: { label: string; href: string };
};

export type AboutContent = {
  hero: {
    breadcrumb: string;
    title: string;
    image: AboutImage;
  };
  experience: {
    heading: string;
    images: AboutImage[];
  };
  intro: {
    heading: string;
    paragraphs: string[];
  };
  stats: { value: string; label: string }[];
  advantage: {
    heading: string;
    tabs: { label: string; panel: AdvantagePanel }[];
  };
};

const ADVANTAGE_IMAGE: AboutImage = {
  path: "about-us/advantage-superior-values.webp",
  alt: "Corridor with glass windows and a doorway at the end of an office interior",
};

export const aboutContent: AboutContent = {
  hero: {
    breadcrumb: "Home",
    title: "About Us",
    image: {
      path: "about-us/about.webp",
      alt: "Daylit interior corridor framed by a full-height glazed wall",
    },
  },

  experience: {
    heading:
      "Over 22 years of experience makes us stronger and more capable in recognizing what our customers need.",
    images: [
      {
        path: "about-us/experience-living-area.webp",
        alt: "Beautiful living area with a glass staircase and soft furnishings in a new family home",
      },
      {
        path: "about-us/experience-project.webp",
        alt: "Completed GERGOCI glazing project",
      },
    ],
  },

  intro: {
    heading: "Gergoci company",
    paragraphs: [
      "Gergoci is one of the first companies of its kind in our country, active since 2000 and constantly committed to quality. With our products we have built our own market and a base of satisfied clients.",
      "Primary for us is the quality of every product we offer.",
      "In the beginning we worked only in our country; then, thanks to tireless work and full dedication, we managed to reach markets abroad.",
      "The 22 years of experience behind our company makes us stronger and more capable in recognizing customer requirements and delivering products made to the highest quality in the market.",
    ],
  },

  stats: [
    { value: "22", label: "Years experience" },
    { value: "1200", label: "Projects completed" },
    { value: "1000+", label: "Satisfied customers" },
  ],

  advantage: {
    heading: "The advantage of Gergoci is its commitment to the quality of its products.",
    tabs: [
      {
        label: "Superior values",
        panel: {
          image: ADVANTAGE_IMAGE,
          heading: "Superior values, superior products",
          body: "A company cannot succeed if the work is not well organised. It takes management that sets the right values for the team and the way the work is run — that discipline is what shows up in the product.",
          link: { label: "View project", href: "#" },
        },
      },
      // NOTE: the panels below use placeholder copy — only "Superior values"
      // was provided. Replace the body text (and images, if desired) later.
      {
        label: "Worthy products",
        panel: {
          image: ADVANTAGE_IMAGE,
          heading: "Worthy products",
          body: "Every system we supply is chosen on merit — proven hardware, certified glazing and profiles built to last.",
          link: { label: "View project", href: "#" },
        },
      },
      {
        label: "An exceptional calibre",
        panel: {
          image: ADVANTAGE_IMAGE,
          heading: "An exceptional calibre",
          body: "Fabrication and fitting are held to the manufacturer's standard, measured and checked at every step.",
          link: { label: "View project", href: "#" },
        },
      },
      {
        label: "The pledge of quality",
        panel: {
          image: ADVANTAGE_IMAGE,
          heading: "The pledge of quality",
          body: "From the first survey to the final handover, we stand behind the work — and behind the people who deliver it.",
          link: { label: "View project", href: "#" },
        },
      },
    ],
  },
};
