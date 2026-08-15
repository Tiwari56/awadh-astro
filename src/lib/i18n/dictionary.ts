/**
 * i18n scaffold — translates the shared chrome (header nav, bottom nav,
 * footer, language switcher) into 4 languages. Individual page BODY content
 * (kundali results, seva catalog, chat, etc.) is still English-only; wiring
 * useTranslation() into each page is the natural next step once this chrome
 * layer is validated. Hindi is reviewed carefully; Bengali/Marathi cover the
 * same short, common UI vocabulary but would benefit from a native-speaker
 * pass before shipping to those markets.
 */

export const LOCALES = ["en", "hi", "bn", "mr"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  hi: "हिंदी",
  bn: "বাংলা",
  mr: "मराठी",
};

export interface Dictionary {
  nav: {
    seva: string;
    consultations: string;
    freeServices: string;
    horoscope: string;
    plus: string;
    chatNow: string;
    freeKundali: string;
    kundaliMatching: string;
    aiChat: string;
    chatWithAstrologer: string;
    callAstrologer: string;
    dailyHoroscope: string;
  };
  bottomNav: {
    home: string;
    kundali: string;
    seva: string;
    talk: string;
    aiChat: string;
  };
  footer: {
    tagline: string;
    disclaimer: string;
    rights: string;
  };
  common: {
    ayodhya: string;
  };
}

const en: Dictionary = {
  nav: {
    seva: "Puja / Seva",
    consultations: "Consultations",
    freeServices: "Free Services",
    horoscope: "Horoscope",
    plus: "Awadh Plus",
    chatNow: "Chat Now",
    freeKundali: "Free Kundali",
    kundaliMatching: "Kundali Matching",
    aiChat: "AI Chat",
    chatWithAstrologer: "Chat with Astrologer",
    callAstrologer: "Call an Astrologer",
    dailyHoroscope: "Daily Horoscope",
  },
  bottomNav: { home: "Home", kundali: "Kundali", seva: "Seva", talk: "Talk", aiChat: "AI Chat" },
  footer: {
    tagline: "Ayodhya, Uttar Pradesh · India's sacred astrology platform",
    disclaimer: "Guidance is for informational and spiritual purposes only — not a substitute for medical, legal, or financial advice.",
    rights: "All rights reserved.",
  },
  common: { ayodhya: "Ayodhya, U.P." },
};

const hi: Dictionary = {
  nav: {
    seva: "पूजा / सेवा",
    consultations: "परामर्श",
    freeServices: "मुफ़्त सेवाएं",
    horoscope: "राशिफल",
    plus: "अवध प्लस",
    chatNow: "अभी चैट करें",
    freeKundali: "मुफ़्त कुंडली",
    kundaliMatching: "कुंडली मिलान",
    aiChat: "एआई चैट",
    chatWithAstrologer: "ज्योतिषी से चैट करें",
    callAstrologer: "ज्योतिषी को कॉल करें",
    dailyHoroscope: "दैनिक राशिफल",
  },
  bottomNav: { home: "होम", kundali: "कुंडली", seva: "सेवा", talk: "बात करें", aiChat: "एआई चैट" },
  footer: {
    tagline: "अयोध्या, उत्तर प्रदेश · भारत का पवित्र ज्योतिष मंच",
    disclaimer: "मार्गदर्शन केवल सूचनात्मक और आध्यात्मिक उद्देश्यों के लिए है — चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।",
    rights: "सर्वाधिकार सुरक्षित।",
  },
  common: { ayodhya: "अयोध्या, उ.प्र." },
};

const bn: Dictionary = {
  nav: {
    seva: "পূজা / সেবা",
    consultations: "পরামর্শ",
    freeServices: "ফ্রি পরিষেবা",
    horoscope: "রাশিফল",
    plus: "অবধ প্লাস",
    chatNow: "এখনই চ্যাট করুন",
    freeKundali: "ফ্রি কুষ্ঠি",
    kundaliMatching: "কুষ্ঠি মিলন",
    aiChat: "এআই চ্যাট",
    chatWithAstrologer: "জ্যোতিষীর সাথে চ্যাট করুন",
    callAstrologer: "জ্যোতিষীকে কল করুন",
    dailyHoroscope: "দৈনিক রাশিফল",
  },
  bottomNav: { home: "হোম", kundali: "কুষ্ঠি", seva: "সেবা", talk: "কথা বলুন", aiChat: "এআই চ্যাট" },
  footer: {
    tagline: "অযোধ্যা, উত্তর প্রদেশ · ভারতের পবিত্র জ্যোতিষ প্ল্যাটফর্ম",
    disclaimer: "নির্দেশনা শুধুমাত্র তথ্যগত ও আধ্যাত্মিক উদ্দেশ্যে — চিকিৎসা, আইনি বা আর্থিক পরামর্শের বিকল্প নয়।",
    rights: "সর্বস্বত্ব সংরক্ষিত।",
  },
  common: { ayodhya: "অযোধ্যা, উ.প্র." },
};

const mr: Dictionary = {
  nav: {
    seva: "पूजा / सेवा",
    consultations: "सल्लामसलत",
    freeServices: "मोफत सेवा",
    horoscope: "राशिभविष्य",
    plus: "अवध प्लस",
    chatNow: "आता चॅट करा",
    freeKundali: "मोफत कुंडली",
    kundaliMatching: "कुंडली जुळणी",
    aiChat: "एआय चॅट",
    chatWithAstrologer: "ज्योतिषाशी चॅट करा",
    callAstrologer: "ज्योतिषाला कॉल करा",
    dailyHoroscope: "दैनिक राशिभविष्य",
  },
  bottomNav: { home: "होम", kundali: "कुंडली", seva: "सेवा", talk: "बोला", aiChat: "एआय चॅट" },
  footer: {
    tagline: "अयोध्या, उत्तर प्रदेश · भारताचे पवित्र ज्योतिष व्यासपीठ",
    disclaimer: "मार्गदर्शन केवळ माहितीपर आणि आध्यात्मिक हेतूंसाठी आहे — वैद्यकीय, कायदेशीर किंवा आर्थिक सल्ल्याचा पर्याय नाही.",
    rights: "सर्व हक्क राखीव.",
  },
  common: { ayodhya: "अयोध्या, उ.प्र." },
};

export const DICTIONARIES: Record<Locale, Dictionary> = { en, hi, bn, mr };
