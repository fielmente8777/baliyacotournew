import { Suspense } from "react";
import AdminLoginView from "@/features/admin/AdminLoginView";

/* useSearchParams needs a Suspense boundary to prerender. */
export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginView />
    </Suspense>
  );
}
