"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { consumePendingDestination, getBareIQUser } from "@/lib/session";

export default function SplashPage() {
  const router = useRouter();
  const [name, setName] = useState("Ranga");

  useEffect(() => {
    setName(getBareIQUser()?.name || "Ranga");
    const destination = consumePendingDestination("/");
    const timer = window.setTimeout(() => router.replace(destination), 1250);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-black px-4 text-white">
      <section className="pixel-window-light w-full max-w-md p-7 text-center">
        <div className="pixel-title mx-auto grid h-20 w-20 place-items-center border-3 border-black bg-[var(--accent)] text-4xl font-black text-black">B</div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-black/55">BareIQ</p>
        <h1 className="pixel-title mt-4 text-5xl font-black leading-none">Welcome {name}</h1>
      </section>
    </main>
  );
}
