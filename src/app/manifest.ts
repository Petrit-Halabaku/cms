import type { MetadataRoute } from "next";

import { SITE_NAME } from "@/lib/site";

/** PWA / web app manifest — adds <link rel="manifest"> and theme metadata. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Windows, Doors & Glass Systems`,
    short_name: SITE_NAME,
    description: "Windows, doors & glass systems in Pejë, Kosovo.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafbfd",
    theme_color: "#012653",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
