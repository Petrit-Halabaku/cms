import { ImageResponse } from "next/og";

import { OG_SIZE } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

/**
 * Generated Open Graph card (1200×630) — the branded default share image for
 * the home + text pages. Referenced by absolute URL from `generateMetadata`
 * via `ogImageUrl()`. Product/category pages override this with real photos.
 *
 * Self-contained: brand-gradient + text only, no external fonts or assets, so
 * it renders identically at build time and on-demand.
 */
export const runtime = "nodejs";

// Brand palette (mirrors globals.css @theme).
const NAVY = "#012653";
const BLUE = "#0040ff";
const SKY = "#8dd7f7";
const MIST = "#aecbff";

export function GET(request: Request): ImageResponse {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("t") || SITE_NAME).slice(0, 120);
  const subtitle = (searchParams.get("s") || "").slice(0, 160);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Wordmark with accent bar */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 60, height: 14, background: SKY, marginRight: 22 }} />
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 10 }}>
            {SITE_NAME.toUpperCase()}
          </div>
        </div>

        {/* Title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2 }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ marginTop: 26, fontSize: 32, lineHeight: 1.3, color: MIST }}>
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* Domain footer */}
        <div style={{ display: "flex", alignItems: "center", fontSize: 28, letterSpacing: 3, color: SKY }}>
          gergoci.eu
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      headers: {
        "cache-control": "public, immutable, no-transform, max-age=31536000",
      },
    },
  );
}
