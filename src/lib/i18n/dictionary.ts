/**
 * Full-site i18n dictionary. Hindi is the priority locale (the Ayodhya
 * audience is largely Hindi-first) and is translated in full, including
 * kundali/matching result labels — the founder specifically called these out
 * as the ones that matter most. Bengali/Marathi cover the same vocabulary
 * with reasonable confidence but should get a native-speaker review pass
 * before being presented as launch-ready for those markets.
 *
 * This is intentionally a big hardcoded object for now ("keep it hardcoded,
 * we'll manage it from an admin panel in the next iteration" — founder's
 * words). When that panel exists, DICTIONARIES becomes the seed data for a
 * CMS-backed version of the same shape.
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
    seva: string; consultations: string; freeServices: string; horoscope: string; plus: string;
    chatNow: string; freeKundali: string; kundaliMatching: string; aiChat: string;
    chatWithAstrologer: string; callAstrologer: string; dailyHoroscope: string;
  };
  bottomNav: { home: string; kundali: string; seva: string; talk: string; aiChat: string };
  footer: { tagline: string; disclaimer: string; rights: string };
  common: {
    ayodhya: string; loading: string; save: string; cancel: string; submit: string;
    optional: string; opensNewTab: string;
  };
  home: {
    heroEyebrow: string; heroHindiLine: string; heroTitleLine1: string; heroTitleLine2: string;
    heroTagline: string; ctaFreeKundali: string; ctaChatAstrologer: string;
    statAstrologers: string; statUsers: string; statConsultations: string; statRating: string;
    trustVerified: string; trustLive: string; trustPrasad: string; trustSecure: string; trustLanguages: string;
    zodiacEyebrow: string; zodiacTitle: string; zodiacSub: string;
    luckyColor: string; luckyNumber: string; energy: string; readFull: string;
    statAstrologersLabel: string; statUsersLabel: string; statConsultationsLabel: string; statLanguagesLabel: string;
    astroEyebrow: string; astroTitle: string; astroSub: string; viewAll: string; chatBtn: string; callBtn: string; seeAllAstrologers: string;
    servicesEyebrow: string; servicesTitle: string; servicesSub: string;
    pujaEyebrow: string; pujaTitle: string; pujaSub: string; bookNow: string; onwards: string;
    testimonialsEyebrow: string; testimonialsTitle: string; testimonialsSub: string;
    aboutEyebrow: string; aboutTitle: string; aboutSub: string; ourStory: string; storyText: string;
    contactTitle: string; supportHours: string;
    appEyebrow: string; appTitle: string; appSub: string;
  };
  kundali: {
    pageTitle: string; fullName: string; namePlaceholder: string; dateOfBirth: string; timeOfBirth: string;
    timeUnknownLabel: string; timeUnknownNote: string; placeOfBirth: string; placePlaceholder: string;
    gender: string; male: string; female: string; other: string; generate: string; computing: string;
    resultFor: string; timeUnknownBanner: string;
    tabBasic: string; tabChart: string; tabPanchang: string; tabDasha: string; tabDoshas: string; tabPlanets: string; tabReport: string;
    ascendant: string; moonSign: string; sunSign: string; nakshatra: string; currentDasha: string;
    luckyFactors: string; luckyGem: string; luckyNumber: string; luckyColor: string; favorableDirection: string;
    chartTitle: string; chartNote: string;
    panchangTitle: string; tithi: string; vaara: string; yoga: string; karana: string; moonPhase: string;
    dashaTitle: string; mahadasha: string; antardashaCurrent: string;
    doshaTitle: string; mangalDosha: string; sadeSati: string; kaalSarp: string; present: string; clear: string;
    yogasTitle: string; planetsTitle: string;
    planetCol: string; signCol: string; houseCol: string; degreeCol: string; nakshatraCol: string; padaCol: string; dignityCol: string; retroCol: string;
    reportTitle: string; reportDesc: string; downloadPdf: string;
    disclaimer: string; discussAstrologer: string; bookRemedy: string; newKundali: string;
    suggestedRemedy: string; book: string;
  };
  match: {
    pageTitle: string; subtitle: string; guideToggle: string; guideIntro: string; howToRead: string; guideFooter: string;
    bride: string; brideHi: string; groom: string; groomHi: string;
    uploadLabel: string; uploadCta: string; uploadNote: string;
    matchButton: string; matching: string;
    percentOf: string; guna: string;
    ashtakootBreakdown: string; noDoshaConflict: string; doshaMismatch: string; verdict: string;
    bookRemedy: string; consultMarriageAstrologer: string; newMatch: string; disclaimer: string;
  };
  seva: {
    pageTitle: string; intro: string; verifiedBadge: string;
    mostRequested: string; liveVideo: string; shipsWorldwide: string; bookSeva: string;
    devoteeName: string; devoteeNamePlaceholder: string; gotra: string; sankalp: string; sankalpPlaceholder: string;
    preferredDate: string; muhuratNote: string; addonsLabel: string;
    yourCity: string; shippingCountry: string; shippingAddress: string; shippingAddressPlaceholder: string;
    liveStream: string; total: string; offerSankalp: string; paymentNote: string;
    promoCode: string; applyPromo: string;
    modeLabel: string; modeOnline: string; modeOffline: string; payWallet: string; payCash: string;
    walletBalance: string; insufficientBalance: string; payNow: string; viewMyBookings: string;
    suggestedForYou: string; remedyBookedNote: string;
  };
  astrologers: { pageTitle: string; onlineNow: string; firstMinuteFree: string; marriageAstrologers: string; noMatch: string };
  plus: { pageTitle: string; subtitle: string; currentPlan: string; subscribe: string; paymentNote: string };
  chat: { welcome: string; placeholder: string; send: string; disclaimer: string; consulting: string };
  tracking: {
    pageTitle: string; empty: string; viewMyBookings: string; bookedOn: string;
    statusRequested: string; statusMuhuratConfirmed: string; statusPerformed: string; statusPrasadShipped: string; statusDelivered: string;
  };
}

const en: Dictionary = {
  nav: {
    seva: "Puja / Seva", consultations: "Consultations", freeServices: "Free Services", horoscope: "Horoscope",
    plus: "Awadh Plus", chatNow: "Chat Now", freeKundali: "Free Kundali", kundaliMatching: "Kundali Matching",
    aiChat: "AI Chat", chatWithAstrologer: "Chat with Astrologer", callAstrologer: "Call an Astrologer", dailyHoroscope: "Daily Horoscope",
  },
  bottomNav: { home: "Home", kundali: "Kundali", seva: "Seva", talk: "Talk", aiChat: "AI Chat" },
  footer: {
    tagline: "Ayodhya, Uttar Pradesh · India's sacred astrology platform",
    disclaimer: "Guidance is for informational and spiritual purposes only — not a substitute for medical, legal, or financial advice.",
    rights: "All rights reserved.",
  },
  common: { ayodhya: "Ayodhya, U.P.", loading: "Loading…", save: "Save", cancel: "Cancel", submit: "Submit", optional: "optional", opensNewTab: "opens in a new tab" },
  home: {
    heroEyebrow: "Ayodhya-Verified Astrologers · Online Now", heroHindiLine: "श्री राम की नगरी से — ज्योतिष की सेवा",
    heroTitleLine1: "Sacred Wisdom", heroTitleLine2: "from the Land of Shri Ram",
    heroTagline: "India's most trusted Ayodhya astrology platform — free kundali, live consultations with verified pandits, AI guidance, and auspicious-day alerts.",
    ctaFreeKundali: "Get My Free Kundali", ctaChatAstrologer: "Chat with Astrologer",
    statAstrologers: "Astrologers", statUsers: "Happy Users", statConsultations: "Consultations", statRating: "App Rating",
    trustVerified: "Ayodhya-verified pandits", trustLive: "Watch rituals live", trustPrasad: "Prasad to your door",
    trustSecure: "100% secure payments", trustLanguages: "4 languages",
    zodiacEyebrow: "Daily Horoscope", zodiacTitle: "What do the stars say today?", zodiacSub: "Click your sign to see your personalized reading.",
    luckyColor: "Lucky Color", luckyNumber: "Lucky Number", energy: "Energy", readFull: "Read full horoscope",
    statAstrologersLabel: "Verified Astrologers", statUsersLabel: "Happy Users", statConsultationsLabel: "Consultations Done", statLanguagesLabel: "Languages Supported",
    astroEyebrow: "Live Now", astroTitle: "Talk to Astrologers", astroSub: "Verified Ayodhya pandits available right now. First minute free for new users.",
    viewAll: "View all", chatBtn: "Chat", callBtn: "Call", seeAllAstrologers: "See all Astrologers",
    servicesEyebrow: "Free & Premium", servicesTitle: "Everything on One Platform", servicesSub: "Astrology, rituals, AI, and divine guidance — all in one sacred place.",
    pujaEyebrow: "Live from Ayodhya", pujaTitle: "🔱 Online Pujas", pujaSub: "A verified pandit performs your ritual live in a real Ayodhya temple. You watch on video. Prasad reaches home.",
    bookNow: "Book Now", onwards: "onwards",
    testimonialsEyebrow: "User Reviews", testimonialsTitle: "Trusted by Millions", testimonialsSub: "Real people, real transformations — guided by Ayodhya's sacred wisdom.",
    aboutEyebrow: "Who We Are", aboutTitle: "About Awadh Astro", aboutSub: "Rooted in Ayodhya, built for anyone seeking clarity from Vedic wisdom.",
    ourStory: "Our Story",
    storyText: "Awadh Astro was founded in Ayodhya — the land of Shri Ram — to bring authentic, temple-verified Vedic guidance to devotees everywhere, whether they can visit in person or only through a screen. Every astrologer on our platform is vetted for credentials and lineage before being marked “Ayodhya Verified.”",
    contactTitle: "Get in Touch", supportHours: "Support available 7:00 AM – 11:00 PM IST, every day",
    appEyebrow: "Download the App", appTitle: "Take Ayodhya's Wisdom Everywhere", appSub: "Free consultations, live pujas, and daily guidance at your fingertips. 10 million+ downloads.",
  },
  kundali: {
    pageTitle: "Free Kundali & Birth Chart", fullName: "Full Name", namePlaceholder: "e.g. Nishit Tiwari",
    dateOfBirth: "Date of Birth", timeOfBirth: "Time of Birth", timeUnknownLabel: "I don't know my exact birth time",
    timeUnknownNote: "We'll use 12:00 noon as a standard approximation. Your Moon sign and nakshatra will still be accurate; Ascendant and house positions become approximate.",
    placeOfBirth: "Place of Birth", placePlaceholder: "Start typing a city…",
    gender: "Gender", male: "Male", female: "Female", other: "Other", generate: "Generate Kundali", computing: "Computing…",
    resultFor: "Kundali for", timeUnknownBanner: "⚠️ Birth time unknown — computed using 12:00 noon. Ascendant and house placements shown below are approximate; Moon sign and nakshatra remain accurate.",
    tabBasic: "Basic", tabChart: "Chart", tabPanchang: "Panchang", tabDasha: "Dasha", tabDoshas: "Doshas", tabPlanets: "Planets", tabReport: "Report",
    ascendant: "Ascendant (Lagna)", moonSign: "Moon Sign (Rashi)", sunSign: "Sun Sign", nakshatra: "Nakshatra", currentDasha: "Current Dasha",
    luckyFactors: "Your Lucky Factors", luckyGem: "Lucky Gem", luckyNumber: "Lucky Number", luckyColor: "Lucky Color", favorableDirection: "Favorable Direction",
    chartTitle: "Birth Chart (North Indian)", chartNote: "House 1 (top) is your Ascendant. Planet positions are shown by house, following the standard North Indian chart convention.",
    panchangTitle: "Birth Panchang", tithi: "Tithi", vaara: "Vaara (Weekday)", yoga: "Yoga", karana: "Karana", moonPhase: "Moon Phase",
    dashaTitle: "Vimshottari Dasha", mahadasha: "Mahadasha", antardashaCurrent: "Antardasha (current)",
    doshaTitle: "Dosha & Transit Check", mangalDosha: "Mangal Dosha (Manglik)", sadeSati: "Sade Sati", kaalSarp: "Kaal Sarp Dosha", present: "Present", clear: "Clear",
    yogasTitle: "Notable Yogas", planetsTitle: "Planetary Positions",
    planetCol: "Planet", signCol: "Sign", houseCol: "House", degreeCol: "Degree", nakshatraCol: "Nakshatra", padaCol: "Pada", dignityCol: "Dignity", retroCol: "Retro",
    reportTitle: "Your Complete Kundali Report", reportDesc: "Downloads every section above — birth details, chart, panchang, dashas, dosha check, and full planetary positions — as a single printable, devotionally styled report.",
    downloadPdf: "Download PDF Report",
    disclaimer: "For informational and spiritual purposes only. For a personalized reading of what these placements mean, consult an Ayodhya-verified astrologer.",
    discussAstrologer: "Discuss with an Astrologer", bookRemedy: "Book a Remedial Puja", newKundali: "New Kundali",
    suggestedRemedy: "Suggested remedy", book: "Book",
  },
  match: {
    pageTitle: "Kundali Matching", subtitle: "Ashtakoot Guna Milan — the 36-point Vedic compatibility system used for marriage.",
    guideToggle: "Why does Kundali Matching matter?", guideIntro: "Ashtakoot Guna Milan compares the bride's and groom's Moon-sign placements across 8 factors (“kootas”), each worth a fixed number of points, for 36 total.",
    howToRead: "How to read your score: 18+/36 is generally considered acceptable, 25+ very good, and 32+ excellent.",
    guideFooter: "This is one input among many for a marriage decision, not a verdict.",
    bride: "Bride", brideHi: "वधू", groom: "Groom", groomHi: "वर",
    uploadLabel: "Have an existing Kundali?", uploadCta: "Upload to share with your astrologer",
    uploadNote: "We can't auto-read birth details from an uploaded chart yet — please still fill the fields above so we can compute the match instantly.",
    matchButton: "Match Kundalis", matching: "Matching…",
    percentOf: "%", guna: "Guna", ashtakootBreakdown: "Ashtakoot breakdown",
    noDoshaConflict: "No Mangal Dosha conflict", doshaMismatch: "Mangal Dosha mismatch", verdict: "Verdict.",
    bookRemedy: "Book a Remedial Puja", consultMarriageAstrologer: "Consult a Marriage Astrologer", newMatch: "New Match",
    disclaimer: "For informational and spiritual purposes only. Compatibility is one of many factors in a marriage.",
  },
  seva: {
    pageTitle: "Seva — Puja in Ayodhya, in Your Name", intro: "Cannot travel to Ayodhya? Have a puja performed for you by a verified pandit in a real Ayodhya temple — streamed live, with prasad couriered to your door, anywhere in the world.",
    verifiedBadge: "Performed by Ayodhya-Verified Pandits", mostRequested: "Most Requested", liveVideo: "Live video", shipsWorldwide: "Ships worldwide", bookSeva: "Book Seva",
    devoteeName: "Devotee Name (for the sankalp)", devoteeNamePlaceholder: "Name the puja is performed for",
    gotra: "Gotra", sankalp: "Your Sankalp / Wish", sankalpPlaceholder: "e.g. Good health for my mother",
    preferredDate: "Preferred Date", muhuratNote: "we confirm the muhurat", addonsLabel: "Add-on Services",
    yourCity: "Your City", shippingCountry: "Prasad Shipping Country", shippingAddress: "Shipping Address", shippingAddressPlaceholder: "House / street / landmark",
    liveStream: "Stream the puja live to me (video call)", total: "Total", offerSankalp: "Offer Sankalp",
    paymentNote: "Payment is collected after we confirm your muhurat. Spiritual service; no outcome is guaranteed.",
    promoCode: "Promo Code", applyPromo: "Apply",
    modeLabel: "How would you like this performed?", modeOnline: "Online (Live Stream)", modeOffline: "In-Person at My Location",
    payWallet: "Pay via Wallet", payCash: "Cash before the puja begins",
    walletBalance: "Wallet Balance", insufficientBalance: "Insufficient wallet balance. Add money to your wallet to continue (coming soon).",
    payNow: "Pay & Offer Sankalp", viewMyBookings: "View My Bookings", suggestedForYou: "Suggested for You", remedyBookedNote: "This addresses the dosha we flagged in your kundali.",
  },
  astrologers: { pageTitle: "Talk to an Astrologer", onlineNow: "astrologers online now", firstMinuteFree: "first minute free for new users.", marriageAstrologers: "Marriage Astrologers", noMatch: "No astrologers match these filters right now — try widening your search." },
  plus: { pageTitle: "Awadh Plus", subtitle: "Your kundali, working for you every day.", currentPlan: "Current Plan", subscribe: "Subscribe", paymentNote: "Payments will be processed via Razorpay (UPI, cards, net banking). Cancel anytime." },
  chat: { welcome: "Namaste 🙏 I am your Awadh Astro AI guide. Ask me anything about your kundali, an upcoming decision, or today's panchang.", placeholder: "Ask about your kundali, career, marriage…", send: "Send", disclaimer: "You are chatting with an AI. Guidance is spiritual/informational only.", consulting: "Consulting the stars…" },
  tracking: {
    pageTitle: "My Bookings", empty: "You haven't booked any seva yet.", viewMyBookings: "View My Bookings", bookedOn: "Booked on",
    statusRequested: "Requested", statusMuhuratConfirmed: "Muhurat Confirmed", statusPerformed: "Puja Performed",
    statusPrasadShipped: "Prasad Shipped", statusDelivered: "Delivered",
  },
};

const hi: Dictionary = {
  nav: {
    seva: "पूजा / सेवा", consultations: "परामर्श", freeServices: "मुफ़्त सेवाएं", horoscope: "राशिफल",
    plus: "अवध प्लस", chatNow: "अभी चैट करें", freeKundali: "मुफ़्त कुंडली", kundaliMatching: "कुंडली मिलान",
    aiChat: "एआई चैट", chatWithAstrologer: "ज्योतिषी से चैट करें", callAstrologer: "ज्योतिषी को कॉल करें", dailyHoroscope: "दैनिक राशिफल",
  },
  bottomNav: { home: "होम", kundali: "कुंडली", seva: "सेवा", talk: "बात करें", aiChat: "एआई चैट" },
  footer: {
    tagline: "अयोध्या, उत्तर प्रदेश · भारत का पवित्र ज्योतिष मंच",
    disclaimer: "मार्गदर्शन केवल सूचनात्मक और आध्यात्मिक उद्देश्यों के लिए है — चिकित्सा, कानूनी या वित्तीय सलाह का विकल्प नहीं।",
    rights: "सर्वाधिकार सुरक्षित।",
  },
  common: { ayodhya: "अयोध्या, उ.प्र.", loading: "लोड हो रहा है…", save: "सहेजें", cancel: "रद्द करें", submit: "सबमिट करें", optional: "वैकल्पिक", opensNewTab: "नए टैब में खुलेगा" },
  home: {
    heroEyebrow: "अयोध्या-सत्यापित ज्योतिषी · अभी ऑनलाइन", heroHindiLine: "श्री राम की नगरी से — ज्योतिष की सेवा",
    heroTitleLine1: "पवित्र ज्ञान", heroTitleLine2: "श्री राम की नगरी से",
    heroTagline: "भारत का सबसे भरोसेमंद अयोध्या ज्योतिष मंच — मुफ़्त कुंडली, सत्यापित पंडितों से लाइव परामर्श, एआई मार्गदर्शन और शुभ मुहूर्त अलर्ट।",
    ctaFreeKundali: "मेरी मुफ़्त कुंडली पाएं", ctaChatAstrologer: "ज्योतिषी से चैट करें",
    statAstrologers: "ज्योतिषी", statUsers: "संतुष्ट उपयोगकर्ता", statConsultations: "परामर्श", statRating: "ऐप रेटिंग",
    trustVerified: "अयोध्या-सत्यापित पंडित", trustLive: "अनुष्ठान लाइव देखें", trustPrasad: "प्रसाद आपके द्वार तक",
    trustSecure: "100% सुरक्षित भुगतान", trustLanguages: "4 भाषाएं",
    zodiacEyebrow: "दैनिक राशिफल", zodiacTitle: "आज सितारे क्या कहते हैं?", zodiacSub: "अपनी व्यक्तिगत राशिफल देखने के लिए अपनी राशि पर क्लिक करें।",
    luckyColor: "शुभ रंग", luckyNumber: "शुभ अंक", energy: "ऊर्जा", readFull: "पूरा राशिफल पढ़ें",
    statAstrologersLabel: "सत्यापित ज्योतिषी", statUsersLabel: "संतुष्ट उपयोगकर्ता", statConsultationsLabel: "पूर्ण परामर्श", statLanguagesLabel: "समर्थित भाषाएं",
    astroEyebrow: "अभी लाइव", astroTitle: "ज्योतिषी से बात करें", astroSub: "सत्यापित अयोध्या पंडित अभी उपलब्ध हैं। नए उपयोगकर्ताओं के लिए पहला मिनट मुफ़्त।",
    viewAll: "सभी देखें", chatBtn: "चैट", callBtn: "कॉल", seeAllAstrologers: "सभी ज्योतिषी देखें",
    servicesEyebrow: "मुफ़्त और प्रीमियम", servicesTitle: "एक ही मंच पर सब कुछ", servicesSub: "ज्योतिष, अनुष्ठान, एआई और दिव्य मार्गदर्शन — सब एक पवित्र स्थान पर।",
    pujaEyebrow: "अयोध्या से लाइव", pujaTitle: "🔱 ऑनलाइन पूजा", pujaSub: "एक सत्यापित पंडित आपकी पूजा वास्तविक अयोध्या मंदिर में लाइव करता है। आप वीडियो पर देखें। प्रसाद घर पहुंचे।",
    bookNow: "अभी बुक करें", onwards: "से शुरू",
    testimonialsEyebrow: "उपयोगकर्ता समीक्षाएं", testimonialsTitle: "लाखों का भरोसा", testimonialsSub: "असली लोग, असली बदलाव — अयोध्या के पवित्र ज्ञान से निर्देशित।",
    aboutEyebrow: "हम कौन हैं", aboutTitle: "अवध एस्ट्रो के बारे में", aboutSub: "अयोध्या में निहित, वैदिक ज्ञान से स्पष्टता चाहने वाले हर किसी के लिए बनाया गया।",
    ourStory: "हमारी कहानी",
    storyText: "अवध एस्ट्रो की स्थापना अयोध्या — श्री राम की नगरी — में हुई, ताकि हर भक्त तक प्रामाणिक, मंदिर-सत्यापित वैदिक मार्गदर्शन पहुंचाया जा सके, चाहे वे स्वयं आ सकें या केवल स्क्रीन के माध्यम से जुड़ें। हमारे मंच के हर ज्योतिषी की योग्यता और परंपरा को “अयोध्या सत्यापित” चिह्नित करने से पहले जांचा जाता है।",
    contactTitle: "संपर्क करें", supportHours: "सहायता प्रतिदिन सुबह 7:00 – रात्रि 11:00 IST उपलब्ध",
    appEyebrow: "ऐप डाउनलोड करें", appTitle: "अयोध्या का ज्ञान हर जगह अपने साथ रखें", appSub: "मुफ़्त परामर्श, लाइव पूजा और दैनिक मार्गदर्शन अब आपकी उंगलियों पर। 1 करोड़+ डाउनलोड।",
  },
  kundali: {
    pageTitle: "मुफ़्त कुंडली और जन्म कुंडली", fullName: "पूरा नाम", namePlaceholder: "जैसे निशित तिवारी",
    dateOfBirth: "जन्म तिथि", timeOfBirth: "जन्म समय", timeUnknownLabel: "मुझे अपना सटीक जन्म समय नहीं पता",
    timeUnknownNote: "हम मानक अनुमान के रूप में दोपहर 12:00 बजे का उपयोग करेंगे। आपकी चंद्र राशि और नक्षत्र सटीक रहेंगे; लग्न और भाव स्थिति अनुमानित होंगी।",
    placeOfBirth: "जन्म स्थान", placePlaceholder: "शहर का नाम टाइप करें…",
    gender: "लिंग", male: "पुरुष", female: "महिला", other: "अन्य", generate: "कुंडली बनाएं", computing: "गणना हो रही है…",
    resultFor: "कुंडली", timeUnknownBanner: "⚠️ जन्म समय अज्ञात — दोपहर 12:00 बजे के आधार पर गणना की गई। नीचे दिखाए गए लग्न और भाव अनुमानित हैं; चंद्र राशि और नक्षत्र सटीक हैं।",
    tabBasic: "मूल", tabChart: "कुंडली चार्ट", tabPanchang: "पंचांग", tabDasha: "दशा", tabDoshas: "दोष", tabPlanets: "ग्रह", tabReport: "रिपोर्ट",
    ascendant: "लग्न", moonSign: "चंद्र राशि", sunSign: "सूर्य राशि", nakshatra: "नक्षत्र", currentDasha: "वर्तमान दशा",
    luckyFactors: "आपके शुभ तत्व", luckyGem: "शुभ रत्न", luckyNumber: "शुभ अंक", luckyColor: "शुभ रंग", favorableDirection: "शुभ दिशा",
    chartTitle: "जन्म कुंडली चार्ट (उत्तर भारतीय)", chartNote: "भाव 1 (ऊपर) आपका लग्न है। ग्रहों की स्थिति भाव के अनुसार, मानक उत्तर भारतीय चार्ट पद्धति के अनुसार दिखाई गई है।",
    panchangTitle: "जन्म पंचांग", tithi: "तिथि", vaara: "वार", yoga: "योग", karana: "करण", moonPhase: "पक्ष",
    dashaTitle: "विंशोत्तरी दशा", mahadasha: "महादशा", antardashaCurrent: "अंतर्दशा (वर्तमान)",
    doshaTitle: "दोष एवं गोचर जांच", mangalDosha: "मंगल दोष (मांगलिक)", sadeSati: "साढ़े साती", kaalSarp: "काल सर्प दोष", present: "मौजूद", clear: "नहीं है",
    yogasTitle: "उल्लेखनीय योग", planetsTitle: "ग्रह स्थिति",
    planetCol: "ग्रह", signCol: "राशि", houseCol: "भाव", degreeCol: "अंश", nakshatraCol: "नक्षत्र", padaCol: "पद", dignityCol: "स्थिति", retroCol: "वक्री",
    reportTitle: "आपकी संपूर्ण कुंडली रिपोर्ट", reportDesc: "ऊपर दिए गए सभी भाग — जन्म विवरण, चार्ट, पंचांग, दशाएं, दोष जांच और संपूर्ण ग्रह स्थिति — एक ही मुद्रण-योग्य, भक्तिमय रिपोर्ट में डाउनलोड करें।",
    downloadPdf: "पीडीएफ रिपोर्ट डाउनलोड करें",
    disclaimer: "केवल सूचनात्मक और आध्यात्मिक उद्देश्यों के लिए। इन स्थितियों का व्यक्तिगत अर्थ जानने के लिए किसी अयोध्या-सत्यापित ज्योतिषी से सलाह लें।",
    discussAstrologer: "ज्योतिषी से चर्चा करें", bookRemedy: "उपाय पूजा बुक करें", newKundali: "नई कुंडली",
    suggestedRemedy: "सुझाया गया उपाय", book: "बुक करें",
  },
  match: {
    pageTitle: "कुंडली मिलान", subtitle: "अष्टकूट गुण मिलान — विवाह के लिए उपयोग की जाने वाली 36-बिंदु वैदिक अनुकूलता प्रणाली।",
    guideToggle: "कुंडली मिलान क्यों महत्वपूर्ण है?", guideIntro: "अष्टकूट गुण मिलान वधू और वर की चंद्र राशि की स्थिति की तुलना 8 कारकों (“कूट”) में करता है, कुल 36 अंकों के लिए।",
    howToRead: "अपना स्कोर कैसे पढ़ें: 36 में से 18+ सामान्यतः स्वीकार्य, 25+ बहुत अच्छा और 32+ उत्कृष्ट माना जाता है।",
    guideFooter: "यह विवाह के निर्णय के लिए कई कारकों में से एक है, अंतिम निर्णय नहीं।",
    bride: "वधू", brideHi: "वधू", groom: "वर", groomHi: "वर",
    uploadLabel: "क्या आपके पास पहले से कुंडली है?", uploadCta: "अपने ज्योतिषी के साथ साझा करने के लिए अपलोड करें",
    uploadNote: "हम अभी अपलोड की गई कुंडली से जन्म विवरण स्वतः नहीं पढ़ सकते — कृपया मिलान तुरंत करने के लिए ऊपर दिए गए फ़ील्ड भी भरें।",
    matchButton: "कुंडली मिलाएं", matching: "मिलान हो रहा है…",
    percentOf: "%", guna: "गुण", ashtakootBreakdown: "अष्टकूट विवरण",
    noDoshaConflict: "कोई मंगल दोष टकराव नहीं", doshaMismatch: "मंगल दोष असंतुलन", verdict: "निष्कर्ष।",
    bookRemedy: "उपाय पूजा बुक करें", consultMarriageAstrologer: "विवाह ज्योतिषी से सलाह लें", newMatch: "नया मिलान",
    disclaimer: "केवल सूचनात्मक और आध्यात्मिक उद्देश्यों के लिए। अनुकूलता विवाह के कई कारकों में से एक है।",
  },
  seva: {
    pageTitle: "सेवा — अयोध्या में, आपके नाम पर पूजा", intro: "अयोध्या नहीं जा सकते? एक सत्यापित पंडित द्वारा वास्तविक अयोध्या मंदिर में आपके लिए पूजा करवाएं — लाइव स्ट्रीम के साथ, और प्रसाद दुनिया में कहीं भी आपके द्वार तक पहुंचाया जाएगा।",
    verifiedBadge: "अयोध्या-सत्यापित पंडितों द्वारा संपन्न", mostRequested: "सबसे लोकप्रिय", liveVideo: "लाइव वीडियो", shipsWorldwide: "विश्वभर में डिलीवरी", bookSeva: "सेवा बुक करें",
    devoteeName: "भक्त का नाम (संकल्प हेतु)", devoteeNamePlaceholder: "जिनके नाम पूजा की जानी है",
    gotra: "गोत्र", sankalp: "आपका संकल्प / इच्छा", sankalpPlaceholder: "जैसे मेरी माँ का अच्छा स्वास्थ्य",
    preferredDate: "पसंदीदा तिथि", muhuratNote: "हम मुहूर्त की पुष्टि करेंगे", addonsLabel: "अतिरिक्त सेवाएं",
    yourCity: "आपका शहर", shippingCountry: "प्रसाद भेजने का देश", shippingAddress: "डिलीवरी पता", shippingAddressPlaceholder: "मकान / गली / लैंडमार्क",
    liveStream: "पूजा मुझे लाइव दिखाएं (वीडियो कॉल)", total: "कुल", offerSankalp: "संकल्प अर्पित करें",
    paymentNote: "मुहूर्त की पुष्टि के बाद भुगतान लिया जाएगा। यह एक आध्यात्मिक सेवा है; किसी परिणाम की गारंटी नहीं है।",
    promoCode: "प्रोमो कोड", applyPromo: "लागू करें",
    modeLabel: "यह पूजा किस प्रकार संपन्न कराना चाहेंगे?", modeOnline: "ऑनलाइन (लाइव स्ट्रीम)", modeOffline: "व्यक्तिगत रूप से मेरे स्थान पर",
    payWallet: "वॉलेट से भुगतान करें", payCash: "पूजा शुरू होने से पहले नकद भुगतान",
    walletBalance: "वॉलेट बैलेंस", insufficientBalance: "वॉलेट में पर्याप्त राशि नहीं है। जारी रखने के लिए वॉलेट में पैसे जोड़ें (जल्द आ रहा है)।",
    payNow: "भुगतान करें और संकल्प अर्पित करें", viewMyBookings: "मेरी बुकिंग देखें", suggestedForYou: "आपके लिए सुझाव", remedyBookedNote: "यह आपकी कुंडली में पहचाने गए दोष का समाधान करता है।",
  },
  astrologers: { pageTitle: "ज्योतिषी से बात करें", onlineNow: "ज्योतिषी अभी ऑनलाइन हैं", firstMinuteFree: "नए उपयोगकर्ताओं के लिए पहला मिनट मुफ़्त।", marriageAstrologers: "विवाह ज्योतिषी", noMatch: "इन फ़िल्टर से कोई ज्योतिषी नहीं मिला — कृपया खोज का दायरा बढ़ाएं।" },
  plus: { pageTitle: "अवध प्लस", subtitle: "आपकी कुंडली, हर दिन आपके लिए काम करेगी।", currentPlan: "वर्तमान योजना", subscribe: "सदस्यता लें", paymentNote: "भुगतान Razorpay (UPI, कार्ड, नेट बैंकिंग) के माध्यम से किया जाएगा। कभी भी रद्द करें।" },
  chat: { welcome: "नमस्ते 🙏 मैं आपका अवध एस्ट्रो एआई मार्गदर्शक हूं। अपनी कुंडली, किसी आगामी निर्णय, या आज के पंचांग के बारे में कुछ भी पूछें।", placeholder: "अपनी कुंडली, करियर, विवाह के बारे में पूछें…", send: "भेजें", disclaimer: "आप एक एआई से चैट कर रहे हैं। मार्गदर्शन केवल आध्यात्मिक/सूचनात्मक है।", consulting: "सितारों से पूछा जा रहा है…" },
  tracking: {
    pageTitle: "मेरी बुकिंग", empty: "आपने अभी तक कोई सेवा बुक नहीं की है।", viewMyBookings: "मेरी बुकिंग देखें", bookedOn: "बुक की गई तारीख",
    statusRequested: "अनुरोध किया गया", statusMuhuratConfirmed: "मुहूर्त पुष्ट", statusPerformed: "पूजा संपन्न",
    statusPrasadShipped: "प्रसाद भेजा गया", statusDelivered: "पहुंच गया",
  },
};

const bn: Dictionary = {
  nav: {
    seva: "পূজা / সেবা", consultations: "পরামর্শ", freeServices: "ফ্রি পরিষেবা", horoscope: "রাশিফল",
    plus: "অবধ প্লাস", chatNow: "এখনই চ্যাট করুন", freeKundali: "ফ্রি কুষ্ঠি", kundaliMatching: "কুষ্ঠি মিলন",
    aiChat: "এআই চ্যাট", chatWithAstrologer: "জ্যোতিষীর সাথে চ্যাট করুন", callAstrologer: "জ্যোতিষীকে কল করুন", dailyHoroscope: "দৈনিক রাশিফল",
  },
  bottomNav: { home: "হোম", kundali: "কুষ্ঠি", seva: "সেবা", talk: "কথা বলুন", aiChat: "এআই চ্যাট" },
  footer: {
    tagline: "অযোধ্যা, উত্তর প্রদেশ · ভারতের পবিত্র জ্যোতিষ প্ল্যাটফর্ম",
    disclaimer: "নির্দেশনা শুধুমাত্র তথ্যগত ও আধ্যাত্মিক উদ্দেশ্যে — চিকিৎসা, আইনি বা আর্থিক পরামর্শের বিকল্প নয়।",
    rights: "সর্বস্বত্ব সংরক্ষিত।",
  },
  common: { ayodhya: "অযোধ্যা, উ.প্র.", loading: "লোড হচ্ছে…", save: "সংরক্ষণ করুন", cancel: "বাতিল", submit: "জমা দিন", optional: "ঐচ্ছিক", opensNewTab: "নতুন ট্যাবে খুলবে" },
  home: {
    heroEyebrow: "অযোধ্যা-প্রত্যায়িত জ্যোতিষী · এখন অনলাইন", heroHindiLine: "শ্রী রামের নগরী থেকে — জ্যোতিষের সেবা",
    heroTitleLine1: "পবিত্র জ্ঞান", heroTitleLine2: "শ্রী রামের নগরী থেকে",
    heroTagline: "ভারতের সবচেয়ে বিশ্বস্ত অযোধ্যা জ্যোতিষ প্ল্যাটফর্ম — ফ্রি কুষ্ঠি, প্রত্যায়িত পণ্ডিতদের সাথে লাইভ পরামর্শ, এআই নির্দেশনা এবং শুভ দিনের সতর্কতা।",
    ctaFreeKundali: "আমার ফ্রি কুষ্ঠি নিন", ctaChatAstrologer: "জ্যোতিষীর সাথে চ্যাট করুন",
    statAstrologers: "জ্যোতিষী", statUsers: "সন্তুষ্ট ব্যবহারকারী", statConsultations: "পরামর্শ", statRating: "অ্যাপ রেটিং",
    trustVerified: "অযোধ্যা-প্রত্যায়িত পণ্ডিত", trustLive: "লাইভ অনুষ্ঠান দেখুন", trustPrasad: "প্রসাদ আপনার দরজায়",
    trustSecure: "১০০% নিরাপদ পেমেন্ট", trustLanguages: "৪টি ভাষা",
    zodiacEyebrow: "দৈনিক রাশিফল", zodiacTitle: "আজ তারারা কী বলছে?", zodiacSub: "আপনার ব্যক্তিগত রাশিফল দেখতে আপনার রাশিতে ক্লিক করুন।",
    luckyColor: "শুভ রং", luckyNumber: "শুভ সংখ্যা", energy: "শক্তি", readFull: "সম্পূর্ণ রাশিফল পড়ুন",
    statAstrologersLabel: "প্রত্যায়িত জ্যোতিষী", statUsersLabel: "সন্তুষ্ট ব্যবহারকারী", statConsultationsLabel: "সম্পন্ন পরামর্শ", statLanguagesLabel: "সমর্থিত ভাষা",
    astroEyebrow: "এখন লাইভ", astroTitle: "জ্যোতিষীর সাথে কথা বলুন", astroSub: "প্রত্যায়িত অযোধ্যা পণ্ডিতরা এখনই উপলব্ধ। নতুন ব্যবহারকারীদের জন্য প্রথম মিনিট ফ্রি।",
    viewAll: "সব দেখুন", chatBtn: "চ্যাট", callBtn: "কল", seeAllAstrologers: "সব জ্যোতিষী দেখুন",
    servicesEyebrow: "ফ্রি ও প্রিমিয়াম", servicesTitle: "একটি প্ল্যাটফর্মে সবকিছু", servicesSub: "জ্যোতিষ, আচার-অনুষ্ঠান, এআই এবং দৈব নির্দেশনা — সবকিছু এক পবিত্র স্থানে।",
    pujaEyebrow: "অযোধ্যা থেকে লাইভ", pujaTitle: "🔱 অনলাইন পূজা", pujaSub: "একজন প্রত্যায়িত পণ্ডিত একটি প্রকৃত অযোধ্যা মন্দিরে আপনার পূজা লাইভ সম্পন্ন করেন। আপনি ভিডিওতে দেখুন। প্রসাদ বাড়িতে পৌঁছায়।",
    bookNow: "এখনই বুক করুন", onwards: "থেকে শুরু",
    testimonialsEyebrow: "ব্যবহারকারী পর্যালোচনা", testimonialsTitle: "লক্ষাধিক মানুষের আস্থা", testimonialsSub: "প্রকৃত মানুষ, প্রকৃত পরিবর্তন — অযোধ্যার পবিত্র জ্ঞান দ্বারা পরিচালিত।",
    aboutEyebrow: "আমরা কারা", aboutTitle: "অবধ অ্যাস্ট্রো সম্পর্কে", aboutSub: "অযোধ্যায় প্রোথিত, বৈদিক জ্ঞান থেকে স্পষ্টতা খোঁজা প্রত্যেকের জন্য তৈরি।",
    ourStory: "আমাদের গল্প",
    storyText: "অবধ অ্যাস্ট্রো অযোধ্যায় — শ্রী রামের নগরীতে — প্রতিষ্ঠিত হয়েছিল, যাতে সর্বত্র ভক্তদের কাছে প্রকৃত, মন্দির-প্রত্যায়িত বৈদিক নির্দেশনা পৌঁছে দেওয়া যায়। আমাদের প্ল্যাটফর্মের প্রতিটি জ্যোতিষীর যোগ্যতা ও ঐতিহ্য “অযোধ্যা প্রত্যায়িত” চিহ্নিত করার আগে যাচাই করা হয়।",
    contactTitle: "যোগাযোগ করুন", supportHours: "প্রতিদিন সকাল ৭টা – রাত ১১টা IST সহায়তা উপলব্ধ",
    appEyebrow: "অ্যাপ ডাউনলোড করুন", appTitle: "অযোধ্যার জ্ঞান সর্বত্র সাথে রাখুন", appSub: "ফ্রি পরামর্শ, লাইভ পূজা এবং দৈনিক নির্দেশনা আপনার হাতের মুঠোয়। ১ কোটি+ ডাউনলোড।",
  },
  kundali: {
    pageTitle: "ফ্রি কুষ্ঠি ও জন্ম কুষ্ঠি", fullName: "পুরো নাম", namePlaceholder: "যেমন নিশিত তিওয়ারি",
    dateOfBirth: "জন্ম তারিখ", timeOfBirth: "জন্ম সময়", timeUnknownLabel: "আমি আমার সঠিক জন্ম সময় জানি না",
    timeUnknownNote: "আমরা মান হিসেবে দুপুর ১২টা ব্যবহার করব। আপনার চন্দ্র রাশি ও নক্ষত্র সঠিক থাকবে; লগ্ন ও ভাব অবস্থান আনুমানিক হবে।",
    placeOfBirth: "জন্মস্থান", placePlaceholder: "শহরের নাম লিখুন…",
    gender: "লিঙ্গ", male: "পুরুষ", female: "মহিলা", other: "অন্যান্য", generate: "কুষ্ঠি তৈরি করুন", computing: "গণনা চলছে…",
    resultFor: "কুষ্ঠি", timeUnknownBanner: "⚠️ জন্ম সময় অজানা — দুপুর ১২টার ভিত্তিতে গণনা করা হয়েছে। নিচে দেখানো লগ্ন ও ভাব আনুমানিক; চন্দ্র রাশি ও নক্ষত্র সঠিক।",
    tabBasic: "মূল", tabChart: "কুষ্ঠি চার্ট", tabPanchang: "পঞ্চাঙ্গ", tabDasha: "দশা", tabDoshas: "দোষ", tabPlanets: "গ্রহ", tabReport: "রিপোর্ট",
    ascendant: "লগ্ন", moonSign: "চন্দ্র রাশি", sunSign: "সূর্য রাশি", nakshatra: "নক্ষত্র", currentDasha: "বর্তমান দশা",
    luckyFactors: "আপনার শুভ বিষয়", luckyGem: "শুভ রত্ন", luckyNumber: "শুভ সংখ্যা", luckyColor: "শুভ রং", favorableDirection: "শুভ দিক",
    chartTitle: "জন্ম কুষ্ঠি চার্ট (উত্তর ভারতীয়)", chartNote: "ভাব ১ (উপরে) আপনার লগ্ন। গ্রহের অবস্থান ভাব অনুযায়ী, প্রমিত উত্তর ভারতীয় চার্ট পদ্ধতি অনুসরণ করে দেখানো হয়েছে।",
    panchangTitle: "জন্ম পঞ্চাঙ্গ", tithi: "তিথি", vaara: "বার", yoga: "যোগ", karana: "করণ", moonPhase: "পক্ষ",
    dashaTitle: "বিংশোত্তরী দশা", mahadasha: "মহাদশা", antardashaCurrent: "অন্তর্দশা (বর্তমান)",
    doshaTitle: "দোষ ও গোচর পরীক্ষা", mangalDosha: "মঙ্গল দোষ (মাঙ্গলিক)", sadeSati: "সাড়ে সাতী", kaalSarp: "কাল সর্প দোষ", present: "উপস্থিত", clear: "নেই",
    yogasTitle: "উল্লেখযোগ্য যোগ", planetsTitle: "গ্রহের অবস্থান",
    planetCol: "গ্রহ", signCol: "রাশি", houseCol: "ভাব", degreeCol: "অংশ", nakshatraCol: "নক্ষত্র", padaCol: "পদ", dignityCol: "অবস্থা", retroCol: "বক্রী",
    reportTitle: "আপনার সম্পূর্ণ কুষ্ঠি রিপোর্ট", reportDesc: "উপরের সব অংশ — জন্ম বিবরণ, চার্ট, পঞ্চাঙ্গ, দশা, দোষ পরীক্ষা এবং সম্পূর্ণ গ্রহের অবস্থান — একটি প্রিন্টযোগ্য, ভক্তিমূলক রিপোর্ট হিসেবে ডাউনলোড করুন।",
    downloadPdf: "পিডিএফ রিপোর্ট ডাউনলোড করুন",
    disclaimer: "শুধুমাত্র তথ্যগত ও আধ্যাত্মিক উদ্দেশ্যে। এই অবস্থানগুলোর ব্যক্তিগত অর্থ জানতে একজন অযোধ্যা-প্রত্যায়িত জ্যোতিষীর পরামর্শ নিন।",
    discussAstrologer: "জ্যোতিষীর সাথে আলোচনা করুন", bookRemedy: "প্রতিকার পূজা বুক করুন", newKundali: "নতুন কুষ্ঠি",
    suggestedRemedy: "প্রস্তাবিত প্রতিকার", book: "বুক করুন",
  },
  match: {
    pageTitle: "কুষ্ঠি মিলন", subtitle: "অষ্টকূট গুণ মিলন — বিবাহের জন্য ব্যবহৃত ৩৬-পয়েন্ট বৈদিক সামঞ্জস্য পদ্ধতি।",
    guideToggle: "কুষ্ঠি মিলন কেন গুরুত্বপূর্ণ?", guideIntro: "অষ্টকূট গুণ মিলন কনে ও বরের চন্দ্র রাশির অবস্থান ৮টি বিষয়ে (“কূট”) তুলনা করে, মোট ৩৬ পয়েন্টের জন্য।",
    howToRead: "আপনার স্কোর কীভাবে পড়বেন: ৩৬-এর মধ্যে ১৮+ সাধারণত গ্রহণযোগ্য, ২৫+ খুব ভালো এবং ৩২+ চমৎকার বলে বিবেচিত হয়।",
    guideFooter: "এটি বিবাহের সিদ্ধান্তের অনেক উপাদানের একটি, চূড়ান্ত রায় নয়।",
    bride: "কনে", brideHi: "কনে", groom: "বর", groomHi: "বর",
    uploadLabel: "আপনার কাছে আগে থেকে কুষ্ঠি আছে?", uploadCta: "আপনার জ্যোতিষীর সাথে শেয়ার করতে আপলোড করুন",
    uploadNote: "আমরা এখনও আপলোড করা চার্ট থেকে জন্ম বিবরণ স্বয়ংক্রিয়ভাবে পড়তে পারি না — অনুগ্রহ করে তাৎক্ষণিক মিলনের জন্য উপরের ফিল্ডগুলোও পূরণ করুন।",
    matchButton: "কুষ্ঠি মেলান", matching: "মিলন চলছে…",
    percentOf: "%", guna: "গুণ", ashtakootBreakdown: "অষ্টকূট বিবরণ",
    noDoshaConflict: "কোনো মঙ্গল দোষ সংঘর্ষ নেই", doshaMismatch: "মঙ্গল দোষ অমিল", verdict: "সিদ্ধান্ত।",
    bookRemedy: "প্রতিকার পূজা বুক করুন", consultMarriageAstrologer: "বিবাহ জ্যোতিষীর পরামর্শ নিন", newMatch: "নতুন মিলন",
    disclaimer: "শুধুমাত্র তথ্যগত ও আধ্যাত্মিক উদ্দেশ্যে। সামঞ্জস্য বিবাহের অনেক উপাদানের একটি।",
  },
  seva: {
    pageTitle: "সেবা — অযোধ্যায়, আপনার নামে পূজা", intro: "অযোধ্যায় যেতে পারছেন না? একজন প্রত্যায়িত পণ্ডিত দ্বারা প্রকৃত অযোধ্যা মন্দিরে আপনার জন্য পূজা করান — লাইভ স্ট্রিমসহ, এবং প্রসাদ বিশ্বের যেকোনো জায়গায় আপনার দরজায় পাঠানো হবে।",
    verifiedBadge: "অযোধ্যা-প্রত্যায়িত পণ্ডিতদের দ্বারা সম্পন্ন", mostRequested: "সর্বাধিক অনুরোধকৃত", liveVideo: "লাইভ ভিডিও", shipsWorldwide: "বিশ্বব্যাপী পাঠানো হয়", bookSeva: "সেবা বুক করুন",
    devoteeName: "ভক্তের নাম (সংকল্পের জন্য)", devoteeNamePlaceholder: "যার নামে পূজা করা হবে",
    gotra: "গোত্র", sankalp: "আপনার সংকল্প / ইচ্ছা", sankalpPlaceholder: "যেমন আমার মায়ের সুস্বাস্থ্য",
    preferredDate: "পছন্দের তারিখ", muhuratNote: "আমরা মুহূর্ত নিশ্চিত করব", addonsLabel: "অতিরিক্ত পরিষেবা",
    yourCity: "আপনার শহর", shippingCountry: "প্রসাদ পাঠানোর দেশ", shippingAddress: "ডেলিভারি ঠিকানা", shippingAddressPlaceholder: "বাড়ি / রাস্তা / ল্যান্ডমার্ক",
    liveStream: "পূজা আমাকে লাইভ দেখান (ভিডিও কল)", total: "মোট", offerSankalp: "সংকল্প নিবেদন করুন",
    paymentNote: "মুহূর্ত নিশ্চিত হওয়ার পর পেমেন্ট নেওয়া হবে। এটি একটি আধ্যাত্মিক পরিষেবা; কোনো ফলাফলের নিশ্চয়তা নেই।",
    promoCode: "প্রোমো কোড", applyPromo: "প্রয়োগ করুন",
    modeLabel: "এই পূজা কীভাবে সম্পন্ন করতে চান?", modeOnline: "অনলাইন (লাইভ স্ট্রিম)", modeOffline: "সশরীরে আমার স্থানে",
    payWallet: "ওয়ালেট দিয়ে পেমেন্ট করুন", payCash: "পূজা শুরুর আগে নগদ",
    walletBalance: "ওয়ালেট ব্যালেন্স", insufficientBalance: "ওয়ালেটে পর্যাপ্ত অর্থ নেই। চালিয়ে যেতে ওয়ালেটে টাকা যোগ করুন (শীঘ্রই আসছে)।",
    payNow: "পেমেন্ট করুন ও সংকল্প নিবেদন করুন", viewMyBookings: "আমার বুকিং দেখুন", suggestedForYou: "আপনার জন্য প্রস্তাবিত", remedyBookedNote: "এটি আপনার কুষ্ঠিতে চিহ্নিত দোষের সমাধান করে।",
  },
  astrologers: { pageTitle: "জ্যোতিষীর সাথে কথা বলুন", onlineNow: "জ্যোতিষী এখন অনলাইনে আছেন", firstMinuteFree: "নতুন ব্যবহারকারীদের জন্য প্রথম মিনিট ফ্রি।", marriageAstrologers: "বিবাহ জ্যোতিষী", noMatch: "এই ফিল্টারে কোনো জ্যোতিষী পাওয়া যায়নি — আপনার অনুসন্ধান প্রসারিত করুন।" },
  plus: { pageTitle: "অবধ প্লাস", subtitle: "আপনার কুষ্ঠি, প্রতিদিন আপনার জন্য কাজ করবে।", currentPlan: "বর্তমান পরিকল্পনা", subscribe: "সাবস্ক্রাইব করুন", paymentNote: "পেমেন্ট Razorpay (UPI, কার্ড, নেট ব্যাংকিং) এর মাধ্যমে প্রক্রিয়া করা হবে। যেকোনো সময় বাতিল করুন।" },
  chat: { welcome: "নমস্তে 🙏 আমি আপনার অবধ অ্যাস্ট্রো এআই গাইড। আপনার কুষ্ঠি, আসন্ন সিদ্ধান্ত বা আজকের পঞ্চাঙ্গ সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন।", placeholder: "আপনার কুষ্ঠি, ক্যারিয়ার, বিবাহ সম্পর্কে জিজ্ঞাসা করুন…", send: "পাঠান", disclaimer: "আপনি একটি এআই এর সাথে চ্যাট করছেন। নির্দেশনা শুধুমাত্র আধ্যাত্মিক/তথ্যগত।", consulting: "তারাদের কাছে জিজ্ঞাসা করা হচ্ছে…" },
  tracking: {
    pageTitle: "আমার বুকিং", empty: "আপনি এখনও কোনো সেবা বুক করেননি।", viewMyBookings: "আমার বুকিং দেখুন", bookedOn: "বুক করা হয়েছে",
    statusRequested: "অনুরোধ করা হয়েছে", statusMuhuratConfirmed: "মুহূর্ত নিশ্চিত", statusPerformed: "পূজা সম্পন্ন",
    statusPrasadShipped: "প্রসাদ পাঠানো হয়েছে", statusDelivered: "পৌঁছেছে",
  },
};

const mr: Dictionary = {
  nav: {
    seva: "पूजा / सेवा", consultations: "सल्लामसलत", freeServices: "मोफत सेवा", horoscope: "राशिभविष्य",
    plus: "अवध प्लस", chatNow: "आता चॅट करा", freeKundali: "मोफत कुंडली", kundaliMatching: "कुंडली जुळणी",
    aiChat: "एआय चॅट", chatWithAstrologer: "ज्योतिषाशी चॅट करा", callAstrologer: "ज्योतिषाला कॉल करा", dailyHoroscope: "दैनिक राशिभविष्य",
  },
  bottomNav: { home: "होम", kundali: "कुंडली", seva: "सेवा", talk: "बोला", aiChat: "एआय चॅट" },
  footer: {
    tagline: "अयोध्या, उत्तर प्रदेश · भारताचे पवित्र ज्योतिष व्यासपीठ",
    disclaimer: "मार्गदर्शन केवळ माहितीपर आणि आध्यात्मिक हेतूंसाठी आहे — वैद्यकीय, कायदेशीर किंवा आर्थिक सल्ल्याचा पर्याय नाही.",
    rights: "सर्व हक्क राखीव.",
  },
  common: { ayodhya: "अयोध्या, उ.प्र.", loading: "लोड होत आहे…", save: "जतन करा", cancel: "रद्द करा", submit: "सबमिट करा", optional: "ऐच्छिक", opensNewTab: "नवीन टॅबमध्ये उघडेल" },
  home: {
    heroEyebrow: "अयोध्या-प्रमाणित ज्योतिषी · आता ऑनलाइन", heroHindiLine: "श्री रामाच्या नगरीतून — ज्योतिषाची सेवा",
    heroTitleLine1: "पवित्र ज्ञान", heroTitleLine2: "श्री रामाच्या नगरीतून",
    heroTagline: "भारतातील सर्वात विश्वासार्ह अयोध्या ज्योतिष व्यासपीठ — मोफत कुंडली, प्रमाणित पंडितांशी थेट सल्लामसलत, एआय मार्गदर्शन आणि शुभ मुहूर्त सूचना.",
    ctaFreeKundali: "माझी मोफत कुंडली मिळवा", ctaChatAstrologer: "ज्योतिषाशी चॅट करा",
    statAstrologers: "ज्योतिषी", statUsers: "समाधानी वापरकर्ते", statConsultations: "सल्लामसलत", statRating: "अ‍ॅप रेटिंग",
    trustVerified: "अयोध्या-प्रमाणित पंडित", trustLive: "विधी थेट पहा", trustPrasad: "प्रसाद आपल्या दारी",
    trustSecure: "100% सुरक्षित पेमेंट", trustLanguages: "4 भाषा",
    zodiacEyebrow: "दैनिक राशिभविष्य", zodiacTitle: "आज तारे काय सांगतात?", zodiacSub: "आपले वैयक्तिक राशिभविष्य पाहण्यासाठी आपल्या राशीवर क्लिक करा.",
    luckyColor: "शुभ रंग", luckyNumber: "शुभ अंक", energy: "ऊर्जा", readFull: "पूर्ण राशिभविष्य वाचा",
    statAstrologersLabel: "प्रमाणित ज्योतिषी", statUsersLabel: "समाधानी वापरकर्ते", statConsultationsLabel: "पूर्ण सल्लामसलत", statLanguagesLabel: "समर्थित भाषा",
    astroEyebrow: "आता थेट", astroTitle: "ज्योतिषाशी बोला", astroSub: "प्रमाणित अयोध्या पंडित आता उपलब्ध आहेत. नवीन वापरकर्त्यांसाठी पहिला मिनिट मोफत.",
    viewAll: "सर्व पहा", chatBtn: "चॅट", callBtn: "कॉल", seeAllAstrologers: "सर्व ज्योतिषी पहा",
    servicesEyebrow: "मोफत आणि प्रीमियम", servicesTitle: "एकाच व्यासपीठावर सर्व काही", servicesSub: "ज्योतिष, विधी, एआय आणि दैवी मार्गदर्शन — सर्व एकाच पवित्र ठिकाणी.",
    pujaEyebrow: "अयोध्येतून थेट", pujaTitle: "🔱 ऑनलाइन पूजा", pujaSub: "एक प्रमाणित पंडित खऱ्या अयोध्या मंदिरात आपली पूजा थेट करतो. आपण व्हिडिओवर पहा. प्रसाद घरी पोहोचतो.",
    bookNow: "आता बुक करा", onwards: "पासून सुरू",
    testimonialsEyebrow: "वापरकर्ता पुनरावलोकने", testimonialsTitle: "लाखो लोकांचा विश्वास", testimonialsSub: "खरे लोक, खरे बदल — अयोध्येच्या पवित्र ज्ञानाने मार्गदर्शित.",
    aboutEyebrow: "आम्ही कोण आहोत", aboutTitle: "अवध अ‍ॅस्ट्रो बद्दल", aboutSub: "अयोध्येत रुजलेले, वैदिक ज्ञानातून स्पष्टता शोधणाऱ्या प्रत्येकासाठी तयार केलेले.",
    ourStory: "आमची कहाणी",
    storyText: "अवध अ‍ॅस्ट्रोची स्थापना अयोध्येत — श्री रामाच्या नगरीत — झाली, जेणेकरून प्रत्येक भक्तापर्यंत खरे, मंदिर-प्रमाणित वैदिक मार्गदर्शन पोहोचवता येईल, मग ते प्रत्यक्ष येऊ शकोत किंवा फक्त स्क्रीनद्वारे जोडले जावोत. आमच्या व्यासपीठावरील प्रत्येक ज्योतिषाची पात्रता आणि परंपरा “अयोध्या प्रमाणित” असे चिन्हांकित करण्यापूर्वी तपासली जाते.",
    contactTitle: "संपर्क साधा", supportHours: "मदत दररोज सकाळी 7:00 – रात्री 11:00 IST उपलब्ध",
    appEyebrow: "अ‍ॅप डाउनलोड करा", appTitle: "अयोध्येचे ज्ञान सर्वत्र सोबत ठेवा", appSub: "मोफत सल्लामसलत, थेट पूजा आणि दैनिक मार्गदर्शन आता आपल्या बोटांच्या टोकावर. 1 कोटी+ डाउनलोड्स.",
  },
  kundali: {
    pageTitle: "मोफत कुंडली आणि जन्म कुंडली", fullName: "पूर्ण नाव", namePlaceholder: "उदा. निशित तिवारी",
    dateOfBirth: "जन्मतारीख", timeOfBirth: "जन्मवेळ", timeUnknownLabel: "मला माझी नेमकी जन्मवेळ माहीत नाही",
    timeUnknownNote: "आम्ही मानक अंदाज म्हणून दुपारी 12:00 वापरू. आपली चंद्र रास आणि नक्षत्र अचूक राहतील; लग्न आणि भाव स्थिती अंदाजे असतील.",
    placeOfBirth: "जन्मस्थान", placePlaceholder: "शहराचे नाव टाइप करा…",
    gender: "लिंग", male: "पुरुष", female: "स्त्री", other: "इतर", generate: "कुंडली तयार करा", computing: "गणना सुरू आहे…",
    resultFor: "कुंडली", timeUnknownBanner: "⚠️ जन्मवेळ अज्ञात — दुपारी 12:00 च्या आधारे गणना केली आहे. खाली दाखवलेले लग्न आणि भाव अंदाजे आहेत; चंद्र रास आणि नक्षत्र अचूक आहेत.",
    tabBasic: "मूळ", tabChart: "कुंडली चार्ट", tabPanchang: "पंचांग", tabDasha: "दशा", tabDoshas: "दोष", tabPlanets: "ग्रह", tabReport: "अहवाल",
    ascendant: "लग्न", moonSign: "चंद्र रास", sunSign: "सूर्य रास", nakshatra: "नक्षत्र", currentDasha: "सध्याची दशा",
    luckyFactors: "आपले शुभ घटक", luckyGem: "शुभ रत्न", luckyNumber: "शुभ अंक", luckyColor: "शुभ रंग", favorableDirection: "शुभ दिशा",
    chartTitle: "जन्म कुंडली चार्ट (उत्तर भारतीय)", chartNote: "भाव 1 (वर) आपले लग्न आहे. ग्रहांची स्थिती भावानुसार, मानक उत्तर भारतीय चार्ट पद्धतीनुसार दाखवली आहे.",
    panchangTitle: "जन्म पंचांग", tithi: "तिथी", vaara: "वार", yoga: "योग", karana: "करण", moonPhase: "पक्ष",
    dashaTitle: "विंशोत्तरी दशा", mahadasha: "महादशा", antardashaCurrent: "अंतर्दशा (सध्याची)",
    doshaTitle: "दोष व गोचर तपासणी", mangalDosha: "मंगळ दोष (मांगलिक)", sadeSati: "साडेसाती", kaalSarp: "काळसर्प दोष", present: "आहे", clear: "नाही",
    yogasTitle: "उल्लेखनीय योग", planetsTitle: "ग्रह स्थिती",
    planetCol: "ग्रह", signCol: "रास", houseCol: "भाव", degreeCol: "अंश", nakshatraCol: "नक्षत्र", padaCol: "पद", dignityCol: "स्थिती", retroCol: "वक्री",
    reportTitle: "आपला संपूर्ण कुंडली अहवाल", reportDesc: "वरील सर्व विभाग — जन्म तपशील, चार्ट, पंचांग, दशा, दोष तपासणी आणि संपूर्ण ग्रह स्थिती — एकाच छापण्यायोग्य, भक्तिमय अहवालात डाउनलोड करा.",
    downloadPdf: "पीडीएफ अहवाल डाउनलोड करा",
    disclaimer: "केवळ माहितीपर आणि आध्यात्मिक हेतूंसाठी. या स्थितींचा वैयक्तिक अर्थ जाणून घेण्यासाठी अयोध्या-प्रमाणित ज्योतिषाचा सल्ला घ्या.",
    discussAstrologer: "ज्योतिषाशी चर्चा करा", bookRemedy: "उपाय पूजा बुक करा", newKundali: "नवीन कुंडली",
    suggestedRemedy: "सुचवलेला उपाय", book: "बुक करा",
  },
  match: {
    pageTitle: "कुंडली जुळणी", subtitle: "अष्टकूट गुण मिलन — विवाहासाठी वापरली जाणारी 36-गुणांची वैदिक सुसंगतता प्रणाली.",
    guideToggle: "कुंडली जुळणी का महत्त्वाची आहे?", guideIntro: "अष्टकूट गुण मिलन वधू आणि वराच्या चंद्र राशीच्या स्थितीची तुलना 8 घटकांमध्ये (“कूट”) करते, एकूण 36 गुणांसाठी.",
    howToRead: "आपला गुण कसा वाचावा: 36 पैकी 18+ साधारणपणे स्वीकार्य, 25+ खूप चांगले आणि 32+ उत्कृष्ट मानले जाते.",
    guideFooter: "हा विवाहाच्या निर्णयासाठी अनेक घटकांपैकी एक आहे, अंतिम निर्णय नाही.",
    bride: "वधू", brideHi: "वधू", groom: "वर", groomHi: "वर",
    uploadLabel: "आपल्याकडे आधीपासून कुंडली आहे का?", uploadCta: "आपल्या ज्योतिषासोबत शेअर करण्यासाठी अपलोड करा",
    uploadNote: "आम्ही अजून अपलोड केलेल्या चार्टमधून जन्म तपशील आपोआप वाचू शकत नाही — कृपया त्वरित जुळणीसाठी वरील फील्ड देखील भरा.",
    matchButton: "कुंडली जुळवा", matching: "जुळणी सुरू आहे…",
    percentOf: "%", guna: "गुण", ashtakootBreakdown: "अष्टकूट तपशील",
    noDoshaConflict: "मंगळ दोष संघर्ष नाही", doshaMismatch: "मंगळ दोष विसंगती", verdict: "निष्कर्ष.",
    bookRemedy: "उपाय पूजा बुक करा", consultMarriageAstrologer: "विवाह ज्योतिषाचा सल्ला घ्या", newMatch: "नवीन जुळणी",
    disclaimer: "केवळ माहितीपर आणि आध्यात्मिक हेतूंसाठी. सुसंगतता विवाहाच्या अनेक घटकांपैकी एक आहे.",
  },
  seva: {
    pageTitle: "सेवा — अयोध्येत, आपल्या नावे पूजा", intro: "अयोध्येला जाऊ शकत नाही? खऱ्या अयोध्या मंदिरात एका प्रमाणित पंडिताकडून आपल्यासाठी पूजा करवा — थेट प्रक्षेपणासह, आणि प्रसाद जगात कुठेही आपल्या दारी पाठवला जाईल.",
    verifiedBadge: "अयोध्या-प्रमाणित पंडितांकडून संपन्न", mostRequested: "सर्वाधिक विनंती केलेले", liveVideo: "थेट व्हिडिओ", shipsWorldwide: "जगभर पाठवले जाते", bookSeva: "सेवा बुक करा",
    devoteeName: "भक्ताचे नाव (संकल्पासाठी)", devoteeNamePlaceholder: "ज्यांच्या नावे पूजा करायची आहे",
    gotra: "गोत्र", sankalp: "आपला संकल्प / इच्छा", sankalpPlaceholder: "उदा. माझ्या आईचे चांगले आरोग्य",
    preferredDate: "पसंतीची तारीख", muhuratNote: "आम्ही मुहूर्त निश्चित करू", addonsLabel: "अतिरिक्त सेवा",
    yourCity: "आपले शहर", shippingCountry: "प्रसाद पाठवण्याचा देश", shippingAddress: "डिलिव्हरी पत्ता", shippingAddressPlaceholder: "घर / रस्ता / खूण",
    liveStream: "पूजा मला थेट दाखवा (व्हिडिओ कॉल)", total: "एकूण", offerSankalp: "संकल्प अर्पण करा",
    paymentNote: "मुहूर्त निश्चित झाल्यावर पेमेंट घेतले जाईल. ही आध्यात्मिक सेवा आहे; कोणत्याही निकालाची हमी नाही.",
    promoCode: "प्रोमो कोड", applyPromo: "लागू करा",
    modeLabel: "ही पूजा कशी करून घ्यायला आवडेल?", modeOnline: "ऑनलाइन (थेट प्रक्षेपण)", modeOffline: "प्रत्यक्ष माझ्या ठिकाणी",
    payWallet: "वॉलेटने पेमेंट करा", payCash: "पूजा सुरू होण्यापूर्वी रोख",
    walletBalance: "वॉलेट शिल्लक", insufficientBalance: "वॉलेटमध्ये पुरेशी शिल्लक नाही. सुरू ठेवण्यासाठी वॉलेटमध्ये पैसे जोडा (लवकरच येत आहे).",
    payNow: "पैसे द्या आणि संकल्प अर्पण करा", viewMyBookings: "माझ्या बुकिंग पहा", suggestedForYou: "आपल्यासाठी सुचवलेले", remedyBookedNote: "हे आपल्या कुंडलीत आढळलेल्या दोषाचे निराकरण करते.",
  },
  astrologers: { pageTitle: "ज्योतिषाशी बोला", onlineNow: "ज्योतिषी आता ऑनलाइन आहेत", firstMinuteFree: "नवीन वापरकर्त्यांसाठी पहिला मिनिट मोफत.", marriageAstrologers: "विवाह ज्योतिषी", noMatch: "या फिल्टरशी जुळणारे ज्योतिषी सापडले नाहीत — कृपया शोध व्यापक करा." },
  plus: { pageTitle: "अवध प्लस", subtitle: "आपली कुंडली, दररोज आपल्यासाठी काम करेल.", currentPlan: "सध्याची योजना", subscribe: "सदस्यता घ्या", paymentNote: "पेमेंट Razorpay (UPI, कार्ड, नेट बँकिंग) द्वारे प्रक्रिया केले जाईल. कधीही रद्द करा." },
  chat: { welcome: "नमस्ते 🙏 मी आपला अवध अ‍ॅस्ट्रो एआय मार्गदर्शक आहे. आपल्या कुंडली, आगामी निर्णय किंवा आजच्या पंचांगाबद्दल काहीही विचारा.", placeholder: "आपली कुंडली, करिअर, विवाहाबद्दल विचारा…", send: "पाठवा", disclaimer: "आपण एआयशी चॅट करत आहात. मार्गदर्शन केवळ आध्यात्मिक/माहितीपर आहे.", consulting: "ताऱ्यांना विचारले जात आहे…" },
  tracking: {
    pageTitle: "माझ्या बुकिंग", empty: "आपण अजून कोणतीही सेवा बुक केलेली नाही.", viewMyBookings: "माझ्या बुकिंग पहा", bookedOn: "बुक केले",
    statusRequested: "विनंती केली", statusMuhuratConfirmed: "मुहूर्त निश्चित", statusPerformed: "पूजा संपन्न",
    statusPrasadShipped: "प्रसाद पाठवला", statusDelivered: "पोहोचले",
  },
};

export const DICTIONARIES: Record<Locale, Dictionary> = { en, hi, bn, mr };
