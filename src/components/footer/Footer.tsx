import Link from "next/link";
import Image from "next/image";
import { websiteFooterData as defaults } from "./footerData";
import { getSiteContent } from "@/lib/siteContent";

/**
 * Links typed in the admin often miss their scheme — "name@gmail.com" as the
 * href opens a 404 page. An email address becomes mailto:, a phone number
 * becomes tel:, so a contact link always works whatever was saved.
 */
function contactHref(href: string, label: string) {
  const value = (href || label).trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(value)) return value;
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return `mailto:${value}`;
  if (/^\+?[\d\s()-]{7,}$/.test(value)) return `tel:${value.replace(/[^\d+]/g, "")}`;
  return value;
}

const wrap = "mx-auto w-full max-w-320 px-4 md:px-10";

/**
 * Brand column (logo, line, social icons), then the admin's link columns,
 * then the bottom bar. Mint with dark text, dark bottom bar: the site's
 * footer colours. Edited in the admin panel; footerData.tsx holds the defaults.
 */
const Footer = async () => {
  const footer = await getSiteContent("footer", defaults);
  const socials = (footer.socials ?? []).filter((s) => s.href.trim());
  const lists = footer.lists.filter((list) => list.links.length);

  return (
    <footer className="bg-primary text-dark">
      <div className={`${wrap} grid grid-cols-2 gap-x-6 gap-y-10 pb-12 pt-14 md:pt-18 lg:grid-cols-[minmax(0,1.6fr)_repeat(var(--cols),minmax(0,1fr))] lg:gap-8`} style={{ "--cols": Math.max(lists.length, 1) } as React.CSSProperties}>
        <div className="col-span-2 flex flex-col items-start gap-4 lg:col-span-1">
          <Link href="/" aria-label="Baliye Couture home" className="relative block aspect-305/96 w-44">
            <Image src={footer.logo} alt="Baliye Couture" fill sizes="176px" className="object-contain object-left" />
          </Link>
          {footer.description && <p className="max-w-xs text-sm leading-relaxed text-light">{footer.description}</p>}
          {socials.length > 0 && (
            <ul className="flex gap-2">
              {socials.map((social, i) => (
                <li key={i}>
                  <a
                    href={contactHref(social.href, social.label)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-11 items-center justify-center rounded-full border border-dark/25 text-dark transition-colors hover:border-secondary hover:text-secondary"
                  >
                    <SocialIcon href={social.href} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lists.map((list, index) => (
          <nav key={index} aria-label={list.title || "Links"} className="flex min-w-0 flex-col gap-2">
            {list.title && (
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-dark">{list.title}</h3>
            )}
            <ul className="flex flex-col text-sm">
              {list.links.map((item, i) => (
                <li key={i} className="wrap-break-word">
                  {/* py-2.5: a comfortable tap target on phones. */}
                  <Link
                    href={contactHref(item.href, item.label)}
                    className="inline-block py-2.5 text-light transition-colors hover:text-secondary md:py-1.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="bg-dark">
        <div className={`${wrap} flex flex-col items-start justify-between gap-2 py-5 text-[13px] text-white md:flex-row md:items-center`}>
          <p>{footer.copyright}</p>
          {footer.credit && <p className="text-white/80">{footer.credit}</p>}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

/** Picked from the address, so the admin only types a link. */
function SocialIcon({ href }: { href: string }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const url = href.toLowerCase();

  if (url.includes("instagram"))
    return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
      </svg>
    );
  if (url.includes("facebook"))
    return (
      <svg {...props}>
        <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" />
      </svg>
    );
  if (url.includes("youtube"))
    return (
      <svg {...props}>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
      </svg>
    );
  if (url.includes("pinterest"))
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M11 8.5c3-1 5 .5 5 3 0 2.5-1.7 4-3.5 4-1 0-1.6-.6-1.6-.6L9.5 21" />
      </svg>
    );
  if (url.includes("wa.me") || url.includes("whatsapp"))
    return (
      <svg {...props}>
        <path d="M4 20l1.3-4A8 8 0 1 1 8.5 19z" />
        <path d="M9 9.5c.3 2 2.5 4.3 4.6 4.7l1.2-1.2 1.7.8" />
      </svg>
    );
  if (url.includes("x.com") || url.includes("twitter"))
    return (
      <svg {...props}>
        <path d="M5 4l14 16M19 4L5 20" />
      </svg>
    );
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
