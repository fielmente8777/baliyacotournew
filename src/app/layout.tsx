import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import "./globals.css";
import "./style.scss";
import Navbar from "@/components/navbar/NavBar";
import Footer from "@/components/footer/Footer";
import ReduxProvider from "@/store/provider";
import { ALLOW_INDEXING, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

/**
 * Site-wide defaults. Pages override title/description; everything else
 * (base URL for relative links, social cards, indexing) is inherited.
 * The default share image comes from app/opengraph-image.tsx.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | Handcrafted & Made-to-Measure Ethnic Wear`,
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_CA",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  /* Belt and braces with robots.ts: test and ngrok URLs also get a noindex tag. */
  robots: ALLOW_INDEXING ? { index: true, follow: true } : { index: false, follow: false },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={` ${firaSans.variable} bg-[#FAF8F0] h-full antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd).replace(/</g, "\\u003c") }}
        />
        <ReduxProvider>
          <Navbar />
          {children}
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
