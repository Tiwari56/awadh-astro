import type { Metadata, Viewport } from "next";
import { Marcellus, Mukta } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import SessionProvider from "@/components/providers/SessionProvider";

// Sets html[data-theme] before paint so there's no flash of the wrong theme.
// Mirrors applyTheme() in ThemeToggle.tsx — keep the two in sync.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('awadh-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

// Display serif for headings & logo — temple-inscription feel, quietly premium.
const display = Marcellus({
  subsets: ["latin"],
  weight: ["400"],
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
  title: "Awadh Astro — Sacred Rituals from the Land of Shri Ram",
  description:
    "Free kundali, kundali matching, pujas performed live in Ayodhya temples, consultations with Ayodhya-verified astrologers, and AI astro chat.",
  appleWebApp: { capable: true, title: "Awadh Astro", statusBarStyle: "black-translucent" },
};

// Mobile-first viewport. "Temple Gold" chrome, dark by default with a light
// mode available (toggle in header) — browser chrome follows the same choice.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8ec" },
    { media: "(prefers-color-scheme: dark)", color: "#1b0f0a" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <SessionProvider>
          <LanguageProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <BottomNav />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
