import type { Metadata } from "next";
import { termsContent } from "./pageData";
import { getSiteContent } from "@/lib/siteContent";

export const metadata: Metadata = {
  title: "Terms & Conditions | Baliye Couture",
  description: "The terms that apply to orders, custom designs and use of the Baliye Couture website.",
  alternates: { canonical: "/terms-and-conditions" },
};

/* Edited in the admin panel; pageData.ts holds the default text. */
export default async function TermsPage() {
  const { html } = await getSiteContent("terms", { html: termsContent });

  return (
    <main className="container mx-auto max-w-7xl px-4 py-20">
      <article
        className="terms-content"
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    </main>
  );
}