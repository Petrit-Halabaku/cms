/**
 * Generate the "What we offer" card background images (1280×960 webp) as
 * brand-styled technical illustrations — one per card subject. Pure local
 * output (no DB, no uploads): files land in media-import/cards-generated/.
 *
 *   node scripts/generate-offer-card-images.mjs
 *
 * Upload + wire them into the offer-grid section with
 * scripts/apply-offer-card-images.mjs (dry-run by default).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const OUT = join(process.cwd(), "media-import", "cards-generated");
const W = 1280;
const H = 960;

// GERGOCI palette (globals.css)
const NAVY_DEEP = "#01173a"; // brand-950
const NAVY = "#012653"; // brand-900
const BLUE = "#0040ff"; // brand-700
const BLUE_MID = "#1e54ff"; // brand-600
const SKY = "#8dd7f7"; // accent
const ICE = "#aecbff"; // brand-200
const ICE_LIGHT = "#cfe0ff"; // brand-100
const PAPER = "#eef3ff"; // brand-50

/** Shared canvas: navy gradient + faint drafting grid, subjects drawn on top. */
function canvas(body) {
  const gridLines = [];
  for (let x = 64; x < W; x += 64)
    gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`);
  for (let y = 64; y < H; y += 64)
    gridLines.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${NAVY_DEEP}"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${SKY}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${SKY}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g stroke="${SKY}" stroke-opacity="0.055" stroke-width="1">${gridLines.join("")}</g>
  ${body}
</svg>`;
}

// --- 1. Aluminium systems — multi-chamber profile cross-section ------------
function aluminiumSystems() {
  const hatch = (x, y, w, h, step = 18) => {
    const lines = [];
    for (let i = -h; i < w; i += step)
      lines.push(
        `<line x1="${x + Math.max(i, 0)}" y1="${y + Math.max(0, -i)}" x2="${x + Math.min(i + h, w)}" y2="${y + Math.min(h, w - i)}"/>`,
      );
    return `<g stroke="${SKY}" stroke-opacity="0.22" stroke-width="1.5" clip-path="none">${lines.join("")}</g>`;
  };
  const dimTick = (x, y, vertical) =>
    vertical
      ? `<line x1="${x - 10}" y1="${y}" x2="${x + 10}" y2="${y}"/>`
      : `<line x1="${x}" y1="${y - 10}" x2="${x}" y2="${y + 10}"/>`;
  return canvas(`
  <!-- faint echo profile -->
  <g transform="translate(96,-64)" stroke="${ICE}" stroke-opacity="0.10" fill="none" stroke-width="3">
    <rect x="290" y="200" width="700" height="430" rx="18"/>
    <line x1="290" y1="415" x2="990" y2="415"/>
    <line x1="470" y1="200" x2="470" y2="630"/>
    <line x1="810" y1="200" x2="810" y2="630"/>
  </g>
  <!-- main profile -->
  <rect x="290" y="200" width="700" height="430" rx="18" fill="${ICE}" fill-opacity="0.07" stroke="${ICE_LIGHT}" stroke-width="5"/>
  <line x1="470" y1="200" x2="470" y2="630" stroke="${ICE}" stroke-opacity="0.6" stroke-width="3"/>
  <line x1="810" y1="200" x2="810" y2="630" stroke="${ICE}" stroke-opacity="0.6" stroke-width="3"/>
  <line x1="290" y1="415" x2="990" y2="415" stroke="${ICE}" stroke-opacity="0.6" stroke-width="3"/>
  <!-- thermal break band -->
  <rect x="470" y="390" width="340" height="50" fill="${BLUE_MID}" fill-opacity="0.35" stroke="${BLUE_MID}" stroke-width="2" stroke-dasharray="10 6"/>
  <!-- chamber hatching -->
  ${hatch(300, 210, 160, 195)}
  ${hatch(820, 425, 160, 195)}
  <!-- gasket curves -->
  <path d="M 480 200 q 20 -26 40 0" fill="none" stroke="${SKY}" stroke-opacity="0.8" stroke-width="4"/>
  <path d="M 760 200 q 20 -26 40 0" fill="none" stroke="${SKY}" stroke-opacity="0.8" stroke-width="4"/>
  <!-- corner screw ports -->
  <g fill="none" stroke="${ICE_LIGHT}" stroke-opacity="0.8" stroke-width="3">
    <circle cx="330" cy="240" r="13"/><circle cx="950" cy="240" r="13"/>
    <circle cx="330" cy="590" r="13"/><circle cx="950" cy="590" r="13"/>
  </g>
  <!-- dimension lines -->
  <g stroke="${SKY}" stroke-opacity="0.65" stroke-width="2" fill="none">
    <line x1="290" y1="148" x2="990" y2="148"/>
    ${dimTick(290, 148, false)}${dimTick(990, 148, false)}
    <line x1="222" y1="200" x2="222" y2="630"/>
    ${dimTick(222, 200, true)}${dimTick(222, 630, true)}
  </g>
  <g stroke="${SKY}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="4 6">
    <line x1="290" y1="200" x2="290" y2="140"/>
    <line x1="990" y1="200" x2="990" y2="140"/>
    <line x1="290" y1="200" x2="214" y2="200"/>
    <line x1="290" y1="630" x2="214" y2="630"/>
  </g>`);
}

// --- 2. Glass solutions — overlapping panes with light streaks -------------
function glassSolutions() {
  const pane = (dx, dy, fillOp, strokeOp) => `
    <g transform="rotate(-8 640 430)">
      <rect x="${300 + dx}" y="${80 + dy}" width="520" height="640" rx="10"
        fill="${SKY}" fill-opacity="${fillOp}" stroke="#ffffff" stroke-opacity="${strokeOp}" stroke-width="2.5"/>
      <polygon points="${300 + dx},${80 + dy} ${300 + dx + 150},${80 + dy} ${300 + dx},${80 + dy + 150}"
        fill="#ffffff" opacity="${fillOp * 1.6}"/>
    </g>`;
  return canvas(`
  <!-- diagonal light bands -->
  <polygon points="180,0 420,0 -60,960 -300,960" fill="#ffffff" opacity="0.05"/>
  <polygon points="760,0 900,0 420,960 280,960" fill="#ffffff" opacity="0.08"/>
  ${pane(0, 0, 0.1, 0.3)}
  ${pane(150, 45, 0.16, 0.45)}
  ${pane(300, 90, 0.22, 0.6)}
  <!-- bright glass edge on the front pane -->
  <g transform="rotate(-8 640 430)">
    <line x1="1120" y1="170" x2="1120" y2="810" stroke="${SKY}" stroke-opacity="0.9" stroke-width="5"/>
  </g>
  <!-- bokeh accents -->
  <g fill="${SKY}">
    <circle cx="1075" cy="150" r="12" opacity="0.45"/>
    <circle cx="1150" cy="255" r="7" opacity="0.3"/>
    <circle cx="1010" cy="95" r="5" opacity="0.5"/>
    <circle cx="190" cy="640" r="9" opacity="0.25"/>
    <circle cx="130" cy="540" r="5" opacity="0.4"/>
  </g>`);
}

// --- 3. PVC windows & doors — mullion-cross window + door edge -------------
function pvcWindowsDoors() {
  return canvas(`
  <!-- door hinted at the right edge (cropped) -->
  <g stroke="${ICE}" stroke-opacity="0.35" fill="none" stroke-width="6">
    <rect x="1080" y="200" width="260" height="720" rx="8"/>
    <rect x="1120" y="240" width="180" height="300" rx="4"/>
    <rect x="1120" y="580" width="180" height="300" rx="4"/>
  </g>
  <circle cx="1102" cy="560" r="9" fill="${ICE}" fill-opacity="0.5"/>
  <!-- window frame -->
  <rect x="330" y="130" width="620" height="620" rx="6" fill="none" stroke="${PAPER}" stroke-width="16"/>
  <rect x="366" y="166" width="548" height="548" rx="3" fill="${SKY}" fill-opacity="0.07" stroke="${ICE_LIGHT}" stroke-opacity="0.7" stroke-width="5"/>
  <!-- mullion cross (site hover motif) -->
  <rect x="632" y="166" width="16" height="548" fill="${PAPER}"/>
  <rect x="366" y="432" width="548" height="16" fill="${PAPER}"/>
  <!-- glass reflections -->
  <g stroke="#ffffff" stroke-opacity="0.14" stroke-width="9">
    <line x1="420" y1="400" x2="600" y2="200"/>
    <line x1="450" y1="410" x2="610" y2="235"/>
    <line x1="410" y1="690" x2="590" y2="490"/>
    <line x1="690" y1="690" x2="870" y2="490"/>
  </g>
  <!-- ajar sash, swung out of the top-right quadrant -->
  <polygon points="656,180 950,148 950,420 656,424" fill="${ICE_LIGHT}" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.55" stroke-width="3.5"/>
  <line x1="656" y1="180" x2="656" y2="424" stroke="${BLUE_MID}" stroke-opacity="0.9" stroke-width="5"/>
  <line x1="700" y1="196" x2="906" y2="176" stroke="#ffffff" stroke-opacity="0.2" stroke-width="6"/>
  <!-- handle -->
  <rect x="654" y="466" width="12" height="56" rx="6" fill="${PAPER}"/>
  <!-- sill shadow -->
  <ellipse cx="640" cy="770" rx="330" ry="16" fill="#000000" opacity="0.18"/>`);
}

// --- 4. Blinds & roller shutters — slats with light bleeding through -------
function blindsRollerShutters() {
  const slats = [];
  const x = 240;
  const w = 800;
  let y = 236;
  for (let i = 0; i < 9; i++) {
    const op = 0.3 - i * 0.02;
    slats.push(
      `<rect x="${x}" y="${y}" width="${w}" height="42" rx="8" fill="${ICE}" fill-opacity="${op.toFixed(2)}" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1.5"/>`,
      `<line x1="${x + 14}" y1="${y + 54}" x2="${x + w - 14}" y2="${y + 54}" stroke="${SKY}" stroke-opacity="0.4" stroke-width="3"/>`,
    );
    y += 54;
  }
  return canvas(`
  <!-- guide rails -->
  <line x1="240" y1="210" x2="240" y2="880" stroke="${ICE}" stroke-opacity="0.3" stroke-width="7"/>
  <line x1="1040" y1="210" x2="1040" y2="880" stroke="${ICE}" stroke-opacity="0.3" stroke-width="7"/>
  <!-- housing -->
  <rect x="228" y="118" width="824" height="92" rx="26" fill="${ICE}" fill-opacity="0.15" stroke="${ICE_LIGHT}" stroke-width="4"/>
  <circle cx="286" cy="164" r="22" fill="none" stroke="${ICE_LIGHT}" stroke-opacity="0.7" stroke-width="3.5"/>
  <circle cx="994" cy="164" r="22" fill="none" stroke="${ICE_LIGHT}" stroke-opacity="0.7" stroke-width="3.5"/>
  ${slats.join("\n  ")}
  <!-- light flooding in under the half-open curtain -->
  <rect x="248" y="726" width="784" height="150" fill="url(#glow)"/>
  <polygon points="340,726 470,726 300,960 170,960" fill="${SKY}" opacity="0.10"/>
  <polygon points="640,726 760,726 700,960 580,960" fill="${SKY}" opacity="0.08"/>
  <!-- bottom bar + pull -->
  <rect x="240" y="712" width="800" height="16" rx="8" fill="${ICE_LIGHT}" fill-opacity="0.8"/>
  <line x1="1078" y1="210" x2="1078" y2="470" stroke="${SKY}" stroke-opacity="0.6" stroke-width="2.5"/>
  <circle cx="1078" cy="486" r="10" fill="${SKY}" fill-opacity="0.7"/>`);
}

const CARDS = [
  { file: "gen-aluminium", svg: aluminiumSystems() },
  { file: "gen-glass-solutions", svg: glassSolutions() },
  { file: "gen-pvc-windows-doors", svg: pvcWindowsDoors() },
  { file: "gen-blinds-roller-shutters", svg: blindsRollerShutters() },
];

mkdirSync(OUT, { recursive: true });
for (const card of CARDS) {
  const webp = await sharp(Buffer.from(card.svg)).webp({ quality: 88 }).toBuffer();
  writeFileSync(join(OUT, `${card.file}.webp`), webp);
  writeFileSync(join(OUT, `${card.file}.svg`), card.svg); // source, for tweaks
  console.log(`✓ ${card.file}.webp (${(webp.length / 1024).toFixed(0)} KB)`);
}
console.log(`\nOutput: ${OUT}`);
