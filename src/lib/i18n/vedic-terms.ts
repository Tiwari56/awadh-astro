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

export const vedic = {
  rashi: (v: string) => tr(RASHI_HI, v),
  nakshatra: (v: string) => tr(NAKSHATRA_HI, v),
  planet: (v: string) => tr(PLANET_HI, v),
  tithi: (v: string) => tr(TITHI_HI, v),
  vara: (v: string) => tr(VARA_HI, v),
  karana: (v: string) => tr(KARANA_HI, v),
  dignity: (v: string) => tr(DIGNITY_HI, v),
  gem: (v: string) => tr(GEM_HI, v),
  color: (v: string) => tr(COLOR_HI, v),
  direction: (v: string) => tr(DIRECTION_HI, v),
};
