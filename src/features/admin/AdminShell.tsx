'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Coins, FileText, Home, LayoutGrid, LogOut, Mail, Menu, PanelBottom, Ruler, ShoppingBag, Sparkles, X } from 'lucide-react';

import { useAppDispatch } from '@/store/hooks';
import { adminApi, useGetAdminMeQuery } from '@/store/api/adminApi';
import { ADMIN_SIGNED_OUT_EVENT, clearAdminTokens, loadAdminTokens } from '@/lib/adminAuthStorage';
import { cn } from '@/lib/format';

const NAV = [
  { href: '/admin/design-builder', label: 'Design Builder', icon: LayoutGrid },
  { href: '/admin/ai-studio', label: 'AI Studio', icon: Sparkles },
  { href: '/admin/measurements', label: 'Measurement fields', icon: Ruler },
  { href: '/admin/content/home', label: 'Home page', icon: Home },
  { href: '/admin/content/products', label: 'Pre-made Designs page', icon: ShoppingBag },
  { href: '/admin/content/footer', label: 'Footer', icon: PanelBottom },
  { href: '/admin/content/terms', label: 'Terms & Conditions', icon: FileText },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  /* Always here: the on/off switch for credits lives on this page. */
  { href: '/admin/credits', label: 'Design credits', icon: Coins },
];

/**
 * Admin chrome and guard. Everything under /admin except the login page
 * needs an admin session; the backend enforces it on every call, this only
 * decides what to render.
 */
export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLogin = pathname === '/admin/login';

  /* localStorage is browser-only — decide after mount, not during SSR. */
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => setHasSession(Boolean(loadAdminTokens()));
    check();
    window.addEventListener(ADMIN_SIGNED_OUT_EVENT, check);
    return () => window.removeEventListener(ADMIN_SIGNED_OUT_EVENT, check);
  }, [pathname]);

  useEffect(() => {
    if (hasSession === false && !isLogin) {
      dispatch(adminApi.util.resetApiState());
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [hasSession, isLogin, pathname, router, dispatch]);

  const { data: me } = useGetAdminMeQuery(undefined, { skip: !hasSession || isLogin });

  /* Phone drawer: Escape closes it, and the page behind doesn't scroll. */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    /* Widened to the desktop layout: the drawer is gone, so unlock the page. */
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onWide = () => desktop.matches && setMenuOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onWide);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onWide);
    };
  }, [menuOpen]);

  if (isLogin) return <>{children}</>;
  if (!hasSession) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#888]">Loading…</div>;
  }

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition',
              active ? 'bg-secondary text-white' : 'text-[#ddd] hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="mt-auto border-t border-white/10 pt-4">
      {me && <p className="truncate px-3 text-xs text-[#aaa]">{me.email}</p>}
      <button
        type="button"
        onClick={clearAdminTokens}
        className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[#ddd] transition hover:bg-white/10 hover:text-white"
      >
        <LogOut className="size-4" aria-hidden /> Sign out
      </button>
      <Link href="/" target="_blank" className="block px-3 py-1 text-xs text-[#aaa] underline hover:text-white">
        View website
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f3ee] lg:grid lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 bg-dark p-4 lg:flex">
        <Link href="/admin" className="px-3 pt-2 text-lg font-medium text-white">
          Baliye <span className="text-[#F9C365]">Admin</span>
        </Link>
        {nav}
        {footer}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-dark px-4 py-3 lg:hidden">
        <Link href="/admin" className="font-medium text-white">
          Baliye <span className="text-[#F9C365]">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="-mr-2 flex size-10 items-center justify-center text-white"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="admin-drawer"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile menu: slides in from the left over a dimmed page, like the
          storefront's. Always rendered so it can animate both ways. */}
      <div
        aria-hidden
        onClick={() => setMenuOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 lg:hidden',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        id="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Admin menu"
        inert={!menuOpen}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto bg-dark p-4 shadow-2xl transition-transform duration-300 ease-out lg:hidden',
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/admin" onClick={() => setMenuOpen(false)} className="px-3 pt-1 text-lg font-medium text-white">
            Baliye <span className="text-[#F9C365]">Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex size-10 items-center justify-center rounded-md text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        {nav}
        {footer}
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
