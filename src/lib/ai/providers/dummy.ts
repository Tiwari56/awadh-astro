import { PLUS_PLANS } from "@/lib/data/plans";
import { classifyIntent } from "../intent";
import type { AiProvider, AiReply, ChatContext } from "../provider";
import type { KundaliResult } from "@/types";

/**
 * Dummy chat provider — no model call, no cost, always available.
 *
 * It is NOT a language model and cannot reason. What it does do:
 *  - route on the topic actually asked about (career/marriage/money/...),
 *    instead of replaying a fixed list in order;
 *  - ground its answer in the user's REAL saved chart when one is available
 *    (moon sign, current dasha, doshas) — those values come from the
 *    astrology provider, never invented here;
 *  - notice conversation state (first turn vs. follow-up, repeated question)
 *    so it stops greeting you on every message.
 *
 * TODO(REAL MODEL): swap for ./rag.ts once a model + key is configured. The
 * topic routing and the chart-grounding context assembled here are exactly
 * what should be handed to that model as system context — the model replaces
 * the canned prose, not the retrieval.
 */

type Topic =
  | "career" | "marriage" | "money" | "health" | "education"
  | "travel" | "timing" | "family" | "greeting" | "thanks" | "general";

const TOPIC_KEYWORDS: [Topic, string[]][] = [
  ["greeting", ["namaste", "hello", "hi ", "hey", "pranam", "namaskar"]],
  ["thanks", ["thank", "thanks", "dhanyavad", "shukriya"]],
  ["career", ["career", "job", "work", "business", "promotion", "office", "salary", "interview", "startup"]],
  ["marriage", ["marriage", "marry", "wedding", "shaadi", "spouse", "husband", "wife", "love", "relationship", "partner", "match"]],
  ["money", ["money", "wealth", "finance", "loan", "debt", "invest", "property", "dhan", "income"]],
  ["health", ["health", "illness", "disease", "surgery", "medical", "recovery", "sick"]],
  ["education", ["study", "exam", "education", "college", "school", "degree", "result", "admission"]],
  ["travel", ["travel", "abroad", "foreign", "visa", "relocation", "shift", "move"]],
  ["timing", ["when", "muhurat", "auspicious", "good time", "best day", "date for", "shubh"]],
  ["family", ["family", "child", "children", "son", "daughter", "mother", "father", "parents", "santan"]],
];

function detectTopic(message: string): Topic {
  const m = ` ${message.toLowerCase()} `;
  for (const [topic, words] of TOPIC_KEYWORDS) {
    if (words.some((w) => m.includes(w))) return topic;
  }
  return "general";
}

/** What each topic maps to in a chart — house, karaka planet, and framing. */
const TOPIC_LORE: Record<Exclude<Topic, "greeting" | "thanks" | "general">, { house: string; karaka: string; frame: string }> = {
  career: { house: "10th house (Karma Bhava)", karaka: "Saturn and the Sun", frame: "professional direction and recognition" },
  marriage: { house: "7th house (Kalatra Bhava)", karaka: "Venus and Jupiter", frame: "partnership and compatibility" },
  money: { house: "2nd and 11th houses (Dhana and Labha Bhava)", karaka: "Jupiter", frame: "accumulated wealth and income flow" },
  health: { house: "6th house (Roga Bhava)", karaka: "the Sun and the ascendant lord", frame: "vitality and resilience" },
  education: { house: "4th and 5th houses (Vidya Bhava)", karaka: "Mercury and Jupiter", frame: "study and examinations" },
  travel: { house: "12th and 9th houses", karaka: "Rahu and Jupiter", frame: "long journeys and time spent away from home" },
  timing: { house: "the running dasha and current transits", karaka: "the Moon", frame: "choosing an auspicious moment" },
  family: { house: "5th house (Putra Bhava) and 4th house", karaka: "Jupiter and the Moon", frame: "children and domestic life" },
};

/** Grounding drawn ONLY from real computed chart values — never invented. */
function chartContext(k?: KundaliResult): string[] {
  if (!k) return [];
  const bits: string[] = [];
  if (k.moonSign && k.moonSign !== "—") bits.push(`your Moon sign is ${k.moonSign}`);
  if (k.nakshatra && k.nakshatra !== "—") bits.push(`your birth nakshatra is ${k.nakshatra}`);
  if (k.currentDasha) bits.push(`you are running ${k.currentDasha}`);
  return bits;
}

function activeDoshas(k?: KundaliResult): string[] {
  if (!k) return [];
  const out: string[] = [];
  if (k.mangalDosha?.present) out.push("Mangal Dosha");
  if (k.sadeSati?.present) out.push("Sade Sati");
  if (k.kaalSarpDosha?.present) out.push("Kaal Sarp Dosha");
  return out;
}

export const dummyProvider: AiProvider = {
  name: "dummy",
  async generateReply(ctx: ChatContext): Promise<AiReply> {
    // Simulate model latency so the UI's loading state is exercised honestly.
    await new Promise((r) => setTimeout(r, 400));

    if (classifyIntent(ctx.message) === "consulting") {
      const plus = PLUS_PLANS.find((p) => p.id === "plus") ?? PLUS_PLANS[PLUS_PLANS.length - 1];
      return {
        kind: "upsell",
        text: `For a full consultation or daily guidance, here's what ${plus.name} unlocks:`,
        upsell: {
          headline: `${plus.name} — ₹${plus.pricePerYear}/year`,
          benefits: plus.features,
          ctaLabel: "See Awadh Plus",
          ctaHref: "/plus",
        },
      };
    }

    const topic = detectTopic(ctx.message);
    const isFirstTurn = ctx.history.length === 0;
    const grounding = chartContext(ctx.kundali);
    const doshas = activeDoshas(ctx.kundali);

    // Only greet once per conversation — repeating "Namaste" on every single
    // turn was the clearest sign the old version wasn't listening.
    const open = isFirstTurn ? "Namaste 🙏 " : "";

    if (topic === "greeting") {
      return {
        kind: "text",
        text: grounding.length
          ? `${open}Good to see you. I have your chart here — ${grounding.join(", ")}. What would you like to look at: career, marriage, money, health, or the timing of something specific?`
          : `${open}Welcome. Generate your free kundali first and I can ground my answers in your actual chart. In the meantime, what's on your mind — career, marriage, money, health, or timing?`,
      };
    }

    if (topic === "thanks") {
      return { kind: "text", text: "You're most welcome. Ask me anything else about your chart whenever you like 🙏" };
    }

    if (topic === "general") {
      // Reflect the question back with what's actually known, rather than
      // answering a question that wasn't asked.
      const asked = ctx.history.filter((h) => h.role === "user").length;
      const nudge = asked > 1
        ? "To go deeper on this I'd need to read the specific houses involved — tell me which area it touches (career, marriage, money, health, family, or timing) and I'll point at the right part of your chart."
        : "Tell me which area it relates to — career, marriage, money, health, family, or the timing of a decision — and I'll point you at the part of your chart that governs it.";
      return {
        kind: "text",
        text: grounding.length ? `${open}${nudge} For reference, ${grounding.join(", ")}.` : `${open}${nudge}`,
      };
    }

    const lore = TOPIC_LORE[topic];
    const parts = [
      `${open}For ${lore.frame}, the chart is read primarily from the ${lore.house}, with ${lore.karaka} as the significator.`,
    ];
    if (grounding.length) parts.push(`In your chart, ${grounding.join(", ")}.`);
    if (doshas.length) {
      parts.push(`Your chart also shows ${doshas.join(" and ")}, which a Vedic astrologer would weigh before giving timing advice — remedies exist and are commonly performed.`);
    }
    parts.push(
      "I can point you at the right part of the chart, but the interpretation itself — how these combine for your specific question — is what an Ayodhya-verified astrologer does properly in a consultation."
    );

    return { kind: "text", text: parts.join(" ") };
  },
};
