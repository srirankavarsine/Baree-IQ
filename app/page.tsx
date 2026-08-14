"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomTabs } from "@/components/AppTabs";
import { BareIQUser, getBareIQUser } from "@/lib/session";

const features = [
  ["01", "Personalized for You", "Takes your skin type, tone, and concerns to find products that actually work."],
  ["02", "Indian Market Only", "Products you can actually buy in India. No international shipping headache."],
  ["03", "Safety-first checks", "Bare Check helps you pause, simplify, or get help when symptoms look concerning."],
];

const homeTabs = [
  { href: "/barecheck", title: "Bare Check", body: "Chat with the product checker.", icon: "BC" },
  { href: "/quiz", title: "Find your match", body: "Take the survey and get product links.", icon: "FM" },
  { href: "/community", title: "BIQ Community", body: "Browse skincare threads.", icon: "BIQ" },
];

export default function Home() {
  const [user, setUser] = useState<BareIQUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getBareIQUser());
    setReady(true);
  }, []);

  if (!ready || !user) return <LandingPage />;

  return (
    <main className="min-h-screen tab-safe-bottom bg-black px-4 py-5 text-white">
      <div className="app-container">
        <header className="mb-6 flex items-center justify-between">
          <Link href="/login" className="pixel-button bg-white px-4 py-3 text-xs font-black uppercase text-black">
            Profile
          </Link>
          <p className="pixel-title text-xl font-black text-[var(--accent)]">BareIQ</p>
        </header>

        <section className="pixel-window-light mx-auto max-w-2xl p-5 text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-black/55">Welcome back</p>
          <h1 className="pixel-title mt-3 text-5xl font-black leading-none sm:text-7xl">{user.name || "Ranga"}</h1>
          <p className="mt-4 text-sm font-bold text-black/65">Choose where you want to go next.</p>
        </section>

        <section className="mt-7 grid gap-4 md:grid-cols-3">
          {homeTabs.map((tab) => (
            <Link key={tab.href} href={tab.href} className="pixel-window block p-5 text-white">
              <span className="pixel-title inline-grid h-12 w-12 place-items-center bg-[var(--accent)] text-xl text-black">{tab.icon}</span>
              <h2 className="pixel-title mt-5 text-3xl font-black leading-none">{tab.title}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-white/65">{tab.body}</p>
            </Link>
          ))}
        </section>
      </div>
      <BottomTabs />
    </main>
  );
}

function LandingPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="app-container">
        <section className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.45em] text-white/45">Personalized skincare intelligence</p>
          <h1 className="pixel-title mt-10 text-7xl font-black leading-none sm:text-8xl md:text-9xl">BareIQ</h1>
          <p className="mt-8 text-xl font-black text-white/80 sm:text-2xl">Minimal routines. Smarter product checks. Calmer skin decisions.</p>
          <p className="mx-auto mt-5 max-w-2xl text-base font-bold leading-7 text-white/50">
            Personalized product recommendations for Indian skin. Built with safety-first skincare guidance, curated for Gen Z.
          </p>
          <Link href="/login" className="pixel-button mt-10 inline-flex bg-white px-8 py-4 text-sm font-black uppercase text-black">
            Try BareIQ -&gt;
          </Link>
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-3">
          {features.map(([number, title, body]) => (
            <article key={number} className="pixel-window p-5">
              <p className="text-xs font-black text-white/35">{number}</p>
              <h2 className="mt-10 text-xl font-black">{title}</h2>
              <p className="mt-4 text-sm font-bold leading-6 text-white/50">{body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
