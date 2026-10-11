// ASCII-folding kebab-case slugifier for catalog slugs.
// Albanian diacritics (ë, ç) and common Latin accents fold to ASCII.
const FOLD = {
  ë: "e", ç: "c", ñ: "n", ä: "a", ö: "o", ü: "u", ß: "ss",
  é: "e", è: "e", ê: "e", á: "a", à: "a", â: "a", í: "i", ì: "i", î: "i",
  ó: "o", ò: "o", ô: "o", ú: "u", ù: "u", û: "u", ã: "a", õ: "o",
  å: "a", ø: "o", æ: "ae",
};

export function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[ëçñäöüßéèêáàâíìîóòôúùûãõåøæ]/g, (c) => FOLD[c] ?? c)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’"().,/]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
