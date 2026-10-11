/**
 * Services page content. Bespoke (not CMS-driven) for now — replace this object
 * with the real data when the `services` source is provided. Image `path`s are
 * keys inside the Supabase `media` bucket (resolved via storageUrl in the view).
 */

export type ServiceImage = {
  /** Path within the `media` storage bucket, e.g. "services/foo.webp". */
  path: string;
  alt: string;
};

export type ServiceSection = {
  id: string;
  heading: string;
  /** Lead line under the heading. */
  subheading: string;
  /** Optional supporting paragraph. */
  body: string;
  image: ServiceImage;
  /** Services included — rendered as a checklist (not a numbered sequence). */
  items: string[];
};

export type ServiceFeatureCard = {
  title: string;
  image: ServiceImage;
};

export type ServicesContent = {
  hero: {
    breadcrumb: string;
    title: string;
    subtitle: string;
    /** Glazing systems offered, shown as a divided spec strip. */
    categories: string[];
  };
  sections: ServiceSection[];
  featureCards: {
    heading: string;
    cards: ServiceFeatureCard[];
  };
};

export const servicesContent: ServicesContent = {
  hero: {
    breadcrumb: "Home",
    title: "Our Services",
    subtitle: "Your Comfort is Our #1 Priority",
    categories: ["Window System", "Door System", "Glass Fence", "Blinds"],
  },
  sections: [
    {
      id: "window-door-installation",
      heading: "Window & Door Installation",
      subheading:
        "Here's a list of our window and door replacement and installation services.",
      body: "Improve the efficiency of your home by replacing your old windows. We offer install, replacement and repair services for all types of windows and doors.",
      image: {
        path: "services/window-door-installation.webp",
        alt: "Worker installing and adjusting plastic window frames in a living room",
      },
      items: [
        "Servicing for windows and door repairs",
        "Installation of new and advanced locking systems",
        "Glass door and sliding-door repair, wheels and tracks",
        "Replacing or repairing chain winders, ropes, springs and window locks",
      ],
    },
    {
      id: "window-door-maintenance",
      heading: "Window & Door Maintenance",
      subheading: "Our door and window installation service includes:",
      body: "",
      image: {
        path: "services/window-door-maintenance.webp",
        alt: "Worker installing a new plastic PVC window using a screwdriver",
      },
      items: [
        "Double-glazing repairs and glass repair",
        "Repair of door and window handles",
        "Fitting of aluminium or PVC window frames",
      ],
    },
    {
      id: "adjusting-leveling",
      heading: "Adjusting & Leveling",
      subheading:
        "The main reasons for getting your entry door and window replaced.",
      body: "",
      image: {
        path: "services/adjusting-leveling.webp",
        alt: "Workman adjusting plastic window frames at home",
      },
      items: [
        "Utility savings up to 25%",
        "Reducing noise pollution",
        "Durability of frames and improved aesthetics",
        "Easy cleaning and maintenance of windows",
        "UV protection and higher home resale value",
      ],
    },
    {
      id: "measuring-cutting",
      heading: "Measuring & Cutting",
      subheading: "",
      body: "We work fast and efficiently, never motivated to take a little longer just to kick up our earnings.",
      image: {
        path: "services/measuring-cutting.webp",
        alt: "Precise measuring and cutting of a window profile",
      },
      items: [
        "Horizontal measurement of the frame for the rough opening width",
        "Vertical measurement of the frame for the rough opening height",
        "Depth measurement of the window's opening",
      ],
    },
  ],
  featureCards: {
    heading: "Customer Service is Our #1 Priority",
    cards: [
      {
        title: "Installation",
        image: {
          path: "services/card-installation.webp",
          alt: "Professional construction worker performing a window replacement",
        },
      },
      {
        title: "Adjusting",
        image: {
          path: "services/card-adjusting.webp",
          alt: "Adjusting the hardware of a uPVC door mechanism with an allen key",
        },
      },
      {
        title: "Service & Repair",
        image: {
          path: "services/card-service-repair.webp",
          alt: "Technician installing a window the right way",
        },
      },
    ],
  },
};
