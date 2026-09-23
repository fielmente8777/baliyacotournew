import type { Metadata } from "next";
import { termsContent } from "./pageData";

export const metadata: Metadata = {
  title: "Terms & Conditions | Baliye Couture",
  description: "The terms that apply to orders, custom designs and use of the Baliye Couture website.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-20">
      <article
        className="terms-content"
        dangerouslySetInnerHTML={{
          __html: termsContent,
        }}
      />
    </main>
  );
}
