/**
 * Inside My Account the sidebar stays put; only the panel on the right
 * fades in when you move between sections.
 */
export default function AccountTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
