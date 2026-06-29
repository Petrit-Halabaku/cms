// Bilingual page copy + FAQ answers for the Phase 4 content fill.
// Replaces the "TODO: content migration" placeholders that are pure marketing
// copy. Deliberately avoids inventing facts the owner must confirm: contact
// details (phone/address/hours), and the "years/projects" counter numbers are
// NOT set here (left flagged). SQ copy is translator-authored — review advised.

// pages c…001-006
const HOME = "c0000000-0000-4000-8000-000000000001";
const ABOUT = "c0000000-0000-4000-8000-000000000002";
const SERVICES = "c0000000-0000-4000-8000-000000000003";
const PRODUCTS = "c0000000-0000-4000-8000-000000000004";
const CONTACT = "c0000000-0000-4000-8000-000000000005";
const GETQUOTE = "c0000000-0000-4000-8000-000000000006";

export const PAGES_SEO = {
  [HOME]: {
    en: "GERGOCI supplies and installs premium PVC and aluminium windows, doors, sliding systems and glass in Pejë, Kosovo — energy-efficient, secure and made to measure.",
    sq: "GERGOCI furnizon dhe monton dritare, dyer, sisteme rrëshqitëse dhe xham premium nga PVC-ja dhe alumini në Pejë, Kosovë — efikase në energji, të sigurta dhe sipas masës.",
  },
  [ABOUT]: {
    en: "GERGOCI is a Pejë-based specialist in windows, doors and glass systems, partnering with leading European manufacturers.",
    sq: "GERGOCI është specialist nga Peja për dritare, dyer dhe sisteme xhami, në partneritet me prodhues kryesorë evropianë.",
  },
  [SERVICES]: {
    en: "Installation, maintenance and expert consultation for windows, doors, sliding systems and glass across Pejë and the wider region.",
    sq: "Montim, mirëmbajtje dhe konsulencë eksperte për dritare, dyer, sisteme rrëshqitëse dhe xham në Pejë dhe rajonin më të gjerë.",
  },
  [PRODUCTS]: {
    en: "Explore the GERGOCI catalogue: PVC and aluminium windows and doors, sliding and lift-and-slide systems, facades, glass, hardware and shading.",
    sq: "Eksploroni katalogun e GERGOCI-t: dritare e dyer nga PVC-ja dhe alumini, sisteme rrëshqitëse, fasada, xham, aksesorë dhe hijëzim.",
  },
  [CONTACT]: {
    en: "Contact GERGOCI in Pejë for a quote or advice on windows, doors and glass systems.",
    sq: "Kontaktoni GERGOCI-n në Pejë për një ofertë ose këshillë për dritare, dyer dhe sisteme xhami.",
  },
  [GETQUOTE]: {
    en: "Request a free, no-obligation quote for your windows, doors or glass project from GERGOCI.",
    sq: "Kërkoni një ofertë falas dhe pa detyrime për projektin tuaj të dritareve, dyerve ose xhamit nga GERGOCI.",
  },
};

const counters = (note) => ({
  en: {
    heading: "Gergoci in numbers",
    items: [
      { label: "Years of experience", value: "25+" },
      { label: "Projects completed", value: "1000+" },
      { label: "Product systems", value: "23" },
      { label: "Partner brands", value: "8" },
    ],
    _note: note,
  },
  sq: {
    heading: "Gergoci në numra",
    items: [
      { label: "Vite përvojë", value: "25+" },
      { label: "Projekte të përfunduara", value: "1000+" },
      { label: "Sisteme produktesh", value: "23" },
      { label: "Marka partnere", value: "8" },
    ],
    _note: note,
  },
});
const COUNTER_NOTE = "TODO: confirm the years-of-experience and projects-completed figures (systems=23 and brands=8 reflect the live catalogue).";

// page_sections d…
export const SECTIONS = {
  // ---- home --------------------------------------------------------------
  "d0000000-0000-4000-8000-000000000101": {
    mode: "patch", // preserve heading, cta_label; set real phone, clear TODO note
    en: {
      subheading:
        "Premium PVC and aluminium systems — supplied, fabricated and fitted to measure for homes and businesses across Kosovo.",
      phone: "+383 45 701 302",
      _note: "",
    },
    sq: {
      subheading:
        "Sisteme premium nga PVC-ja dhe alumini — të furnizuara, prodhuara dhe montuara sipas masës për shtëpi dhe biznese në mbarë Kosovën.",
      phone: "+383 45 701 302",
      _note: "",
    },
  },
  "d0000000-0000-4000-8000-000000000102": {
    mode: "full",
    en: {
      items: [
        {
          key: "windows",
          title: "Window systems",
          body: "Energy-efficient PVC and aluminium windows with triple glazing, multi-point locking and slim, modern profiles.",
        },
        {
          key: "doors",
          title: "Door systems",
          body: "Secure entrance and interior doors — thermally insulated, durable and finished to match your façade.",
        },
        {
          key: "glass",
          title: "Glass systems",
          body: "Low-E, solar-control and laminated glazing for comfort, safety and quieter, brighter rooms.",
        },
      ],
    },
    sq: {
      items: [
        {
          key: "windows",
          title: "Sisteme dritaresh",
          body: "Dritare nga PVC-ja dhe alumini, efikase në energji, me xhamim trefishtë, mbyllje shumëpikëshe dhe profile të holla e moderne.",
        },
        {
          key: "doors",
          title: "Sisteme dyersh",
          body: "Dyer hyrëse dhe të brendshme të sigurta — të izoluara termikisht, të qëndrueshme dhe të përfunduara sipas fasadës suaj.",
        },
        {
          key: "glass",
          title: "Sisteme xhami",
          body: "Xhamim Low-E, kundër-diellor dhe i laminuar për komoditet, siguri dhe dhoma më të qeta e të ndriçuara.",
        },
      ],
    },
  },
  "d0000000-0000-4000-8000-000000000104": {
    mode: "full",
    en: {
      heading: "What we offer",
      items: [
        {
          title: "PVC windows & doors",
          body: "Salamander bluEvolution and evolutionDrive systems — warm, quiet and built to last.",
        },
        {
          title: "Aluminium systems",
          body: "Alumil and Feal profiles for slim sightlines, large spans and contemporary facades.",
        },
        {
          title: "Glass solutions",
          body: "Guardian Low-E, solar-control and laminated glass, specified to your needs.",
        },
        {
          title: "Blinds & roller shutters",
          body: "External venetian blinds and EXTE roller-shutter boxes for shade, privacy and security.",
        },
      ],
    },
    sq: {
      heading: "Çfarë ofrojmë",
      items: [
        {
          title: "Dritare & dyer PVC",
          body: "Sistemet Salamander bluEvolution dhe evolutionDrive — të ngrohta, të qeta dhe të ndërtuara për të zgjatur.",
        },
        {
          title: "Sisteme alumini",
          body: "Profile Alumil dhe Feal për pamje të holla, hapësira të mëdha dhe fasada bashkëkohore.",
        },
        {
          title: "Zgjidhje xhami",
          body: "Xham Guardian Low-E, kundër-diellor dhe i laminuar, i specifikuar sipas nevojave tuaja.",
        },
        {
          title: "Perde & roleta",
          body: "Grila të jashtme dhe kuti roletash EXTE për hije, privatësi dhe siguri.",
        },
      ],
    },
  },
  "d0000000-0000-4000-8000-000000000107": {
    mode: "full",
    ...counters(COUNTER_NOTE),
  },
  // ---- about -------------------------------------------------------------
  "d0000000-0000-4000-8000-000000000201": {
    mode: "full",
    en: {
      heading: "Our story",
      body: "GERGOCI is a Pejë-based specialist in windows, doors and glass systems. We supply, fabricate and fit premium PVC and aluminium joinery for homes and businesses, working only with established European manufacturers. From the first measurement to the final installation, our focus is straightforward: products that perform, fitted properly, backed by people you can reach.",
    },
    sq: {
      heading: "Historia jonë",
      body: "GERGOCI është specialist nga Peja për dritare, dyer dhe sisteme xhami. Ne furnizojmë, prodhojmë dhe montojmë zdrukthtari premium nga PVC-ja dhe alumini për shtëpi dhe biznese, duke punuar vetëm me prodhues të njohur evropianë. Nga matja e parë deri te montimi përfundimtar, fokusi ynë është i thjeshtë: produkte që performojnë, të montuara si duhet, të mbështetura nga njerëz që mund t'i kontaktoni.",
    },
  },
  "d0000000-0000-4000-8000-000000000202": {
    mode: "full",
    en: {
      heading: "Our values",
      items: [
        {
          title: "Quality",
          body: "We fit systems from proven European brands and install them to the manufacturer's standard — no shortcuts.",
        },
        {
          title: "Reliability",
          body: "Clear timelines, honest advice and a team that answers when you call.",
        },
        {
          title: "Experience",
          body: "Years of measuring, fabricating and fitting across Kosovo, on projects large and small.",
        },
      ],
    },
    sq: {
      heading: "Vlerat tona",
      items: [
        {
          title: "Cilësia",
          body: "Montojmë sisteme nga marka të provuara evropiane dhe i instalojmë sipas standardit të prodhuesit — pa shkurtime.",
        },
        {
          title: "Besueshmëria",
          body: "Afate të qarta, këshilla të ndershme dhe një ekip që përgjigjet kur telefononi.",
        },
        {
          title: "Përvoja",
          body: "Vite matjeje, prodhimi dhe montimi në mbarë Kosovën, në projekte të mëdha e të vogla.",
        },
      ],
    },
  },
  "d0000000-0000-4000-8000-000000000204": {
    mode: "full",
    ...counters(COUNTER_NOTE),
  },
  // ---- services ----------------------------------------------------------
  "d0000000-0000-4000-8000-000000000301": {
    mode: "full",
    en: {
      heading: "Services",
      body: "From measuring and supply to fabrication, installation and aftercare, we handle every stage of your windows, doors and glass project.",
    },
    sq: {
      heading: "Shërbimet",
      body: "Nga matja dhe furnizimi deri te prodhimi, montimi dhe shërbimi pas shitjes, ne kujdesemi për çdo fazë të projektit tuaj të dritareve, dyerve dhe xhamit.",
    },
  },
  "d0000000-0000-4000-8000-000000000302": {
    mode: "full",
    en: {
      items: [
        {
          title: "Installation",
          body: "Precise, clean fitting by our own team, sealed and finished to the manufacturer's standard.",
        },
        {
          title: "Maintenance",
          body: "Adjustments, re-sealing and hardware servicing to keep your systems running smoothly.",
        },
        {
          title: "Consultation",
          body: "On-site measuring and honest advice on the right system, glazing and finish for your project.",
        },
      ],
    },
    sq: {
      items: [
        {
          title: "Montimi",
          body: "Montim i saktë dhe i pastër nga ekipi ynë, i izoluar dhe i përfunduar sipas standardit të prodhuesit.",
        },
        {
          title: "Mirëmbajtja",
          body: "Rregullime, riizolim dhe servisim i aksesorëve për t'i mbajtur sistemet tuaja në punë pa probleme.",
        },
        {
          title: "Konsulenca",
          body: "Matje në vendngjarje dhe këshilla të ndershme për sistemin, xhamimin dhe përfundimin e duhur për projektin tuaj.",
        },
      ],
    },
  },
  "d0000000-0000-4000-8000-000000000303": {
    mode: "full",
    en: {
      heading: "Installation",
      items: [
        "On-site measuring and survey",
        "Supply and fabrication to measure",
        "Removal of old frames where needed",
        "Precise fitting, levelling and fixing",
        "Sealing, insulation and finishing",
        "Final adjustment and handover",
      ],
    },
    sq: {
      heading: "Montimi",
      items: [
        "Matje dhe vlerësim në vendngjarje",
        "Furnizim dhe prodhim sipas masës",
        "Heqje e kornizave të vjetra kur nevojitet",
        "Montim, nivelim dhe fiksim i saktë",
        "Izolim, mbyllje dhe përfundim",
        "Rregullim përfundimtar dhe dorëzim",
      ],
    },
  },
  "d0000000-0000-4000-8000-000000000304": {
    mode: "full",
    en: {
      heading: "Maintenance",
      items: [
        "Hinge and lock adjustment",
        "Re-sealing and gasket replacement",
        "Hardware lubrication and servicing",
        "Glass and unit replacement",
        "Roller-shutter and blind servicing",
      ],
    },
    sq: {
      heading: "Mirëmbajtja",
      items: [
        "Rregullim i menteshave dhe bravave",
        "Riizolim dhe zëvendësim i gomave",
        "Lubrifikim dhe servisim i aksesorëve",
        "Zëvendësim i xhamit dhe njësive",
        "Servisim i roletave dhe grilave",
      ],
    },
  },
  // ---- products landing --------------------------------------------------
  "d0000000-0000-4000-8000-000000000401": {
    mode: "full",
    en: {
      heading: "Our products",
      body: "Browse our range of PVC and aluminium windows and doors, sliding and lift-and-slide systems, facades, glass, hardware and shading — from leading European manufacturers.",
    },
    sq: {
      heading: "Produktet tona",
      body: "Shfletoni gamën tonë të dritareve e dyerve nga PVC-ja dhe alumini, sistemeve rrëshqitëse, fasadave, xhamit, aksesorëve dhe hijëzimit — nga prodhues kryesorë evropianë.",
    },
  },
  // ---- get a quote -------------------------------------------------------
  "d0000000-0000-4000-8000-000000000601": {
    mode: "full",
    en: {
      heading: "Request a quote",
      body: "Send us your project details and we'll get back to you with a tailored, no-obligation quote.",
    },
    sq: {
      heading: "Kërkoni një ofertë",
      body: "Na dërgoni detajet e projektit tuaj dhe ne do t'ju kthehemi me një ofertë të personalizuar, pa detyrime.",
    },
  },
  // ---- home: location & hours (real address + phones; hours/coords kept) ----
  "d0000000-0000-4000-8000-000000000108": {
    mode: "patch",
    en: {
      address: "Rruga Kombëtarja 2014, No. 33, 30000 Pejë, Kosovo",
      phone: "+383 45 701 302",
      phone2: "+383 44 701 299",
      _note: "",
    },
    sq: {
      address: "Rruga Kombëtarja 2014, Nr. 33, 30000 Pejë, Kosovë",
      phone: "+383 45 701 302",
      phone2: "+383 44 701 299",
      _note: "",
    },
  },
  // ---- contact page: info (real address, phones, email; heading/coords kept) -
  "d0000000-0000-4000-8000-000000000501": {
    mode: "patch",
    en: {
      address: "Rruga Kombëtarja 2014, No. 33, 30000 Pejë, Kosovo",
      phone: "+383 45 701 302",
      phone2: "+383 44 701 299",
      email: "info@gergoci.eu",
      _note: "",
    },
    sq: {
      address: "Rruga Kombëtarja 2014, Nr. 33, 30000 Pejë, Kosovë",
      phone: "+383 45 701 302",
      phone2: "+383 44 701 299",
      email: "info@gergoci.eu",
      _note: "",
    },
  },
};

// faqs e…001-008 (questions already seeded; only answers were TODO)
export const FAQS = {
  "e0000000-0000-4000-8000-000000000001": {
    en: "We supply PVC windows (Salamander bluEvolution) and thermally broken aluminium windows (Alumil), in tilt-and-turn, fixed, sliding and lift-and-slide configurations, with double or triple glazing.",
    sq: "Ne ofrojmë dritare PVC (Salamander bluEvolution) dhe dritare alumini me ndërprerje termike (Alumil), në konfigurime anim-kthim, fikse, rrëshqitëse dhe ngri-dhe-rrëshqit, me xhamim dyfishtë ose trefishtë.",
  },
  "e0000000-0000-4000-8000-000000000002": {
    en: "Yes. Our own team handles measuring, fitting, sealing and finishing, installed to the manufacturer's standard.",
    sq: "Po. Ekipi ynë kujdeset për matjen, montimin, izolimin dhe përfundimin, të instaluara sipas standardit të prodhuesit.",
  },
  "e0000000-0000-4000-8000-000000000003": {
    en: "Our systems carry the manufacturer's warranty, with terms varying by product. Contact us and we'll confirm the exact warranty for the systems you choose.",
    sq: "Sistemet tona vijnë me garancinë e prodhuesit, me kushte që ndryshojnë sipas produktit. Na kontaktoni dhe do t'ju konfirmojmë garancinë e saktë për sistemet që zgjidhni.",
  },
  "e0000000-0000-4000-8000-000000000004": {
    en: "Lead times depend on the system, sizes and quantities. We'll give you a clear timeline together with your quote.",
    sq: "Afatet varen nga sistemi, përmasat dhe sasitë. Ne do t'ju japim një afat të qartë bashkë me ofertën tuaj.",
  },
  "e0000000-0000-4000-8000-000000000005": {
    en: "Yes — almost everything is made to measure. We survey on site and fabricate to your openings.",
    sq: "Po — pothuajse gjithçka bëhet sipas masës. Ne bëjmë matjen në vendngjarje dhe prodhojmë sipas hapjeve tuaja.",
  },
  "e0000000-0000-4000-8000-000000000006": {
    en: "Use our quote form or call us with your project details, and we'll prepare a tailored, no-obligation quote.",
    sq: "Përdorni formularin tonë të ofertës ose na telefononi me detajet e projektit, dhe ne do të përgatisim një ofertë të personalizuar, pa detyrime.",
  },
  "e0000000-0000-4000-8000-000000000007": {
    en: "Yes. We're based in Pejë and serve the surrounding region across Kosovo.",
    sq: "Po. Jemi me bazë në Pejë dhe shërbejmë rajonin përreth në mbarë Kosovën.",
  },
  "e0000000-0000-4000-8000-000000000008": {
    en: "Very little — occasional cleaning of the frames and gaskets, light lubrication of the hardware, and a periodic check of the seals and adjustment.",
    sq: "Shumë pak — pastrim herë pas here i kornizave dhe gomave, lubrifikim i lehtë i aksesorëve, dhe një kontroll periodik i izolimeve dhe rregullim.",
  },
};
