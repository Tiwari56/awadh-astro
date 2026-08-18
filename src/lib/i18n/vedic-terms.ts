/**
 * Display-layer Hindi translations for classical Vedic terms. Applied at
 * render time over whatever string a provider (mock or Prokerala English
 * fallback) returned, so Hindi results work even without live API keys —
 * this doesn't require touching provider logic. When Prokerala IS configured
 * with locale=hi we additionally pass language=hi to the API itself (see
 * astrology/providers/prokerala.ts) so its own descriptive text comes back
 * native Hindi too; these maps cover the fixed vocabulary either way.
 */

// 12 rashis — matches the "Mesha (Aries)" style strings our providers return.
const RASHI_HI: Record<string, string> = {
  "Mesha (Aries)": "मेष", "Vrishabha (Taurus)": "वृषभ", "Mithuna (Gemini)": "मिथुन",
  "Karka (Cancer)": "कर्क", "Simha (Leo)": "सिंह", "Kanya (Virgo)": "कन्या",
  "Tula (Libra)": "तुला", "Vrishchika (Scorpio)": "वृश्चिक", "Dhanu (Sagittarius)": "धनु",
  "Makara (Capricorn)": "मकर", "Kumbha (Aquarius)": "कुंभ", "Meena (Pisces)": "मीन",
};

const NAKSHATRA_HI: Record<string, string> = {
  Ashwini: "अश्विनी", Bharani: "भरणी", Krittika: "कृत्तिका", Rohini: "रोहिणी",
  Mrigashira: "मृगशिरा", Ardra: "आर्द्रा", Punarvasu: "पुनर्वसु", Pushya: "पुष्य",
  Ashlesha: "आश्लेषा", Magha: "मघा", "Purva Phalguni": "पूर्व फाल्गुनी", "Uttara Phalguni": "उत्तर फाल्गुनी",
  Hasta: "हस्त", Chitra: "चित्रा", Swati: "स्वाति", Vishakha: "विशाखा",
  Anuradha: "अनुराधा", Jyeshtha: "ज्येष्ठा", Mula: "मूल", "Purva Ashadha": "पूर्वाषाढ़ा",
  "Uttara Ashadha": "उत्तराषाढ़ा", Shravana: "श्रवण", Dhanishta: "धनिष्ठा", Shatabhisha: "शतभिषा",
  "Purva Bhadrapada": "पूर्व भाद्रपद", "Uttara Bhadrapada": "उत्तर भाद्रपद", Revati: "रेवती",
};

const PLANET_HI: Record<string, string> = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु",
  Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
  // The ascendant is listed alongside the grahas in the positions table.
  Ascendant: "लग्न",
};

/** Short glyphs for the birth chart's cramped house cells, per locale. */
const PLANET_ABBR_EN: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke", Ascendant: "As",
};
const PLANET_ABBR_HI: Record<string, string> = {
  Sun: "सू", Moon: "चं", Mars: "मं", Mercury: "बु", Jupiter: "गु",
  Venus: "शु", Saturn: "श", Rahu: "रा", Ketu: "के", Ascendant: "ल",
};

const TITHI_HI: Record<string, string> = {
  Pratipada: "प्रतिपदा", Dwitiya: "द्वितीया", Tritiya: "तृतीया", Chaturthi: "चतुर्थी",
  Panchami: "पंचमी", Shashthi: "षष्ठी", Saptami: "सप्तमी", Ashtami: "अष्टमी",
  Navami: "नवमी", Dashami: "दशमी", Ekadashi: "एकादशी", Dwadashi: "द्वादशी",
  Trayodashi: "त्रयोदशी", Chaturdashi: "चतुर्दशी", Purnima: "पूर्णिमा", Amavasya: "अमावस्या",
};

const VARA_HI: Record<string, string> = {
  Sunday: "रविवार", Monday: "सोमवार", Tuesday: "मंगलवार", Wednesday: "बुधवार",
  Thursday: "गुरुवार", Friday: "शुक्रवार", Saturday: "शनिवार",
};

const KARANA_HI: Record<string, string> = {
  Bava: "बव", Balava: "बालव", Kaulava: "कौलव", Taitila: "तैतिल",
  Gara: "गर", Vanija: "वणिज", Vishti: "विष्टि", Shakuni: "शकुनि",
  Chatushpada: "चतुष्पद", Naga: "नाग", Kimstughna: "किंस्तुघ्न",
};

const DIGNITY_HI: Record<string, string> = {
  Exalted: "उच्च", "Own Sign": "स्वराशि", Friendly: "मित्र राशि",
  Neutral: "सम राशि", Enemy: "शत्रु राशि", Debilitated: "नीच",
};

/** Best-effort Hindi lookup — falls back to the original English string if untranslated. */
function tr(dict: Record<string, string>, value: string): string {
  return dict[value] ?? value;
}

// Lucky-factor vocabulary (mock provider's illustrative gem/colour/direction lists).
const GEM_HI: Record<string, string> = {
  Ruby: "माणिक्य", Pearl: "मोती", "Red Coral": "मूंगा", Emerald: "पन्ना",
  "Yellow Sapphire": "पुखराज", Diamond: "हीरा", "Blue Sapphire": "नीलम",
  Hessonite: "गोमेद", "Cat's Eye": "लहसुनिया",
};
const COLOR_HI: Record<string, string> = {
  Saffron: "केसरिया", White: "सफ़ेद", Red: "लाल", Green: "हरा",
  "Golden Yellow": "सुनहरा पीला", "Sky Blue": "आसमानी नीला", "Deep Blue": "गहरा नीला",
};
const DIRECTION_HI: Record<string, string> = {
  East: "पूर्व", "North-East": "उत्तर-पूर्व", North: "उत्तर", "North-West": "उत्तर-पश्चिम",
  West: "पश्चिम", "South-West": "दक्षिण-पश्चिम", South: "दक्षिण", "South-East": "दक्षिण-पूर्व",
};

const SEVERITY_HI: Record<string, string> = {
  None: "कोई नहीं", Low: "निम्न", Moderate: "मध्यम", High: "उच्च",
};

/**
 * Every yoga name Prokerala's /kundli/advanced endpoint can return (verified
 * against a live response — 4 categories, 21 yogas total; this is the
 * complete closed set, not a partial guess). Passing `language=hi` to
 * Prokerala does NOT localize these free-text name/description fields, so
 * without this dictionary a Hindi user reading their kundali sees English
 * paragraphs mid-sentence — this is why it exists as a full lookup rather
 * than a fallback.
 */
const YOGA_NAME_HI: Record<string, string> = {
  "Gajakesari Yoga": "गजकेसरी योग", "Kedara Yoga": "केदार योग", "Kahala Yoga": "कहल योग",
  "Kamal Yoga": "कमल योग", "Musala Yoga": "मूसल योग", "Raja Yoga": "राज योग",
  "Ruchaka Yoga": "रुचक योग", "Bhadra Yoga": "भद्र योग", "Hamsa Yoga": "हंस योग",
  "Malavya Yoga": "मालव्य योग", "Sasa Yoga": "शश योग",
  "Sunapha Yoga": "सुनफा योग", "Anapha Yoga": "अनफा योग", "Duradhara Yoga": "दुरुधरा योग",
  "Kemadruma Yoga": "केमद्रुम योग",
  "Vesi Yoga": "वेसि योग", "Vasi Yoga": "वासि योग", "Ubhaya Chari Yoga": "उभयचरी योग",
  "Daridra Yoga": "दरिद्र योग", "Grahan Yoga": "ग्रहण योग", "Shakat Yoga": "शकट योग",
};

/** Concise, accurate classical descriptions — not a machine translation of Prokerala's English text. */
const YOGA_DESC_HI: Record<string, string> = {
  "Gajakesari Yoga": "चंद्रमा से केंद्र भाव (1, 4, 7 या 10) में गुरु स्थित होने पर बनता है — बुद्धि, यश और नेतृत्व क्षमता प्रदान करता है।",
  "Kedara Yoga": "जब सभी ग्रह किन्हीं चार राशियों में सीमित हों तब बनता है — स्थिरता और परिश्रम से समृद्धि का सूचक।",
  "Kahala Yoga": "गुरु और चतुर्थ भाव के स्वामी का केंद्र भावों में परस्पर संबंध बनने पर होता है — साहस व नेतृत्व देता है।",
  "Kamal Yoga": "जब सभी ग्रह केंद्र भावों (1, 4, 7, 10) में स्थित हों — सम्मान, स्थायित्व और समृद्धि का दुर्लभ योग।",
  "Musala Yoga": "जब ग्रह चर, स्थिर व द्विस्वभाव राशियों में संतुलित रूप से फैले हों — दृढ़ता और अनुशासन का प्रतीक।",
  "Raja Yoga": "केंद्र (1,4,7,10) और त्रिकोण (1,5,9) भावों के स्वामियों के संबंध से बनता है — सामाजिक प्रतिष्ठा, अधिकार व सफलता प्रदान करता है।",
  "Ruchaka Yoga": "पंचमहापुरुष योगों में से एक — मंगल अपनी राशि या उच्च राशि में केंद्र भाव में हो तो बनता है; साहस, ऊर्जा व नेतृत्व का योग।",
  "Bhadra Yoga": "पंचमहापुरुष योग — बुध अपनी या उच्च राशि में केंद्र भाव में हो तो बनता है; बुद्धि, वाणी-कौशल व व्यापार में सफलता देता है।",
  "Hamsa Yoga": "पंचमहापुरुष योग — गुरु अपनी या उच्च राशि में केंद्र भाव में हो तो बनता है; ज्ञान, सदाचार व आध्यात्मिकता का योग।",
  "Malavya Yoga": "पंचमहापुरुष योग — शुक्र अपनी या उच्च राशि में केंद्र भाव में हो तो बनता है; सुख, सौंदर्य, कला व वैभव प्रदान करता है।",
  "Sasa Yoga": "पंचमहापुरुष योग — शनि अपनी या उच्च राशि में केंद्र भाव में हो तो बनता है; अनुशासन, अधिकार व दीर्घकालिक सफलता का योग।",
  "Sunapha Yoga": "चंद्रमा से द्वितीय भाव में सूर्य के अतिरिक्त कोई ग्रह स्थित हो — धन-लाभ, बुद्धिमत्ता व आत्मनिर्भरता का सूचक।",
  "Anapha Yoga": "चंद्रमा से द्वादश भाव में सूर्य के अतिरिक्त कोई ग्रह स्थित हो — अच्छा स्वास्थ्य, यश व संतुलित स्वभाव देता है।",
  "Duradhara Yoga": "चंद्रमा के दोनों ओर (द्वितीय व द्वादश भाव में) ग्रह स्थित हों — सुख-समृद्धि व सहयोग प्राप्त होने का योग।",
  "Kemadruma Yoga": "चंद्रमा के दोनों ओर (द्वितीय व द्वादश भाव) कोई ग्रह न हो — संघर्ष व अस्थिरता का संकेत, अन्य शुभ योगों व उपायों से इसका प्रभाव कम हो सकता है।",
  "Vesi Yoga": "सूर्य से द्वितीय भाव में चंद्रमा के अतिरिक्त कोई ग्रह स्थित हो — स्पष्टवादिता व कर्मशीलता का योग।",
  "Vasi Yoga": "सूर्य से द्वादश भाव में चंद्रमा के अतिरिक्त कोई ग्रह स्थित हो — नीतिपरायणता, यश व उदारता प्रदान करता है।",
  "Ubhaya Chari Yoga": "सूर्य के दोनों ओर ग्रह स्थित होने पर बनता है (वेसि व वासि दोनों की स्थिति) — राजकीय सम्मान व प्रभाव का सूचक।",
  "Daridra Yoga": "लग्नेश और द्वादश भाव के स्वामी के विशेष संबंध से बनता है — आर्थिक चुनौतियों का संकेत; उपाय व अन्य शुभ योगों से प्रभाव कम हो सकता है।",
  "Grahan Yoga": "सूर्य या चंद्रमा राहु अथवा केतु के साथ एक ही भाव में स्थित हों — मानसिक उलझन या आत्मविश्वास में कमी का सूचक; उपाय से शमन संभव।",
  "Shakat Yoga": "चंद्रमा से षष्ठ या अष्टम भाव में गुरु स्थित होने पर बनता है — जीवन में उतार-चढ़ाव का सूचक।",
};

const YOGA_CATEGORY_HI: Record<string, string> = {
  "Major Yogas": "प्रमुख योग", "Chandra Yogas": "चंद्र योग",
  "Soorya Yogas": "सूर्य योग", "Inauspicious Yogas": "अशुभ योग",
};

/** Sidereal signs in zodiac order — index 0 = Mesha. Shared so the chart and the positions table agree. */
export const SIGN_ORDER = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)",
  "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)",
  "Tula (Libra)", "Vrishchika (Scorpio)", "Dhanu (Sagittarius)",
  "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)",
];

/** Zero-based index of a "Sanskrit (English)" sign label, or null. */
export function signIndex(label: string): number | null {
  const i = SIGN_ORDER.indexOf(label);
  return i >= 0 ? i : null;
}

/**
 * Sade Sati phase, detected from OUR OWN generated English summary text (see
 * providers/prokerala.ts's computeSadeSati — not Prokerala's raw text, and
 * not user input), which always contains exactly one of these three words.
 * severity alone can't distinguish rising vs. setting (both are "Moderate"),
 * so this recovers the detail a pure severity-based Hindi message would lose.
 */
function sadeSatiPhase(summary: string): "rising" | "peak" | "setting" | null {
  if (summary.includes("peak")) return "peak";
  if (summary.includes("rising")) return "rising";
  if (summary.includes("setting")) return "setting";
  return null;
}

/**
 * Dosha paragraphs, written directly in Hindi rather than translated —
 * Prokerala's free-text description/remedy fields stay English regardless of
 * the `language` request param, so a literal translation would still embed
 * English fragments. These convey the same meaning using the dosha's
 * present/severity fields, which we control fully.
 */
function mangalDoshaHi(present: boolean, severity: string): string {
  if (!present) return "आपकी कुंडली में मंगल दोष (मांगलिक) नहीं है — मंगल मांगलिक स्थिति में नहीं है।";
  if (severity === "Low") {
    return "मांगलिक दोष है, परंतु एक शास्त्रीय अपवाद (परिहार) के कारण इसका प्रभाव कम माना जाता है। विवाह से पूर्व किसी ज्योतिषी से अवश्य पुष्टि करें।";
  }
  return "मांगलिक दोष विद्यमान है — मंगल मांगलिक स्थिति में स्थित है। विवाह से पूर्व मंगल दोष निवारण पूजा की परंपरागत रूप से सलाह दी जाती है।";
}

function kaalSarpHi(present: boolean): string {
  return present
    ? "कुंडली में काल सर्प दोष विद्यमान है — सभी ग्रह राहु और केतु के मध्य स्थित हैं। नवग्रह शांति पूजा परंपरागत उपाय है।"
    : "कुंडली में काल सर्प दोष नहीं है।";
}

function sadeSatiHi(present: boolean, severity: string, summary: string): string {
  if (!present) return "आप वर्तमान में साढ़े साती में नहीं हैं — शनि आपकी चंद्र राशि के निकट गोचर नहीं कर रहा है।";
  const phase = sadeSatiPhase(summary);
  const phaseLabel =
    phase === "peak" ? "उठान (द्वितीय/चरम) चरण — परंपरागत रूप से सबसे प्रभावी अवधि"
    : phase === "rising" ? "प्रारंभिक (प्रथम) चरण"
    : phase === "setting" ? "समापन (तृतीय) चरण"
    : severity === "High" ? "चरम चरण" : "सक्रिय चरण";
  return `शनि वर्तमान में आपकी जन्म चंद्र राशि के सापेक्ष साढ़े साती के ${phaseLabel} में गोचर कर रहा है। यह धैर्य, अनुशासन और उपाय का समय है।`;
}

export const vedic = {
  rashi: (v: string) => tr(RASHI_HI, v),
  nakshatra: (v: string) => tr(NAKSHATRA_HI, v),
  planet: (v: string) => tr(PLANET_HI, v),
  planetAbbr: (v: string, hi: boolean) =>
    (hi ? PLANET_ABBR_HI : PLANET_ABBR_EN)[v] ?? v.slice(0, 2),
  tithi: (v: string) => tr(TITHI_HI, v),
  vara: (v: string) => tr(VARA_HI, v),
  karana: (v: string) => tr(KARANA_HI, v),
  dignity: (v: string) => tr(DIGNITY_HI, v),
  gem: (v: string) => tr(GEM_HI, v),
  color: (v: string) => tr(COLOR_HI, v),
  direction: (v: string) => tr(DIRECTION_HI, v),
  severity: (v: string) => tr(SEVERITY_HI, v),
  yogaName: (v: string) => tr(YOGA_NAME_HI, v),
  yogaEffect: (v: string) => YOGA_DESC_HI[v] ?? "",
  yogaCategory: (v: string) => tr(YOGA_CATEGORY_HI, v),
  mangalDosha: mangalDoshaHi,
  kaalSarp: kaalSarpHi,
  sadeSati: sadeSatiHi,
};
