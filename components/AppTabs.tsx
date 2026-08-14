"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBareIQUser, gatedPath } from "@/lib/session";

const tabs = [
  { path: "/barecheck", label: "Bare Check", icon: "BC" },
  { path: "/quiz", label: "Find your match", icon: "FM" },
  { path: "/community", label: "BIQ Community", icon: "BIQ" },
];

export function AppTabs({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    setHasUser(Boolean(getBareIQUser()));
  }, []);

  return (
    <nav className={`grid grid-cols-3 gap-2 ${compact ? "" : "w-full"}`} aria-label="BareIQ primary navigation">
      {tabs.map((tab) => {
        const active = pathname === tab.path;
        const href = hasUser ? tab.path : gatedPath(tab.path);
        return (
          <Link
            key={tab.path}
            href={href}
            className={`pixel-button min-h-[58px] bg-white px-2 py-2 text-center text-black transition hover:-translate-y-0.5 ${
              active ? "bg-[var(--accent)] text-black" : ""
            }`}
          >
            <span className="pixel-title block text-base leading-none">{tab.icon}</span>
            <span className="mt-1 block text-[11px] font-black uppercase leading-tight sm:text-xs">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomTabs() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-white bg-black px-3 py-3">
      <div className="app-container">
        <AppTabs compact />
      </div>
    </div>
  );
}
