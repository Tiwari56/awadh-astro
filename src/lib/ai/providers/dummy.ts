import { PLUS_PLANS } from "@/lib/data/plans";
import { classifyIntent } from "../intent";
import type { AiProvider, AiReply, ChatContext } from "../provider";
import type { KundaliResult } from "@/types";
import { vedic } from "@/lib/i18n/vedic-terms";

/**
 * Dummy chat provider — no model call, no cost, always available. This is
 * the ACTIVE provider until AI_PROVIDER=llm + a real key is configured (see
 * ../config.ts), so its output is not a fallback edge case — it's what every
 * user sees today, and per the founder's brief most of them read Hindi.
 *
 * It is NOT a language model and cannot reason. What it does do:
 *  - route on the topic actually asked about (career/marriage/money/...),
 *    detecting both English and Hindi/Hinglish keywords, instead of
 *    replaying a fixed list in order;
 *  - reply in the UI's language (ctx.locale) — every sentence has a real
 *    Hindi version, not a translated string, since Hindi word order and
 *    phrasing differ from a literal translation;
 *  - ground its answer in the user's REAL saved chart when one is available
 *    (moon sign, current dasha, doshas) — those values come from the
 *    astrology provider, never invented here;
 *  - notice conversation state (first turn vs. follow-up, repeated question)
 *    so it stops greeting you on every message.
 *
 * When a real model is wired (providers/llm.ts), the topic routing and
 * chart-grounding here are exactly what should be handed to it as system
 * context — the model replaces the canned prose, not the retrieval.
 */

type Topic =
  | "career" | "marriage" | "money" | "health" | "education"
  | "travel" | "timing" | "family" | "greeting" | "thanks" | "general";

const TOPIC_KEYWORDS: [Topic, string[]][] = [
  ["greeting", ["namaste", "hello", "hi ", "hey", "pranam", "namaskar", "नमस्ते", "नमस्कार", "प्रणाम"]],
  ["thanks", ["thank", "thanks", "dhanyavad", "shukriya", "धन्यवाद", "शुक्रिया", "आभार"]],
  ["career", ["career", "job", "business", "promotion", "office", "salary", "interview", "startup",
    "करियर", "नौकरी", "काम", "व्यापार", "पदोन्नति", "व्यवसाय", "नौकरी"]],
  ["marriage", ["marriage", "marry", "wedding", "shaadi", "spouse", "husband", "wife", "relationship", "partner", "match",
    "विवाह", "शादी", "पति", "पत्नी", "रिश्ता", "प्रेम", "जीवनसाथी"]],
  ["money", ["money", "wealth", "finance", "loan", "debt", "invest", "property", "dhan", "income",
    "पैसा", "धन", "वित्त", "ऋण", "निवेश", "संपत्ति", "आय", "पैसे"]],
  ["health", ["health", "illness", "disease", "surgery", "medical", "recovery", "sick",
    "स्वास्थ्य", "बीमारी", "रोग", "इलाज", "सेहत"]],
  ["education", ["study", "exam", "education", "college", "school", "degree", "result", "admission",
    "पढ़ाई", "परीक्षा", "शिक्षा", "कॉलेज", "स्कूल", "डिग्री", "परिणाम"]],
  ["travel", ["travel", "abroad", "foreign", "visa", "relocation",
    "यात्रा", "विदेश", "वीज़ा", "स्थानांतरण"]],
  ["timing", ["when", "muhurat", "auspicious", "good time", "best day", "shubh",
    "कब", "मुहूर्त", "शुभ", "अच्छा समय"]],
  ["family", ["family", "child", "children", "son", "daughter", "mother", "father", "parents", "santan",
    "परिवार", "बच्चे", "बेटा", "बेटी", "माता", "पिता", "संतान"]],
];

function detectTopic(message: string): Topic {
  const m = ` ${message.toLowerCase()} `;
  for (const [topic, words] of TOPIC_KEYWORDS) {
    if (words.some((w) => m.includes(w))) return topic;
  }
  return "general";
}

type TopicLore = Exclude<Topic, "greeting" | "thanks" | "general">;

/** What each topic maps to in a chart — house, karaka planet, and framing. */
const TOPIC_LORE_EN: Record<TopicLore, { house: string; karaka: string; frame: string }> = {
  career: { house: "10th house (Karma Bhava)", karaka: "Saturn and the Sun", frame: "professional direction and recognition" },
  marriage: { house: "7th house (Kalatra Bhava)", karaka: "Venus and Jupiter", frame: "partnership and compatibility" },
  money: { house: "2nd and 11th houses (Dhana and Labha Bhava)", karaka: "Jupiter", frame: "accumulated wealth and income flow" },
  health: { house: "6th house (Roga Bhava)", karaka: "the Sun and the ascendant lord", frame: "vitality and resilience" },
  education: { house: "4th and 5th houses (Vidya Bhava)", karaka: "Mercury and Jupiter", frame: "study and examinations" },
  travel: { house: "12th and 9th houses", karaka: "Rahu and Jupiter", frame: "long journeys and time spent away from home" },
  timing: { house: "the running dasha and current transits", karaka: "the Moon", frame: "choosing an auspicious moment" },
  family: { house: "5th house (Putra Bhava) and 4th house", karaka: "Jupiter and the Moon", frame: "children and domestic life" },
};

const TOPIC_LORE_HI: Record<TopicLore, { house: string; karaka: string; frame: string }> = {
  career: { house: "दशम भाव (कर्म भाव)", karaka: "शनि और सूर्य", frame: "व्यावसायिक दिशा और सम्मान" },
  marriage: { house: "सप्तम भाव (कलत्र भाव)", karaka: "शुक्र और गुरु", frame: "साथी और अनुकूलता" },
  money: { house: "द्वितीय और एकादश भाव (धन व लाभ भाव)", karaka: "गुरु", frame: "संचित धन और आय प्रवाह" },
  health: { house: "षष्ठ भाव (रोग भाव)", karaka: "सूर्य और लग्नेश", frame: "स्वास्थ्य और सहनशक्ति" },
  education: { house: "चतुर्थ व पंचम भाव (विद्या भाव)", karaka: "बुध और गुरु", frame: "अध्ययन और परीक्षा" },
  travel: { house: "द्वादश व नवम भाव", karaka: "राहु और गुरु", frame: "लंबी यात्रा और विदेश प्रवास" },
  timing: { house: "वर्तमान दशा और गोचर", karaka: "चंद्रमा", frame: "शुभ समय का चुनाव" },
  family: { house: "पंचम भाव (पुत्र भाव) व चतुर्थ भाव", karaka: "गुरु और चंद्रमा", frame: "संतान और पारिवारिक जीवन" },
};

const DOSHA_NAME_HI: Record<string, string> = {
  "Mangal Dosha": "मंगल दोष", "Sade Sati": "साढ़े साती", "Kaal Sarp Dosha": "काल सर्प दोष",
};

/** Grounding drawn ONLY from real computed chart values — never invented. */
function chartContext(k: KundaliResult | undefined, hi: boolean): string[] {
  if (!k) return [];
  const bits: string[] = [];
  // Same "Sanskrit (English)" / "Rahu Mahadasha"-shaped canonical strings the
  // rest of the app renders — run through the shared vedic-terms lookups so
  // Hindi output doesn't paste raw English sign/nakshatra/planet names into
  // an otherwise-Hindi sentence.
  const moonSign = hi ? vedic.rashi(k.moonSign) : k.moonSign;
  const nakshatra = hi ? vedic.nakshatra(k.nakshatra) : k.nakshatra;
  const dashaPlanet = k.currentDasha.replace(" Mahadasha", "");
  const dasha = hi ? `${vedic.planet(dashaPlanet)} महादशा` : k.currentDasha;
  if (k.moonSign && k.moonSign !== "—") bits.push(hi ? `आपकी चंद्र राशि ${moonSign} है` : `your Moon sign is ${moonSign}`);
  if (k.nakshatra && k.nakshatra !== "—") bits.push(hi ? `आपका जन्म नक्षत्र ${nakshatra} है` : `your birth nakshatra is ${nakshatra}`);
  if (k.currentDasha) bits.push(hi ? `आप ${dasha} में चल रहे हैं` : `you are running ${dasha}`);
  return bits;
}

function activeDoshas(k: KundaliResult | undefined, hi: boolean): string[] {
  if (!k) return [];
  const out: string[] = [];
  if (k.mangalDosha?.present) out.push(hi ? DOSHA_NAME_HI["Mangal Dosha"] : "Mangal Dosha");
  if (k.sadeSati?.present) out.push(hi ? DOSHA_NAME_HI["Sade Sati"] : "Sade Sati");
  if (k.kaalSarpDosha?.present) out.push(hi ? DOSHA_NAME_HI["Kaal Sarp Dosha"] : "Kaal Sarp Dosha");
  return out;
}

export const dummyProvider: AiProvider = {
  name: "dummy",
  async generateReply(ctx: ChatContext): Promise<AiReply> {
    // Simulate model latency so the UI's loading state is exercised honestly.
    await new Promise((r) => setTimeout(r, 400));
    const hi = ctx.locale === "hi";

    if (classifyIntent(ctx.message) === "consulting") {
      const plus = PLUS_PLANS.find((p) => p.id === "plus") ?? PLUS_PLANS[PLUS_PLANS.length - 1];
      return {
        kind: "upsell",
        text: hi
          ? `पूर्ण परामर्श या दैनिक मार्गदर्शन के लिए, ${plus.name} में यह सब शामिल है:`
          : `For a full consultation or daily guidance, here's what ${plus.name} unlocks:`,
        upsell: {
          headline: `${plus.name} — ₹${plus.pricePerYear}/${hi ? "वर्ष" : "year"}`,
          // plan.features itself is English-only content (src/lib/data/plans.ts) —
          // a separate, larger localisation task outside this provider's scope.
          benefits: plus.features,
          ctaLabel: hi ? "अवध प्लस देखें" : "See Awadh Plus",
          ctaHref: "/plus",
        },
      };
    }

    const topic = detectTopic(ctx.message);
    const isFirstTurn = ctx.history.length === 0;
    const grounding = chartContext(ctx.kundali, hi);
    const doshas = activeDoshas(ctx.kundali, hi);
    const open = isFirstTurn ? (hi ? "नमस्ते 🙏 " : "Namaste 🙏 ") : "";

    if (topic === "greeting") {
      return {
        kind: "text",
        text: hi
          ? (grounding.length
              ? `${open}आपको देखकर अच्छा लगा। आपकी कुंडली यहां है — ${grounding.join(", ")}। आप क्या जानना चाहेंगे: करियर, विवाह, धन, स्वास्थ्य, या किसी विशेष समय के बारे में?`
              : `${open}स्वागत है। पहले अपनी मुफ़्त कुंडली बनाएं ताकि मैं आपके वास्तविक चार्ट के आधार पर उत्तर दे सकूं। तब तक बताइए — करियर, विवाह, धन, स्वास्थ्य या समय के बारे में क्या जानना है?`)
          : (grounding.length
              ? `${open}Good to see you. I have your chart here — ${grounding.join(", ")}. What would you like to look at: career, marriage, money, health, or the timing of something specific?`
              : `${open}Welcome. Generate your free kundali first and I can ground my answers in your actual chart. In the meantime, what's on your mind — career, marriage, money, health, or timing?`),
      };
    }

    if (topic === "thanks") {
      return {
        kind: "text",
        text: hi ? "आपका स्वागत है। जब चाहें अपनी कुंडली से जुड़ा कोई भी प्रश्न पूछें 🙏" : "You're most welcome. Ask me anything else about your chart whenever you like 🙏",
      };
    }

    if (topic === "general") {
      // Reflect the question back with what's actually known, rather than
      // answering a question that wasn't asked.
      const asked = ctx.history.filter((h) => h.role === "user").length;
      const nudge = hi
        ? (asked > 1
            ? "इस पर गहराई से जानने के लिए मुझे विशेष भाव देखने होंगे — बताइए यह किस क्षेत्र से जुड़ा है (करियर, विवाह, धन, स्वास्थ्य, परिवार, या समय) और मैं आपकी कुंडली के सही हिस्से की ओर इशारा करूंगा।"
            : "बताइए यह किस क्षेत्र से संबंधित है — करियर, विवाह, धन, स्वास्थ्य, परिवार, या किसी निर्णय का समय — और मैं आपकी कुंडली के उस भाग की ओर इशारा करूंगा जो इसे नियंत्रित करता है।")
        : (asked > 1
            ? "To go deeper on this I'd need to read the specific houses involved — tell me which area it touches (career, marriage, money, health, family, or timing) and I'll point at the right part of your chart."
            : "Tell me which area it relates to — career, marriage, money, health, family, or the timing of a decision — and I'll point you at the part of your chart that governs it.");
      return {
        kind: "text",
        text: grounding.length
          ? `${open}${nudge} ${hi ? "संदर्भ हेतु" : "For reference"}, ${grounding.join(", ")}।`
          : `${open}${nudge}`,
      };
    }

    const lore = hi ? TOPIC_LORE_HI[topic] : TOPIC_LORE_EN[topic];
    const parts = hi
      ? [`${open}${lore.frame} के लिए, कुंडली मुख्यतः ${lore.house} से देखी जाती है, जिसके कारक ${lore.karaka} हैं।`]
      : [`${open}For ${lore.frame}, the chart is read primarily from the ${lore.house}, with ${lore.karaka} as the significator.`];

    if (grounding.length) {
      parts.push(hi ? `आपकी कुंडली में, ${grounding.join(", ")}।` : `In your chart, ${grounding.join(", ")}.`);
    }
    if (doshas.length) {
      parts.push(hi
        ? `आपकी कुंडली में ${doshas.join(" और ")} भी दिखाई देता है, जिसे कोई वैदिक ज्योतिषी समय संबंधी सलाह देने से पहले अवश्य विचार में लेगा — इसके उपाय उपलब्ध हैं और सामान्यतः किए जाते हैं।`
        : `Your chart also shows ${doshas.join(" and ")}, which a Vedic astrologer would weigh before giving timing advice — remedies exist and are commonly performed.`);
    }
    parts.push(hi
      ? "मैं आपको कुंडली के सही भाग की ओर इशारा कर सकता हूं, परंतु वास्तविक व्याख्या — यह सब आपके विशेष प्रश्न के लिए कैसे मिलकर काम करता है — वही है जो एक अयोध्या-सत्यापित ज्योतिषी परामर्श में उचित रूप से करता है।"
      : "I can point you at the right part of the chart, but the interpretation itself — how these combine for your specific question — is what an Ayodhya-verified astrologer does properly in a consultation.");

    return { kind: "text", text: parts.join(" ") };
  },
};
