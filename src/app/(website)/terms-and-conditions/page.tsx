import { termsContent } from "./pageData";

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