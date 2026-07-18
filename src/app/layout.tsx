import type { Metadata, Viewport } from "next";
import { Fraunces, Mukta } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

// Display serif for headings & logo — warm, premium, a touch traditional.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Body/UI sans — highly legible and Devanagari-capable for the Hindi-first UI.
const body = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Awadh Astro — Astrology from the Land of Shri Ram",
  description:
    "Free kundali, live consultations with Ayodhya-verified astrologers, AI astro chat, and personalized muhurat alerts.",
  appleWebApp: { capable: true, title: "Awadh Astro", statusBarStyle: "default" },
};

// Mobile-first viewport: fit device width, allow user zoom (accessibility), and
// tint the browser chrome saffron so the app feels native on Android/iOS.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#92400e",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
