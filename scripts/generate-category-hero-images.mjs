/**
 * Generate the 7 category hero images (1920×1280 webp) as brand-styled
 * technical illustrations, one per product category. Output lands in
 * media-import/_hero/categories/<key>.webp — exactly the layout
 * scripts/ingest-hero.mjs uploads from (dry-run by default there).
 *
 *   node scripts/generate-category-hero-images.mjs
 *
 * Compositions sit in the upper two-thirds: HeroBackdrop crops with
 * object-top and layers a navy scrim that is darkest at the bottom.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const OUT = join(process.cwd(), "media-import", "_hero", "categories");
const W = 1920;
const H = 1280;

// GERGOCI palette (globals.css)
const NAVY_DEEP = "#01173a";
const NAVY = "#012653";
const BLUE_MID = "#1e54ff";
const SKY = "#8dd7f7";
const ICE = "#aecbff";
const ICE_LIGHT = "#cfe0ff";
const PAPER = "#eef3ff";

function canvas(body) {
  const grid = [];
  for (let x = 80; x < W; x += 80) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`);
  for (let y = 80; y < H; y += 80) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${NAVY_DEEP}"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${SKY}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${SKY}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g stroke="${SKY}" stroke-opacity="0.05" stroke-width="1">${grid.join("")}</g>
  ${body}
</svg>`;
}

// --- windows: elevation triptych, centre window ajar ------------------------
function windows() {
  const win = (x, cross) => `
    <rect x="${x}" y="200" width="400" height="560" rx="4" fill="none" stroke="${PAPER}" stroke-width="12"/>
    <rect x="${x + 26}" y="226" width="348" height="508" rx="2" fill="${SKY}" fill-opacity="0.07" stroke="${ICE_LIGHT}" stroke-opacity="0.7" stroke-width="4"/>
    ${
      cross
        ? `<rect x="${x + 194}" y="226" width="12" height="508" fill="${PAPER}"/>
           <rect x="${x + 26}" y="474" width="348" height="12" fill="${PAPER}"/>
           <polygon points="${x + 212},234 ${x + 398},214 ${x + 398},462 ${x + 212},466" fill="${ICE_LIGHT}" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.55" stroke-width="3"/>
           <line x1="${x + 212}" y1="234" x2="${x + 212}" y2="466" stroke="${BLUE_MID}" stroke-opacity="0.9" stroke-width="4"/>`
        : `<line x1="${x + 70}" y1="600" x2="${x + 300}" y2="300" stroke="#ffffff" stroke-opacity="0.13" stroke-width="8"/>
           <line x1="${x + 100}" y1="620" x2="${x + 320}" y2="340" stroke="#ffffff" stroke-opacity="0.08" stroke-width="6"/>`
    }`;
  return canvas(`
  ${win(320, false)}
  ${win(800, true)}
  ${win(1280, false)}
  <line x1="240" y1="800" x2="1760" y2="800" stroke="${ICE}" stroke-opacity="0.5" stroke-width="6"/>
  <line x1="240" y1="818" x2="1760" y2="818" stroke="${ICE}" stroke-opacity="0.2" stroke-width="3"/>`);
}

// --- doors: double entrance, right leaf swung open --------------------------
function doors() {
  return canvas(`
  <!-- frame -->
  <rect x="740" y="160" width="700" height="760" rx="4" fill="none" stroke="${PAPER}" stroke-width="14"/>
  <!-- closed left leaf -->
  <rect x="780" y="200" width="300" height="680" rx="2" fill="${ICE}" fill-opacity="0.08" stroke="${ICE_LIGHT}" stroke-opacity="0.8" stroke-width="5"/>
  <rect x="820" y="250" width="220" height="260" rx="2" fill="${SKY}" fill-opacity="0.08" stroke="${ICE}" stroke-opacity="0.5" stroke-width="3"/>
  <rect x="820" y="560" width="220" height="260" rx="2" fill="none" stroke="${ICE}" stroke-opacity="0.5" stroke-width="3"/>
  <rect x="1052" y="500" width="12" height="90" rx="6" fill="${PAPER}"/>
  <!-- open right leaf (hinged on the right jamb) -->
  <polygon points="1400,200 1130,140 1130,940 1400,880" fill="${ICE_LIGHT}" fill-opacity="0.13" stroke="#ffffff" stroke-opacity="0.6" stroke-width="4"/>
  <line x1="1400" y1="200" x2="1400" y2="880" stroke="${BLUE_MID}" stroke-opacity="0.9" stroke-width="5"/>
  <line x1="1170" y1="200" x2="1170" y2="890" stroke="#ffffff" stroke-opacity="0.2" stroke-width="5"/>
  <rect x="1146" y="500" width="12" height="96" rx="6" fill="${PAPER}"/>
  <!-- floor swing arc -->
  <path d="M 1130 940 A 300 60 0 0 0 1400 990" fill="none" stroke="${SKY}" stroke-opacity="0.5" stroke-width="3" stroke-dasharray="10 8"/>
  <line x1="700" y1="990" x2="1480" y2="990" stroke="${ICE}" stroke-opacity="0.4" stroke-width="5"/>
  <!-- dimension line, quiet left -->
  <g stroke="${SKY}" stroke-opacity="0.5" stroke-width="2">
    <line x1="640" y1="160" x2="640" y2="920"/>
    <line x1="630" y1="160" x2="650" y2="160"/>
    <line x1="630" y1="920" x2="650" y2="920"/>
  </g>`);
}

// --- sliding systems: panel mid-slide on tracks -----------------------------
function slidingSystems() {
  return canvas(`
  <!-- tracks -->
  <g stroke="${ICE}" stroke-opacity="0.55" stroke-width="7">
    <line x1="200" y1="250" x2="1720" y2="250"/>
    <line x1="200" y1="900" x2="1720" y2="900"/>
  </g>
  <g stroke="${ICE}" stroke-opacity="0.25" stroke-width="3">
    <line x1="200" y1="268" x2="1720" y2="268"/>
    <line x1="200" y1="882" x2="1720" y2="882"/>
  </g>
  <!-- rear panel -->
  <rect x="330" y="286" width="580" height="580" fill="${SKY}" fill-opacity="0.06" stroke="${ICE}" stroke-opacity="0.55" stroke-width="6"/>
  <line x1="420" y1="760" x2="700" y2="400" stroke="#ffffff" stroke-opacity="0.09" stroke-width="8"/>
  <!-- front panel, mid-slide -->
  <rect x="800" y="296" width="660" height="560" fill="${SKY}" fill-opacity="0.13" stroke="${PAPER}" stroke-width="9"/>
  <line x1="900" y1="740" x2="1240" y2="380" stroke="#ffffff" stroke-opacity="0.15" stroke-width="9"/>
  <rect x="822" y="540" width="14" height="80" rx="7" fill="${PAPER}"/>
  <!-- motion ghosts -->
  <g stroke="${ICE_LIGHT}">
    <line x1="762" y1="310" x2="762" y2="842" stroke-opacity="0.35" stroke-width="5"/>
    <line x1="726" y1="322" x2="726" y2="830" stroke-opacity="0.2" stroke-width="4"/>
    <line x1="694" y1="334" x2="694" y2="818" stroke-opacity="0.1" stroke-width="3"/>
  </g>
  <!-- direction chevrons -->
  <g fill="none" stroke="${SKY}" stroke-opacity="0.8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="1530,540 1580,576 1530,612"/>
    <polyline points="1590,540 1640,576 1590,612"/>
  </g>
  <!-- rollers -->
  <circle cx="870" cy="880" r="14" fill="none" stroke="${ICE_LIGHT}" stroke-opacity="0.8" stroke-width="4"/>
  <circle cx="1390" cy="880" r="14" fill="none" stroke="${ICE_LIGHT}" stroke-opacity="0.8" stroke-width="4"/>`);
}

// --- facades: curtain wall receding right ------------------------------------
function facades() {
  const x0 = 280, x1 = 1620;
  const topAt = (x) => 140 + ((x - x0) / (x1 - x0)) * (400 - 140);
  const botAt = (x) => 1080 + ((x - x0) / (x1 - x0)) * (830 - 1080);
  const cols = 9;
  const xs = [];
  for (let i = 0; i <= cols; i++) {
    const u = i / cols;
    xs.push(x0 + (x1 - x0) * (1 - Math.pow(1 - u, 1.7)));
  }
  const verts = xs
    .map(
      (x, i) =>
        `<line x1="${x.toFixed(1)}" y1="${topAt(x).toFixed(1)}" x2="${x.toFixed(1)}" y2="${botAt(x).toFixed(1)}" stroke="${ICE}" stroke-opacity="${i === 0 ? 0.85 : 0.5}" stroke-width="${i === 0 ? 7 : 4}"/>`,
    )
    .join("");
  const rows = 5;
  const rails = [];
  for (let j = 0; j <= rows; j++) {
    const v = j / rows;
    const yL = 140 + (1080 - 140) * v;
    const yR = 400 + (830 - 400) * v;
    rails.push(
      `<line x1="${x0}" y1="${yL.toFixed(1)}" x2="${x1}" y2="${yR.toFixed(1)}" stroke="${ICE}" stroke-opacity="${j === 0 || j === rows ? 0.8 : 0.45}" stroke-width="${j === 0 || j === rows ? 6 : 3.5}"/>`,
    );
  }
  // a few tinted panes (col index, row index, opacity)
  const yAt = (x, v) => topAt(x) + (botAt(x) - topAt(x)) * v;
  const pane = (c, r, op) => {
    const xa = xs[c], xb = xs[c + 1];
    const va = r / rows, vb = (r + 1) / rows;
    return `<polygon points="${xa},${yAt(xa, va).toFixed(1)} ${xb},${yAt(xb, va).toFixed(1)} ${xb},${yAt(xb, vb).toFixed(1)} ${xa},${yAt(xa, vb).toFixed(1)}" fill="${SKY}" fill-opacity="${op}"/>`;
  };
  return canvas(`
  ${pane(1, 1, 0.16)}${pane(2, 3, 0.1)}${pane(4, 2, 0.13)}${pane(6, 1, 0.09)}${pane(3, 0, 0.07)}
  ${verts}
  ${rails.join("")}
  <!-- sky reflection sweep -->
  <polygon points="430,140 700,175 480,1080 240,1035" fill="#ffffff" opacity="0.05"/>`);
}

// --- glass: cascading panes, hero-wide ---------------------------------------
function glass() {
  const pane = (i) => {
    const x = 380 + i * 240;
    const y = 150 + i * 55;
    return `<g transform="rotate(-6 960 560)">
      <rect x="${x}" y="${y}" width="560" height="720" rx="10" fill="${SKY}" fill-opacity="${(0.07 + i * 0.05).toFixed(2)}" stroke="#ffffff" stroke-opacity="${(0.3 + i * 0.11).toFixed(2)}" stroke-width="3"/>
      <polygon points="${x},${y} ${x + 160},${y} ${x},${y + 160}" fill="#ffffff" opacity="${(0.1 + i * 0.05).toFixed(2)}"/>
    </g>`;
  };
  return canvas(`
  <polygon points="300,0 560,0 -40,1280 -300,1280" fill="#ffffff" opacity="0.05"/>
  <polygon points="1150,0 1300,0 760,1280 610,1280" fill="#ffffff" opacity="0.07"/>
  ${pane(0)}${pane(1)}${pane(2)}
  <g transform="rotate(-6 960 560)">
    <line x1="1420" y1="325" x2="1420" y2="1035" stroke="${SKY}" stroke-opacity="0.9" stroke-width="5"/>
  </g>
  <g fill="${SKY}">
    <circle cx="1610" cy="220" r="13" opacity="0.4"/>
    <circle cx="1700" cy="330" r="8" opacity="0.3"/>
    <circle cx="1540" cy="150" r="6" opacity="0.5"/>
    <circle cx="260" cy="880" r="10" opacity="0.25"/>
  </g>`);
}

// --- hardware & mechanisms: handle, cylinder, hinge --------------------------
function hardwareMechanisms() {
  return canvas(`
  <!-- window handle -->
  <circle cx="700" cy="520" r="76" fill="${ICE}" fill-opacity="0.1" stroke="${ICE_LIGHT}" stroke-width="6"/>
  <circle cx="700" cy="520" r="27" fill="none" stroke="${ICE_LIGHT}" stroke-opacity="0.8" stroke-width="4"/>
  <g transform="rotate(-35 700 520)">
    <rect x="700" y="488" width="360" height="64" rx="32" fill="${ICE}" fill-opacity="0.16" stroke="${PAPER}" stroke-width="5"/>
  </g>
  <path d="M 700 640 A 180 180 0 0 0 850 690" fill="none" stroke="${SKY}" stroke-opacity="0.45" stroke-width="3" stroke-dasharray="8 8"/>
  <!-- euro cylinder -->
  <circle cx="1240" cy="380" r="85" fill="${ICE}" fill-opacity="0.1" stroke="${ICE_LIGHT}" stroke-width="5"/>
  <rect x="1206" y="420" width="68" height="180" rx="30" fill="${ICE}" fill-opacity="0.1" stroke="${ICE_LIGHT}" stroke-width="5"/>
  <line x1="1240" y1="330" x2="1240" y2="430" stroke="${SKY}" stroke-opacity="0.9" stroke-width="6"/>
  <circle cx="1240" cy="380" r="12" fill="${BLUE_MID}" fill-opacity="0.8"/>
  <!-- hinge -->
  <g stroke="${ICE_LIGHT}" stroke-opacity="0.85" fill="${ICE}" fill-opacity="0.08">
    <rect x="1520" y="620" width="86" height="300" rx="8" stroke-width="5"/>
    <rect x="1660" y="620" width="86" height="300" rx="8" stroke-width="5"/>
  </g>
  <g fill="none" stroke="${SKY}" stroke-opacity="0.8" stroke-width="4">
    <circle cx="1633" cy="660" r="16"/>
    <circle cx="1633" cy="720" r="16"/>
    <circle cx="1633" cy="780" r="16"/>
    <circle cx="1633" cy="840" r="16"/>
  </g>
  <!-- screws + leaders -->
  <g fill="none" stroke="${ICE_LIGHT}" stroke-opacity="0.75" stroke-width="3.5">
    <circle cx="980" cy="270" r="20"/><line x1="966" y1="256" x2="994" y2="284"/>
    <circle cx="1060" cy="700" r="20"/><line x1="1046" y1="714" x2="1074" y2="686"/>
  </g>
  <g stroke="${SKY}" stroke-opacity="0.35" stroke-width="2.5" stroke-dasharray="6 8">
    <line x1="1000" y1="285" x2="1160" y2="350"/>
    <line x1="1080" y1="685" x2="1210" y2="590"/>
    <line x1="900" y1="560" x2="790" y2="545"/>
  </g>`);
}

// --- aluminium: multi-chamber profile cross-section, hero scale --------------
function aluminium() {
  const hatch = (x, y, w, h, step = 20) => {
    const lines = [];
    for (let i = -h; i < w; i += step)
      lines.push(
        `<line x1="${x + Math.max(i, 0)}" y1="${y + Math.max(0, -i)}" x2="${x + Math.min(i + h, w)}" y2="${y + Math.min(h, w - i)}"/>`,
      );
    return `<g stroke="${SKY}" stroke-opacity="0.22" stroke-width="1.5">${lines.join("")}</g>`;
  };
  return canvas(`
  <!-- faint echo profile -->
  <g transform="translate(110,-70)" stroke="${ICE}" stroke-opacity="0.1" fill="none" stroke-width="3">
    <rect x="560" y="240" width="800" height="470" rx="20"/>
    <line x1="560" y1="475" x2="1360" y2="475"/>
    <line x1="760" y1="240" x2="760" y2="710"/>
    <line x1="1160" y1="240" x2="1160" y2="710"/>
  </g>
  <!-- main profile -->
  <rect x="560" y="240" width="800" height="470" rx="20" fill="${ICE}" fill-opacity="0.07" stroke="${ICE_LIGHT}" stroke-width="5"/>
  <line x1="760" y1="240" x2="760" y2="710" stroke="${ICE}" stroke-opacity="0.6" stroke-width="3"/>
  <line x1="1160" y1="240" x2="1160" y2="710" stroke="${ICE}" stroke-opacity="0.6" stroke-width="3"/>
  <line x1="560" y1="475" x2="1360" y2="475" stroke="${ICE}" stroke-opacity="0.6" stroke-width="3"/>
  <!-- thermal break band -->
  <rect x="760" y="448" width="400" height="54" fill="${BLUE_MID}" fill-opacity="0.35" stroke="${BLUE_MID}" stroke-width="2" stroke-dasharray="10 6"/>
  ${hatch(572, 252, 176, 211)}
  ${hatch(1172, 487, 176, 211)}
  <!-- gaskets -->
  <path d="M 770 240 q 22 -28 44 0" fill="none" stroke="${SKY}" stroke-opacity="0.8" stroke-width="4"/>
  <path d="M 1106 240 q 22 -28 44 0" fill="none" stroke="${SKY}" stroke-opacity="0.8" stroke-width="4"/>
  <!-- corner screw ports -->
  <g fill="none" stroke="${ICE_LIGHT}" stroke-opacity="0.8" stroke-width="3">
    <circle cx="604" cy="284" r="14"/><circle cx="1316" cy="284" r="14"/>
    <circle cx="604" cy="666" r="14"/><circle cx="1316" cy="666" r="14"/>
  </g>
  <!-- dimension lines -->
  <g stroke="${SKY}" stroke-opacity="0.65" stroke-width="2" fill="none">
    <line x1="560" y1="185" x2="1360" y2="185"/>
    <line x1="560" y1="175" x2="560" y2="195"/>
    <line x1="1360" y1="175" x2="1360" y2="195"/>
    <line x1="488" y1="240" x2="488" y2="710"/>
    <line x1="478" y1="240" x2="498" y2="240"/>
    <line x1="478" y1="710" x2="498" y2="710"/>
  </g>
  <g stroke="${SKY}" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="4 6">
    <line x1="560" y1="240" x2="560" y2="177"/>
    <line x1="1360" y1="240" x2="1360" y2="177"/>
    <line x1="560" y1="240" x2="480" y2="240"/>
    <line x1="560" y1="710" x2="480" y2="710"/>
  </g>`);
}

// --- shading & shutters: brise-soleil louvers with light --------------------
function shadingShutters() {
  const blades = [];
  for (let i = 0; i < 9; i++) {
    const x = 340 + i * 150;
    blades.push(
      `<polygon points="${x},220 ${x + 62},252 ${x + 62},920 ${x},888" fill="${ICE}" fill-opacity="${(0.24 - i * 0.012).toFixed(3)}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2.5"/>`,
    );
  }
  return canvas(`
  <!-- light beams from upper right -->
  <polygon points="1920,90 1920,230 300,1060 300,920" fill="${SKY}" opacity="0.1"/>
  <polygon points="1920,330 1920,430 560,1130 560,1030" fill="${SKY}" opacity="0.07"/>
  ${blades.join("\n  ")}
  <!-- header + footer rails -->
  <line x1="300" y1="205" x2="1720" y2="240" stroke="${ICE_LIGHT}" stroke-opacity="0.8" stroke-width="6"/>
  <line x1="300" y1="903" x2="1720" y2="938" stroke="${ICE_LIGHT}" stroke-opacity="0.6" stroke-width="6"/>
  <!-- glow spilling below -->
  <rect x="330" y="950" width="1360" height="140" fill="url(#glow)" opacity="0.5"/>`);
}

const CATEGORIES = [
  { key: "windows", svg: windows() },
  { key: "aluminium", svg: aluminium() },
  { key: "doors", svg: doors() },
  { key: "sliding-systems", svg: slidingSystems() },
  { key: "facades", svg: facades() },
  { key: "glass", svg: glass() },
  { key: "hardware-mechanisms", svg: hardwareMechanisms() },
  { key: "shading-shutters", svg: shadingShutters() },
];

mkdirSync(OUT, { recursive: true });
for (const cat of CATEGORIES) {
  const webp = await sharp(Buffer.from(cat.svg)).webp({ quality: 86 }).toBuffer();
  writeFileSync(join(OUT, `${cat.key}.webp`), webp);
  writeFileSync(join(OUT, `${cat.key}.svg`), cat.svg);
  console.log(`✓ ${cat.key}.webp (${(webp.length / 1024).toFixed(0)} KB)`);
}
console.log(`\nOutput: ${OUT}`);
console.log("Upload with: node scripts/ingest-hero.mjs --apply");
