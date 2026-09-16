import { Suspense } from "react";
import type { Metadata } from "next";

import LoginView from "@/features/auth/LoginView";

export const metadata: Metadata = {
  title: "Sign in | Baliye Couture",
};

/** useSearchParams needs a Suspense boundary or the route opts out of static. */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-[#FAF8F0]" />}>
      <LoginView />
    </Suspense>
  );
}
