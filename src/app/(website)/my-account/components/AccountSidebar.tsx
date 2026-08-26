"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { useAuth } from "@/features/auth/useAuth";
import { useGetProfileQuery } from "@/store/api/profileApi";

import { accountMenu } from "./accountMenu";

export default function AccountSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { data: profile } = useGetProfileQuery();

  return (
    <aside className="w-full bg-white">
      {/* Whoever is signed in — useful when several people share a device. */}
      <div className="border-b border-[#EAE6DF] px-4 py-4">
        <p className="truncate text-sm font-semibold text-[#222]">
          {profile?.name || "Welcome"}
        </p>
        <p className="truncate text-xs text-[#8A8A8A]">
          {profile?.phone || profile?.email || ""}
        </p>
      </div>

      {accountMenu.map((group, groupIndex) => (
        <div
          key={group.title}
          className={groupIndex > 0 ? "border-t border-[#EAE6DF]" : ""}
        >
          <h3 className="px-4 pt-5 text-sm font-semibold text-[#222]">
            {group.title}
          </h3>

          <nav className="py-3">
            {group.items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "font-medium text-[#A52C45]"
                      : "text-[#666] hover:text-[#A52C45]"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      <div className="border-t border-[#EAE6DF] p-4">
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-[#666] transition-colors hover:bg-[#FBF6F7] hover:text-[#A52C45]"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
