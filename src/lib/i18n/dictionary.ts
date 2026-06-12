import type { Locale } from "@/lib/database.types";

/** Every UI string in the public site lives here — no hardcoded copy in components. */
export type Dictionary = {
  nav: {
    home: string;
    about: string;
    services: string;
    products: string;
    contact: string;
    getQuote: string;
  };
  header: { menuLabel: string };
  footer: {
    tagline: string;
    quickLinks: string;
    contactTitle: string;
    rights: string;
  };
  product: {
    specs: string;
    gallery: string;
    downloadBrochure: string;
    related: string;
    backToCategory: string;
    noProducts: string;
  };
  form: {
    name: string;
    phone: string;
    email: string;
    message: string;
    category: string;
    categoryPlaceholder: string;
    dimensions: string;
    quantity: string;
    submit: string;
    sending: string;
    requiredHint: string;
    success: string;
    error: string;
    invalid: string;
    rateLimited: string;
  };
  common: {
    skipToContent: string;
    callNow: string;
    viewAll: string;
    learnMore: string;
    openInMaps: string;
    notFoundTitle: string;
    notFoundBody: string;
    backHome: string;
  };
};

const en: Dictionary = {
  nav: {
    home: "Home",
    about: "About Us",
    services: "Services",
    products: "Products",
    contact: "Contact",
    getQuote: "Get a Quote",
  },
  header: { menuLabel: "Menu" },
  footer: {
    tagline: "Windows, doors & glass systems in Pejë, Kosovo.",
    quickLinks: "Quick links",
    contactTitle: "Contact",
    rights: "All rights reserved.",
  },
  product: {
    specs: "Specifications",
    gallery: "Gallery",
    downloadBrochure: "Download brochure",
    related: "Related products",
    backToCategory: "Back to",
    noProducts: "No products in this category yet.",
  },
  form: {
    name: "Name",
    phone: "Phone",
    email: "Email",
    message: "Message",
    category: "Product category",
    categoryPlaceholder: "Select a category",
    dimensions: "Dimensions",
    quantity: "Quantity",
    submit: "Send",
    sending: "Sending…",
    requiredHint: "Required fields",
    success: "Thank you! We received your message and will get back to you shortly.",
    error: "Something went wrong. Please try again or call us directly.",
    invalid: "Please check the highlighted fields and try again.",
    rateLimited: "Too many messages — please wait a while before trying again.",
  },
  common: {
    skipToContent: "Skip to content",
    callNow: "Call us now",
    viewAll: "View all",
    learnMore: "Learn more",
    openInMaps: "Open in Google Maps",
    notFoundTitle: "Page not found",
    notFoundBody: "The page you are looking for does not exist or has moved.",
    backHome: "Back to homepage",
  },
};

const sq: Dictionary = {
  nav: {
    home: "Ballina",
    about: "Rreth Nesh",
    services: "Shërbimet",
    products: "Produktet",
    contact: "Kontakti",
    getQuote: "Kërko Ofertë",
  },
  header: { menuLabel: "Menyja" },
  footer: {
    tagline: "Dritare, dyer & sisteme xhami në Pejë, Kosovë.",
    quickLinks: "Lidhje të shpejta",
    contactTitle: "Kontakti",
    rights: "Të gjitha të drejtat e rezervuara.",
  },
  product: {
    specs: "Specifikat",
    gallery: "Galeria",
    downloadBrochure: "Shkarko broshurën",
    related: "Produkte të ngjashme",
    backToCategory: "Kthehu te",
    noProducts: "Ende nuk ka produkte në këtë kategori.",
  },
  form: {
    name: "Emri",
    phone: "Telefoni",
    email: "Email",
    message: "Mesazhi",
    category: "Kategoria e produktit",
    categoryPlaceholder: "Zgjidhni një kategori",
    dimensions: "Përmasat",
    quantity: "Sasia",
    submit: "Dërgo",
    sending: "Duke dërguar…",
    requiredHint: "Fusha të detyrueshme",
    success: "Faleminderit! Mesazhi juaj u pranua dhe do t'ju kontaktojmë së shpejti.",
    error: "Diçka shkoi keq. Ju lutemi provoni përsëri ose na telefononi.",
    invalid: "Ju lutemi kontrolloni fushat dhe provoni përsëri.",
    rateLimited: "Shumë mesazhe — ju lutemi prisni pak para se të provoni përsëri.",
  },
  common: {
    skipToContent: "Kalo te përmbajtja",
    callNow: "Na telefononi",
    viewAll: "Shiko të gjitha",
    learnMore: "Mëso më shumë",
    openInMaps: "Hape në Google Maps",
    notFoundTitle: "Faqja nuk u gjet",
    notFoundBody: "Faqja që kërkoni nuk ekziston ose është zhvendosur.",
    backHome: "Kthehu në ballinë",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, sq };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
