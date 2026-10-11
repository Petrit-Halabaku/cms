// Humanises the variable `specifications` keys from the source catalog into
// bilingual project_facts labels. Curated map for every key that appears in the
// catalog; a generic fallback handles anything new (EN unit-aware, SQ → EN).
//
// SQ labels here are translator-authored but should be confirmed by a native
// speaker before launch — the import emits sq-review.json listing affected rows.

const LABELS = {
  // U-values / thermal
  Uf_W_m2K: { en: "U-value, frame (W/m²K)", sq: "Vlera U, kornizë (W/m²K)" },
  Uw_W_m2K: { en: "U-value, window (W/m²K)", sq: "Vlera U, dritare (W/m²K)" },
  Ud_W_m2K: { en: "U-value, door (W/m²K)", sq: "Vlera U, derë (W/m²K)" },
  U_value_double_W_m2K: { en: "U-value, double glazing (W/m²K)", sq: "Vlera U, xhamim dyfishtë (W/m²K)" },
  U_value_triple_W_m2K: { en: "U-value, triple glazing (W/m²K)", sq: "Vlera U, xhamim trefishtë (W/m²K)" },
  USB_value_best_W_m2K: { en: "Box U-value, best case (W/m²K)", sq: "Vlera U e kutisë, rasti më i mirë (W/m²K)" },
  thermal_insulation: { en: "Thermal insulation", sq: "Izolimi termik" },
  thermal_benefit: { en: "Thermal benefit", sq: "Përfitimi termik" },
  thermal_min_requirement: { en: "Min thermal requirement", sq: "Kërkesa min. termike" },
  // Acoustic
  sound_reduction_dB: { en: "Sound reduction (dB)", sq: "Reduktimi i zhurmës (dB)" },
  sound_reduction_max_dB: { en: "Sound reduction, max (dB)", sq: "Reduktimi i zhurmës, maks. (dB)" },
  sound_insulation_dB: { en: "Sound insulation (dB)", sq: "Izolimi i zërit (dB)" },
  soundproof_strip_dB: { en: "Soundproofing strip (dB)", sq: "Shiriti izolues i zërit (dB)" },
  noise_level_dB: { en: "Noise level (dB)", sq: "Niveli i zhurmës (dB)" },
  acoustic_metric: { en: "Acoustic rating", sq: "Vlerësimi akustik" },
  sound_protection: { en: "Sound protection", sq: "Mbrojtja nga zhurma" },
  // Depths / widths / heights
  installation_depth_mm: { en: "Installation depth (mm)", sq: "Thellësia e montimit (mm)" },
  build_depth_mm: { en: "Build depth (mm)", sq: "Thellësia e ndërtimit (mm)" },
  frame_depth_mm: { en: "Frame depth (mm)", sq: "Thellësia e kornizës (mm)" },
  frame_depths_mm: { en: "Frame depths (mm)", sq: "Thellësitë e kornizës (mm)" },
  sash_depth_mm: { en: "Sash depth (mm)", sq: "Thellësia e krahut (mm)" },
  mullion_depth_mm: { en: "Mullion depth (mm)", sq: "Thellësia e montantit (mm)" },
  transom_depth_mm: { en: "Transom depth (mm)", sq: "Thellësia e traversës (mm)" },
  max_window_frame_depth_mm: { en: "Max window frame depth (mm)", sq: "Thellësia maks. e kornizës së dritares (mm)" },
  visible_height_mm: { en: "Visible height (mm)", sq: "Lartësia e dukshme (mm)" },
  visible_width_mm: { en: "Visible width (mm)", sq: "Gjerësia e dukshme (mm)" },
  exterior_visible_width_mm: { en: "Exterior visible width (mm)", sq: "Gjerësia e dukshme e jashtme (mm)" },
  min_visible_face_height_mm: { en: "Min visible face height (mm)", sq: "Lartësia min. e ballit të dukshëm (mm)" },
  min_visible_face_width_central_mm: { en: "Min visible face width, central (mm)", sq: "Gjerësia min. e ballit të dukshëm, qendrore (mm)" },
  sash_face_width_mm: { en: "Sash face width (mm)", sq: "Gjerësia ballore e krahut (mm)" },
  min_interlock_face_width_mm: { en: "Min interlock face width (mm)", sq: "Gjerësia min. ballore e mbylljes (mm)" },
  min_threshold_height_mm: { en: "Min threshold height (mm)", sq: "Lartësia min. e pragut (mm)" },
  max_sash_rebate_height_mm: { en: "Max sash rebate height (mm)", sq: "Lartësia maks. e faltës së krahut (mm)" },
  sash_height_mm: { en: "Sash height (mm)", sq: "Lartësia e krahut (mm)" },
  sash_width_mm: { en: "Sash width (mm)", sq: "Gjerësia e krahut (mm)" },
  profile_wall_thickness_mm: { en: "Profile wall thickness (mm)", sq: "Trashësia e murit të profilit (mm)" },
  polyamide_strips_mm: { en: "Polyamide strips (mm)", sq: "Shiritat e poliamidit (mm)" },
  // Glazing / panel thickness
  glazing_thickness_mm: { en: "Glazing thickness (mm)", sq: "Trashësia e xhamimit (mm)" },
  glazing_thickness_max_mm: { en: "Glazing thickness, max (mm)", sq: "Trashësia e xhamimit, maks. (mm)" },
  glazing_max_mm: { en: "Glazing, max (mm)", sq: "Xhamimi, maks. (mm)" },
  panel_thickness_max_mm: { en: "Panel thickness, max (mm)", sq: "Trashësia e panelit, maks. (mm)" },
  filling_thickness_max_mm: { en: "Filling thickness, max (mm)", sq: "Trashësia e mbushjes, maks. (mm)" },
  glazing: { en: "Glazing", sq: "Xhamimi" },
  glazing_type: { en: "Glazing type", sq: "Tipi i xhamimit" },
  glazing_holding: { en: "Glazing retention", sq: "Mbajtja e xhamit" },
  // Weights / areas / loads
  max_door_height_m: { en: "Max door height (m)", sq: "Lartësia maks. e derës (m)" },
  max_sash_weight_kg: { en: "Max sash weight (kg)", sq: "Pesha maks. e krahut (kg)" },
  sash_weight_max_kg: { en: "Max sash weight (kg)", sq: "Pesha maks. e krahut (kg)" },
  max_leaf_weight_kg: { en: "Max leaf weight (kg)", sq: "Pesha maks. e fletës (kg)" },
  max_weight_kg: { en: "Max weight (kg)", sq: "Pesha maks. (kg)" },
  max_sash_area_m2: { en: "Max sash area (m²)", sq: "Sipërfaqja maks. e krahut (m²)" },
  max_applicable_torque_Nm: { en: "Max applicable torque (N·m)", sq: "Momenti maks. i aplikueshëm (N·m)" },
  mullion_max_inertia: { en: "Mullion max inertia", sq: "Inercia maks. e montantit" },
  transoms_max_inertia: { en: "Transom max inertia", sq: "Inercia maks. e traversës" },
  // Motor / electrical
  consumption_operation_W: { en: "Power consumption, operating (W)", sq: "Konsumi i energjisë, në punë (W)" },
  consumption_standby_W: { en: "Power consumption, standby (W)", sq: "Konsumi i energjisë, në gatishmëri (W)" },
  carbon_footprint_kgCO2: { en: "Carbon footprint (kg CO₂)", sq: "Gjurma e karbonit (kg CO₂)" },
  limit_switch_capacity_turns: { en: "Limit switch capacity (turns)", sq: "Kapaciteti i ndërprerësit kufitar (rrotullime)" },
  power_supply: { en: "Power supply", sq: "Furnizimi me energji" },
  protection_index: { en: "Protection index (IP)", sq: "Indeksi i mbrojtjes (IP)" },
  safety_class: { en: "Safety class", sq: "Klasa e sigurisë" },
  technology: { en: "Technology", sq: "Teknologjia" },
  reference: { en: "Reference", sq: "Referenca" },
  compatible_headrails: { en: "Compatible headrails", sq: "Krerët e përputhshëm të shinës" },
  // Glass
  solar_factor_g: { en: "Solar factor (g)", sq: "Faktori diellor (g)" },
  UV_filtering: { en: "UV filtering", sq: "Filtrimi i UV" },
  UV_protection: { en: "UV protection", sq: "Mbrojtja nga UV" },
  coating_position: { en: "Coating position", sq: "Pozicioni i veshjes" },
  coating_process: { en: "Coating process", sq: "Procesi i veshjes" },
  must_be_used_in: { en: "Must be used in", sq: "Duhet përdorur në" },
  product_solutions: { en: "Product solutions", sq: "Zgjidhjet e produktit" },
  product_ranges: { en: "Product ranges", sq: "Gamat e produktit" },
  thickness_nomenclature: { en: "Thickness nomenclature", sq: "Nomenklatura e trashësisë" },
  aesthetics: { en: "Aesthetics", sq: "Estetika" },
  metric: { en: "Metric", sq: "Njësia matëse" },
  // Shading / blinds
  slat_width_mm: { en: "Slat width (mm)", sq: "Gjerësia e llamelës (mm)" },
  min_recess_depth_mm: { en: "Min recess depth (mm)", sq: "Thellësia min. e nishës (mm)" },
  min_construction_width_mm: { en: "Min construction width (mm)", sq: "Gjerësia min. e ndërtimit (mm)" },
  max_construction_width_mm: { en: "Max construction width (mm)", sq: "Gjerësia maks. e ndërtimit (mm)" },
  height_of_opening_mm: { en: "Opening height (mm)", sq: "Lartësia e hapjes (mm)" },
  max_area_single_blind_m2: { en: "Max area, single blind (m²)", sq: "Sipërfaqja maks., grilë e vetme (m²)" },
  max_area_coupled_system_m2: { en: "Max area, coupled system (m²)", sq: "Sipërfaqja maks., sistem i çiftuar (m²)" },
  wind_resistance_class: { en: "Wind resistance class", sq: "Klasa e rezistencës ndaj erës" },
  guidance_options: { en: "Guidance options", sq: "Opsionet e udhëheqjes" },
  cables: { en: "Cables", sq: "Kabllot" },
  drive: { en: "Drive", sq: "Mekanizmi i lëvizjes" },
  slat_coating: { en: "Slat coating", sq: "Veshja e llamelës" },
  colours: { en: "Colours", sq: "Ngjyrat" },
  components: { en: "Components", sq: "Komponentët" },
  mounting: { en: "Mounting", sq: "Montimi" },
  operation_modes: { en: "Operation modes", sq: "Mënyrat e operimit" },
  origin: { en: "Origin", sq: "Origjina" },
  box_dimensions_examples: { en: "Box dimensions (examples)", sq: "Përmasat e kutisë (shembuj)" },
  box_systems: { en: "Box systems", sq: "Sistemet e kutisë" },
  fall_protection_option: { en: "Fall-protection option", sq: "Opsioni i mbrojtjes nga rënia" },
  hanging_types: { en: "Hanging types", sq: "Llojet e varjes" },
  // Performance / ratings
  burglary_resistance: { en: "Burglary resistance", sq: "Rezistenca ndaj vjedhjes" },
  burglary_protection: { en: "Burglary protection", sq: "Mbrojtja nga vjedhja" },
  air_permeability: { en: "Air permeability", sq: "Depërtueshmëria e ajrit" },
  water_tightness: { en: "Water tightness", sq: "Papërshkueshmëria nga uji" },
  wind_load_resistance: { en: "Wind load resistance", sq: "Rezistenca ndaj ngarkesës së erës" },
  wind_load_security: { en: "Wind load security", sq: "Siguria ndaj ngarkesës së erës" },
  wind_resistance: { en: "Wind resistance", sq: "Rezistenca ndaj erës" },
  security: { en: "Security", sq: "Siguria" },
  // Build / materials / configuration
  chambers: { en: "Chambers", sq: "Dhomat" },
  finishes: { en: "Finishes", sq: "Përfundimet" },
  surface_finish: { en: "Surface finish", sq: "Përfundimi i sipërfaqes" },
  surface_treatment: { en: "Surface treatment", sq: "Trajtimi i sipërfaqes" },
  sealing: { en: "Sealing", sq: "Mbyllja dhe izolimi" },
  seal_material: { en: "Seal material", sq: "Materiali i izolimit" },
  profile_variants: { en: "Profile variants", sq: "Variantet e profilit" },
  sash_variants: { en: "Sash variants", sq: "Variantet e krahut" },
  max_window_size: { en: "Max window size", sq: "Përmasa maks. e dritares" },
  max_frame_size: { en: "Max frame size", sq: "Përmasa maks. e kornizës" },
  max_sash_size: { en: "Max sash size", sq: "Përmasa maks. e krahut" },
  max_sash: { en: "Max sash", sq: "Krahu maks." },
  recyclability: { en: "Recyclability", sq: "Riciklueshmëria" },
  configurations: { en: "Configurations", sq: "Konfigurimet" },
  opening: { en: "Opening", sq: "Hapja" },
  threshold: { en: "Threshold", sq: "Pragu" },
  attributes: { en: "Attributes", sq: "Atributet" },
  applications: { en: "Applications", sq: "Aplikimet" },
  application: { en: "Application", sq: "Aplikimi" },
  benefits: { en: "Benefits", sq: "Përfitimet" },
  type: { en: "Type", sq: "Tipi" },
  asset_type: { en: "Type", sq: "Tipi" },
  window_type: { en: "Window type", sq: "Tipi i dritares" },
  certificates: { en: "Certificates", sq: "Certifikatat" },
  certification: { en: "Certification", sq: "Certifikimi" },
  standards: { en: "Standards", sq: "Standardet" },
  standard: { en: "Standard", sq: "Standardi" },
  mechanism: { en: "Mechanism", sq: "Mekanizmi" },
  designs: { en: "Designs", sq: "Dizajnet" },
  base_material: { en: "Base material", sq: "Materiali bazë" },
  materials: { en: "Materials", sq: "Materialet" },
  system_groups: { en: "System groups", sq: "Grupet e sistemit" },
  system_components: { en: "System components", sq: "Komponentët e sistemit" },
  special_version: { en: "Special version", sq: "Versioni special" },
  low_threshold_version: { en: "Low-threshold version", sq: "Versioni me prag të ulët" },
  typologies: { en: "Typologies", sq: "Tipologjitë" },
  product_family: { en: "Product family", sq: "Familja e produktit" },
  locking_options: { en: "Locking options", sq: "Opsionet e mbylljes" },
  platform: { en: "Platform", sq: "Platforma" },
  variants: { en: "Variants", sq: "Variantet" },
  warranty: { en: "Warranty", sq: "Garancia" },
  function: { en: "Function", sq: "Funksioni" },
  functions: { en: "Functions", sq: "Funksionet" },
  usage: { en: "Usage", sq: "Përdorimi" },
  colour_options: { en: "Colour options", sq: "Opsionet e ngjyrave" },
  construction: { en: "Construction", sq: "Konstruksioni" },
  features: { en: "Features", sq: "Veçoritë" },
};

const UNIT = {
  mm: "mm", m: "m", m2: "m²", kg: "kg", W: "W", Nm: "N·m", dB: "dB",
  kgCO2: "kg CO₂", g: "g",
};

// Generic EN humaniser for keys not in LABELS: detect a trailing unit token,
// render the rest as a capitalised phrase.
function humanizeEN(key) {
  let parts = key.split("_");
  let unit = null;
  // W_m2K compound unit
  if (parts.length >= 3 && parts.at(-1) === "m2K" && parts.at(-2) === "W") {
    unit = "W/m²K";
    parts = parts.slice(0, -2);
  } else if (UNIT[parts.at(-1)]) {
    unit = UNIT[parts.at(-1)];
    parts = parts.slice(0, -1);
  }
  const words = parts.join(" ").replace(/\bmax\b/gi, "max").trim();
  const phrase = words.charAt(0).toUpperCase() + words.slice(1);
  return unit ? `${phrase} (${unit})` : phrase;
}

export function labelFor(key, locale) {
  const entry = LABELS[key];
  if (entry) return locale === "sq" ? entry.sq : entry.en;
  const en = humanizeEN(key);
  return locale === "sq" ? en : en; // SQ falls back to EN (flagged in sq-review.json)
}

// True when the SQ label for this key is just the EN fallback (needs review).
export function sqLabelIsFallback(key) {
  return !LABELS[key];
}

export function formatValue(v) {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(formatValue).filter(Boolean).join(", ");
  if (typeof v === "object") {
    return Object.entries(v)
      .map(([k, val]) => `${humanizeEN(k)}: ${formatValue(val)}`)
      .join("; ");
  }
  return String(v).trim();
}
