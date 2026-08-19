"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [
  ["/agent", "AI Agent"],
  ["/quiz", "Survey"],
  ["/product-match", "Match"],
  ["/routine-sync", "Routine Sync"],
  ["/community", "Community"],
  ["/profile", "Profile"],
] as const;

export function SiteNav({ publicOnly = false }: { publicOnly?: boolean }) {
  const pathname = usePathname();
  const visibleLinks = publicOnly ? links.slice(0, 0) : links;

  return (
    <nav aria-label="BareIQ primary navigation" className="pixel-nav">
      <Link href="/" className="pixel-logo">BareIQ<span>_</span></Link>
      <div className="pixel-nav-links">
        {visibleLinks.map(([href, label]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={active ? "pixel-nav-link active" : "pixel-nav-link"}>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
