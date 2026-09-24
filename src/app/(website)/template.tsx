/**
 * Runs on every page change (a template re-mounts where a layout would
 * persist), so each page fades up into place. The navbar and footer live in
 * the root layout, outside this, so they stay still.
 */
export default function WebsiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
