import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email";
import type { KundaliResult } from "@/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function reportText(name: string, birthLine: string, r: KundaliResult, hi: boolean): string {
  const lines = hi
    ? [
        `${name} की कुंडली — अवध एस्ट्रो 🙏`,
        birthLine,
        "",
        `लग्न: ${r.ascendant}`,
        `चंद्र राशि: ${r.moonSign}`,
        `सूर्य राशि: ${r.sunSign}`,
        `नक्षत्र: ${r.nakshatra}`,
        `वर्तमान दशा: ${r.currentDasha}`,
        "",
        `मंगल दोष: ${r.mangalDosha.present ? "है" : "नहीं है"}`,
        `साढ़े साती: ${r.sadeSati.present ? "सक्रिय" : "सक्रिय नहीं"}`,
        `काल सर्प दोष: ${r.kaalSarpDosha.present ? "है" : "नहीं है"}`,
        "",
        `शुभ रत्न: ${r.luckyGem} · शुभ अंक: ${r.luckyNumber} · शुभ रंग: ${r.luckyColor} · शुभ दिशा: ${r.favorableDirection}`,
        "",
        "पूर्ण विवरण, जन्म कुंडली चार्ट और ग्रह स्थिति के लिए वेबसाइट पर देखें।",
        "",
        "— अवध एस्ट्रो, अयोध्या",
      ]
    : [
        `${name}'s Kundali — Awadh Astro 🙏`,
        birthLine,
        "",
        `Ascendant (Lagna): ${r.ascendant}`,
        `Moon Sign: ${r.moonSign}`,
        `Sun Sign: ${r.sunSign}`,
        `Nakshatra: ${r.nakshatra}`,
        `Current Dasha: ${r.currentDasha}`,
        "",
        `Mangal Dosha: ${r.mangalDosha.present ? "Present" : "Not present"}`,
        `Sade Sati: ${r.sadeSati.present ? "Active" : "Not active"}`,
        `Kaal Sarp Dosha: ${r.kaalSarpDosha.present ? "Present" : "Not present"}`,
        "",
        `Lucky Gem: ${r.luckyGem} · Lucky Number: ${r.luckyNumber} · Lucky Colour: ${r.luckyColor} · Favourable Direction: ${r.favorableDirection}`,
        "",
        "For the full birth chart, planetary positions and detailed report, visit the website.",
        "",
        "— Awadh Astro, Ayodhya",
      ];
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    email?: string; name?: string; birthLine?: string; result?: KundaliResult; locale?: string;
  };
  if (!body.email || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (!body.result || !body.name) {
    return NextResponse.json({ error: "Missing kundali data" }, { status: 400 });
  }

  const hi = body.locale === "hi";
  const res = await sendTransactionalEmail({
    to: body.email,
    subject: hi ? `${body.name} की कुंडली रिपोर्ट — अवध एस्ट्रो` : `${body.name}'s Kundali Report — Awadh Astro`,
    text: reportText(body.name, body.birthLine ?? "", body.result, hi),
  });

  if (!res.ok) {
    return NextResponse.json({ error: res.error ?? "Could not send the report right now" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
