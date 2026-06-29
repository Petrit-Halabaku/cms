// Catalog mapping + bilingual product data for the Gergoci content migration.
// Pure data/logic (no DB, no env). Consumed by scripts/import-catalog.mjs.

// --- Clean 7 categories (reuse the existing seed UUIDs a…001–007) -----------
// Decision (Phase 0): Aluminium→Facades, Blinds→Hardware & Mechanisms,
// Roller Shutters→Shading & Shutters. "Facades" spelled plain (no cedilla).
export const CATEGORIES = [
  { key: "windows",            id: "a0000000-0000-4000-8000-000000000001", sort: 1, en: { name: "Windows",               slug: "windows" },          sq: { name: "Dritare",              slug: "dritare" } },
  { key: "doors",              id: "a0000000-0000-4000-8000-000000000002", sort: 2, en: { name: "Doors",                 slug: "doors" },            sq: { name: "Dyer",                 slug: "dyer" } },
  { key: "sliding-systems",    id: "a0000000-0000-4000-8000-000000000003", sort: 3, en: { name: "Sliding Systems",       slug: "sliding-systems" },  sq: { name: "Sisteme Rrëshqitëse",  slug: "sisteme-rreshqitese" } },
  { key: "facades",            id: "a0000000-0000-4000-8000-000000000004", sort: 4, en: { name: "Facades",               slug: "facades" },          sq: { name: "Fasada",               slug: "fasada" } },
  { key: "glass",              id: "a0000000-0000-4000-8000-000000000005", sort: 5, en: { name: "Glass",                 slug: "glass" },            sq: { name: "Xhama",                slug: "xhama" } },
  { key: "hardware-mechanisms", id: "a0000000-0000-4000-8000-000000000006", sort: 6, en: { name: "Hardware & Mechanisms", slug: "hardware-mechanisms" }, sq: { name: "Aksesorë & Mekanizma", slug: "aksesore-mekanizma" } },
  { key: "shading-shutters",   id: "a0000000-0000-4000-8000-000000000007", sort: 7, en: { name: "Shading & Shutters",    slug: "shading-shutters" }, sq: { name: "Hijëzim & Roleta",     slug: "hijezim-roleta" } },
];

export const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

// Map a source (Category, Subcategory) pair to a clean-7 category key.
export function mapCategoryKey(category, subcategory) {
  const sub = (subcategory || "").toLowerCase();
  const cat = (category || "").toLowerCase();
  if (sub === "windows") return "windows";
  if (sub === "doors") return "doors";
  if (sub.includes("sliding")) return "sliding-systems";
  if (sub === "facade" || sub.includes("facade")) return "facades";
  if (cat.includes("glass") || sub.includes("glazing")) return "glass";
  if (cat.includes("hardware") || sub.includes("lock") || sub.includes("mechanism")) return "hardware-mechanisms";
  if (cat.includes("shading") || sub.includes("blind") || sub.includes("shutter")) return "shading-shutters";
  throw new Error(`Unmapped category: "${category}" > "${subcategory}"`);
}

// Material fact (PVC / Aluminium) derived from the source top-level category.
export function deriveMaterial(category) {
  const c = (category || "").toLowerCase();
  if (c.includes("pvc")) return { en: "PVC", sq: "PVC" };
  if (c.includes("aluminum") || c.includes("aluminium")) return { en: "Aluminium", sq: "Alumin" };
  return null;
}

// --- Brand → partner ---------------------------------------------------------
export const BRAND_PARTNERS = [
  { name: "Salamander",    id: "f1000000-0000-4000-8000-000000000001", sort: 1 },
  { name: "Alumil",        id: "f1000000-0000-4000-8000-000000000002", sort: 2 },
  { name: "Feal",          id: "f1000000-0000-4000-8000-000000000003", sort: 3 },
  { name: "Guardian Glass", id: "f1000000-0000-4000-8000-000000000004", sort: 4 },
  { name: "MACO",          id: "f1000000-0000-4000-8000-000000000005", sort: 5 },
  { name: "Somfy",         id: "f1000000-0000-4000-8000-000000000006", sort: 6 },
  { name: "Stoma",         id: "f1000000-0000-4000-8000-000000000007", sort: 7 },
  { name: "Exte",          id: "f1000000-0000-4000-8000-000000000008", sort: 8 },
];

const BRAND_CANON = {
  salamander: "Salamander", alumil: "Alumil", feal: "Feal",
  "guardian glass": "Guardian Glass", guardian: "Guardian Glass",
  maco: "MACO", somfy: "Somfy", exte: "Exte",
  stoma: "Stoma", "stoma (storenmaterial ag)": "Stoma",
};

export function normalizeBrand(raw) {
  if (!raw) return null;
  return BRAND_CANON[String(raw).trim().toLowerCase()] ?? String(raw).trim();
}

// --- AV-900/700 enrichment (stub in materials-final2; full data here) --------
export const AV_ENRICHMENT = {
  brand: "Stoma (Storenmaterial AG)",
  description:
    "Stoma AV-900 and AV-700 external (compound) venetian blinds for sun and weather protection. The AV-900 uses bold 90 mm z-shaped slats for a striking façade; the AV-700 uses 70 mm slats for a discreet look needing only a 100 mm recess. Both offer rail, cable, or combined wind-resistant cable/rail guidance (up to wind class 6), textured weatherproof slats, optional electric drive, daylight zoning (split sections with independent slat angles), and an anti-burglary end-position stop. Self-supporting installation preserves insulation and prevents thermal bridges.",
  compatibility:
    "Motorised versions pair with the Somfy J4 WT external-blind motor (in this catalog). Variants: AV-930/AV-730 (cable-guided), AV-940/AV-740 (combined cable+rail, wind class 6).",
  specifications: {
    type: "External (compound) venetian blinds — façade sun/weather protection",
    slat_width_mm: "AV-900: 90 (z-shaped); AV-700: 70",
    min_recess_depth_mm: "AV-900: 130; AV-700: 100",
    min_construction_width_mm: "AV-900: 345 (crank) / 480 (electric); AV-700: 330 (crank) / 465 (electric)",
    max_construction_width_mm: "5000 (6000 without warranty)",
    height_of_opening_mm: "min 400; max 4250 (5500 without warranty)",
    max_area_single_blind_m2: "6 (crank) / 10 (motor)",
    max_area_coupled_system_m2: "6 (crank) / 24 (electric); up to 3 coupled blinds",
    wind_resistance_class: "Up to class 6 (92 km/h); combined cable+rail (AV-940/AV-740) up to class 6+",
    guidance_options: "Rail; cable (AV-930/AV-730); combined wind-resistant cable+rail (AV-940/AV-740)",
    cables: "3 mm PA-coated chrome steel",
    drive: "Crank or electric motor (meets Minergie standard with controller)",
    slat_coating: "Textured — improved colour retention & weather resistance, reduced dirt adhesion",
    colours: "~28 standard (incl. IGP & metallic); 1000+ RAL / NCS / IGP on request",
    components: "Chrome steel slat hooks, metal guide bolts, Kevlar-reinforced turning cords, 8 mm lift tapes",
    security: "End-position stop prevents the closed blind being raised from outside (anti-burglary)",
    mounting: "Self-supporting — preserves insulation, reduces noise, prevents thermal bridges; central reinforcement required from 2500 mm width",
    operation_modes: "Standard (slats close in end position) or Business (slats angle ~40° for anti-glare)",
    standard: "EN 13659",
    origin: "Made in Switzerland",
  },
  // Reference list (what to source). Local files that already exist live in
  // CMS-MATERIALS/products/ — staged by the import into media-import/<slug>/.
  image_urls: [
    "./av-images/av_large_830x1173_1c7d434e.jpg",
    "./av-images/av_large_831x1173_a7d9edef.jpg",
    "./av-images/av_large_830x1173_48529499.jpg",
    "./av-images/av_large_847x1184_7bfc818c.jpg",
    "./av-images/av_large_846x1184_de7f9ba9.jpg",
    "./av-images/av_large_830x1173_3eed4cf0.jpg",
  ],
  localImagesSubdir: "products",
  localImages: [
    "av_large_830x1173_1c7d434e.jpg",
    "av_large_831x1173_a7d9edef.jpg",
    "av_large_830x1173_48529499.jpg",
  ],
};

// --- Per-product overrides: slug, EN title (default = source name), SQ copy ---
// `review: true` means the SQ title/body is translator-authored and pending a
// native-speaker pass (the import lists these in sq-review.json).
export const PRODUCTS = {
  "Salamander bluEvolution 82 MD": {
    slug: "salamander-bluevolution-82-md",
    sqTitle: "Salamander bluEvolution 82 MD",
    sqBody:
      "Dritare PVC 82 mm e Salamander, e aftë për shtëpi pasive, me teknologji të mbylljes qendrore (MD), xhamim trefishtë deri në 52 mm, disa profile ballore dhe performancë të lartë termike, akustike e të sigurisë.",
    review: true,
  },
  "Salamander bluEvolution 92": {
    slug: "salamander-bluevolution-92",
    sqTitle: "Salamander bluEvolution 92",
    sqBody:
      "Dritare PVC premium 92 mm me 6 dhoma, që pranon xhamim special deri në 60 mm; ballë i hollë 118 mm, vlera termike dhe akustike të nivelit të lartë, përfundime opsionale realMaterial dhe veshje mbuluese alumini.",
    review: true,
  },
  "Salamander bluEvolution 92 (entrance door)": {
    slug: "salamander-bluevolution-92-entrance-door",
    sqTitle: "Salamander bluEvolution 92 (derë hyrëse)",
    sqBody:
      "Krah dere hyrëse bluEvolution 92 që ndërthur sigurinë dhe efikasitetin energjetik, duke pranuar panele deri në 60 mm (xhamim trefishtë/funksional), me ballë të hollë 164 mm dhe opsione pragu pa pengesa.",
    review: true,
  },
  "Salamander bluEvolution 82 (entrance door)": {
    slug: "salamander-bluevolution-82-entrance-door",
    sqTitle: "Salamander bluEvolution 82 (derë hyrëse)",
    sqBody:
      "Sistem dere hyrëse bluEvolution 82 që thekson qëndrueshmërinë, izolimin termik, mbrojtjen nga zhurma e vjedhja, dhe fleksibilitetin e dizajnit për hyrjen kryesore të një ndërtese.",
    review: true,
  },
  "Salamander evolutionDrive HST": {
    slug: "salamander-evolutiondrive-hst",
    sqTitle: "Salamander evolutionDrive HST",
    sqBody:
      "Derë PVC ngri-dhe-rrëshqit për hapje të mëdha të xhamta me prag pa pengesa 'levelZer0', operim të butë të krahëve të rëndë dhe performancë të fortë termike/akustike; ofrohet edhe si Greta Fenster e ricikluar.",
    review: true,
  },
  "Salamander evolutionDrive plus": {
    slug: "salamander-evolutiondrive-plus",
    sqTitle: "Salamander evolutionDrive plus",
    sqBody:
      "Sistem PVC kthim-rrëshqitje paralele që mbyllet paralelisht me kornizën për ngushtësi të lartë; më i lehtë dhe më i cekët se një ngri-dhe-rrëshqit klasik, me xhamim të madh dhe vlera të mira termike/akustike.",
    review: true,
  },
  "Salamander evolutionDrive 60": {
    slug: "salamander-evolutiondrive-60",
    sqTitle: "Salamander evolutionDrive 60",
    sqBody:
      "Gama e dritareve rrëshqitëse PVC me shumë shina e Salamander, e ofruar në thellësi kornize 60, 74, 92 dhe 108 mm.",
    review: true,
  },
  "Alumil Smartia S77": {
    slug: "alumil-smartia-s77",
    sqTitle: "Alumil Smartia S77",
    sqBody:
      "Sistem i avancuar me ndërprerje termike, me krahë me menteshë, i Alumil mbi kornizë 77 mm, i certifikuar për Shtëpi Pasive, me siguri të lartë, izolim zëri dhe gamë të gjerë tipologjish.",
    review: true,
  },
  "Alumil Smartia S67": {
    slug: "alumil-smartia-s67",
    sqTitle: "Alumil Smartia S67",
    sqBody:
      "Sistem i plotë anim & kthim i Alumil mbi kornizë 67 mm që ndërthur izolim termik të fortë, dizajne të sheshta ose të lakuara, kapacitet të lartë të krahut dhe siguri të certifikuar.",
    review: true,
  },
  "Feal Termo 85 VS and VP": {
    slug: "feal-termo-85-vs-and-vp",
    sqTitle: "Feal Termo 85 VS dhe VP",
    sqBody:
      "Sistem premium alumini me ndërprerje termike i Feal për dyer hyrëse/dritare, në versionet me xham (VS) dhe me panel (VP), me ndërprerje termike poliamidi, krahë deri në 160 kg dhe vlerësime të larta moti/sigurie.",
    review: true,
  },
  "Alumil Supreme S700": {
    slug: "alumil-supreme-s700",
    sqTitle: "Alumil Supreme S700",
    sqBody:
      "Sistem i klasit të lartë ngri-dhe-rrëshqit i Alumil për hapësira të gjera dhe xham të madh, me bllokim shumë të hollë 47 mm, krahë deri në 600 kg, poliamide kundër deformimit dhe prag opsional plotësisht të fshehur (Eclipse).",
    review: true,
  },
  "Alumil Smartia S560": {
    slug: "alumil-smartia-s560",
    sqTitle: "Alumil Smartia S560",
    sqBody:
      "Sistem i fuqishëm me izolim termik i Alumil që ofron si ngri-dhe-rrëshqit ashtu edhe rrëshqitje të zakonshme me të njëjtat profile, bllokim të hollë 49 mm, opsion pragu të ulët (LT) dhe gamë të gjerë tipologjish për hapje të mëdha.",
    review: true,
  },
  "Alumil Smartia M7": {
    slug: "alumil-smartia-m7",
    sqTitle: "Alumil Smartia M7",
    sqBody:
      "Mur perde tip 'stick' me performancë të lartë dhe kosto efektive i Alumil, me gjerësi ballore 50 mm, gamë të thellë montantësh, xhamim strukturor ose me pllakë presioni, kullim të integruar të ujit dhe vlerësime të larta sigurie/termike.",
    review: true,
  },
  "Guardian Low-E glass": {
    slug: "guardian-low-e-glass",
    sqTitle: "Xham Guardian Low-E",
    sqBody:
      "Xham me veshje me emetim të ulët që reflekton nxehtësinë e brendshme përsëri në dhomë duke lejuar dritën e ditës; përdoret brenda një njësie izoluese xhami për të ulur ndjeshëm vlerat U dhe për të përmirësuar komoditetin gjatë gjithë vitit.",
    review: true,
  },
  "Guardian Solar Control glass": {
    slug: "guardian-solar-control-glass",
    sqTitle: "Xham Guardian Solar Control",
    sqBody:
      "Xham me veshje për kontroll diellor (SunGuard) që lejon dritën natyrale duke reflektuar nxehtësinë diellore për të ulur mbinxehjen e shkëlqimin dhe për të reduktuar nevojën për ftohje, me përfitime izolimi termik kur ka veshje argjendi.",
    review: true,
  },
  "Guardian Laminated glass": {
    slug: "guardian-laminated-glass",
    sqTitle: "Xham Guardian i laminuar",
    sqBody:
      "Xham i lidhur me shtresa ndërmjetëse PVB, kështu që copëzat ngjisin kur thyhet, duke shtuar përfitime sigurie, mbrojtjeje, akustike dhe mbrojtjeje nga UV; mund të veshet për performancë termike ose diellore dhe ofrohet në shumë ngjyra.",
    review: true,
  },
  "MACO Protect cylinder-operated door lock (asset 760209)": {
    slug: "maco-protect-door-lock",
    enTitle: "MACO Protect cylinder-operated door lock",
    sqTitle: "Bravë dere MACO Protect (me cilindër)",
    sqBody:
      "Familje bravash dere shumëpikëshe me çelës-cilindër e MACO (Z-TS me trefishtë-bllokim dhe Z-TF me 3 gjuhëza) për dyer druri/alumini/PVC deri në 3.100 mm, që ofron mbrojtje nga vjedhja deri në RC3 dhe presion kontakti të njëtrajtshëm.",
    review: true,
  },
  "MACO Multi Matic IQ (Turn-Tilt)": {
    slug: "maco-multi-matic-iq",
    sqTitle: "MACO Multi Matic IQ (Kthim-Anim)",
    sqBody:
      "Platformë gjithëpërfshirëse aksesorësh kthim & anim e MACO (tani me përmirësimet 'IQ') që mbulon shumicën e dizajneve të dritareve në PVC/dru/alumin, me kamë sigurie të integruara dhe gamë të gjerë komponentësh sistemi.",
    review: true,
  },
  "MACO Multi Power (Turn-Tilt, concealed)": {
    slug: "maco-multi-power",
    sqTitle: "MACO Multi Power (Kthim-Anim, i fshehur)",
    sqBody:
      "Sistem premium menteshash kthim & anim plotësisht i fshehur i MACO për dizajne dritaresh me sipërfaqe të rrafshët, që mban 150 kg (180 kg me aksesorë) dhe mundëson ndërtime deri në tre krahë dhe të montuara rrafsh.",
    review: true,
  },
  "MACO Multi Mammut (Turn-Tilt, heavy-duty)": {
    slug: "maco-multi-mammut",
    sqTitle: "MACO Multi Mammut (Kthim-Anim, për ngarkesa të rënda)",
    sqBody:
      "Aksesorë kthim & anim për ngarkesa të rënda i MACO që lëvizin dritare me një ose dy krahë dhe dyer me menteshë deri në 180 kg (PVC)/220 kg (dru) dhe 3,6 m², me kamë sigurie standarde kundër vjedhjes dhe opsion dere PVC me menteshë pa pengesa.",
    review: true,
  },
  "Somfy J4 WT (motor for external venetian blinds)": {
    slug: "somfy-j4-wt",
    enTitle: "Somfy J4 WT motor (external venetian blinds)",
    sqTitle: "Motor Somfy J4 WT (për grila të jashtme)",
    sqBody:
      "Motor elektronik i shkurtër me tel i Somfy për motorizimin e grilave të jashtme në ndërtime të reja dhe renovime, me kërpudhë mbrojtëse 2D, ndalesë sigurie dhe përputhshmëri të gjerë me kreun e shinës.",
    review: true,
  },
  "AV-900 and AV-700 venetian blinds": {
    slug: "stoma-av-900-and-av-700",
    enTitle: "Stoma AV-900 and AV-700 (external venetian blinds)",
    sqTitle: "Stoma AV-900 dhe AV-700 (grila të jashtme)",
    sqBody:
      "Grila të jashtme (të përbëra) Stoma AV-900 dhe AV-700 për mbrojtje nga dielli dhe moti. AV-900 përdor llamela të theksuara 90 mm në formë 'z' për një fasadë mbresëlënëse; AV-700 përdor llamela 70 mm për një pamje diskrete që kërkon vetëm 100 mm thellësi. Të dyja ofrojnë udhëheqje me shina, me litar, ose të kombinuar litar/shinë rezistente ndaj erës (deri në klasën 6 të erës), llamela të teksturuara rezistente ndaj motit, motor elektrik opsional, zonëzim drite (seksione të ndara me kënde llamelash të pavarura) dhe ndalesë fundore kundër vjedhjes. Montimi vetëmbajtës ruan izolimin dhe parandalon urat termike.",
    review: true,
    enrich: AV_ENRICHMENT,
  },
  "Exte roller shutter box systems (XT platform)": {
    slug: "exte-xt-roller-shutter-boxes",
    enTitle: "Exte XT roller-shutter box systems",
    sqTitle: "Sisteme kutie roletash Exte (platforma XT)",
    sqBody:
      "Platforma modulare e kutive të roletave XT e EXTE (Exakt/Expert/Elite/Neo/Arca) me pjesë të përbashkëta, performancë të fortë termike e akustike, lloje të shumta hapjesh për mirëmbajtje, dhe inserte opsionale rrjete/grilash/mbrojtjeje nga rënia.",
    review: true,
  },
};
