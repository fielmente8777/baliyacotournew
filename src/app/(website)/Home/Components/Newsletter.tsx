"use client";

import { useId, useState } from "react";
import { CircleCheck } from "lucide-react";
import { useSubscribeNewsletterMutation } from "@/store/api/newsletterApi";
import type { HomePageContent } from "../pagedata";
import { AccentTitle, wrap } from "./ui";

/** Sign-ups land under Admin → Newsletter. */
export default function Newsletter({ title, titleAccent, description, placeholder, buttonLabel, successMessage }: HomePageContent["newsletter"]) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await subscribe({ email: email.trim(), source: "home" }).unwrap();
      setDone(true);
    } catch (err) {
      const data = (err as { data?: { message?: string; errors?: { message: string }[] } }).data;
      setError(data?.errors?.[0]?.message ?? data?.message ?? "Couldn't sign you up just now. Please try again.");
    }
  };

  return (
    <section aria-label="Newsletter" className="bg-[#F1EDE6]">
      <div className={`${wrap} grid items-center gap-8 py-12 md:py-16 lg:grid-cols-2 lg:gap-10`}>
        <div className="flex flex-col gap-2">
          <AccentTitle title={title} accent={titleAccent} className="text-[30px] leading-[1.1] md:text-[40px]" />
          {description && <p className="text-[15px] text-light">{description}</p>}
        </div>

        {done ? (
          <p role="status" className="flex items-center gap-3 text-base font-medium text-dark">
            <CircleCheck className="size-6 shrink-0 text-secondary" aria-hidden />
            {successMessage}
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-2" noValidate>
            <label htmlFor={id} className="text-[13px] font-medium text-light">
              Email address
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={id}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className="min-h-13 min-w-0 flex-1 rounded-full border border-[#C9B7A0] bg-white px-5 text-[15px] text-dark outline-none transition focus:border-secondary"
              />
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="min-h-13 rounded-full bg-dark px-8 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isLoading ? "Signing up…" : buttonLabel}
              </button>
            </div>
            {error && (
              <p id={`${id}-error`} role="alert" className="text-[13px] text-secondary">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
