"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getBareIQUser, saveBareIQUser, savePendingDestination } from "@/lib/session";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("Ranga");

  useEffect(() => {
    const next = searchParams.get("next") || "/";
    savePendingDestination(next);
    if (getBareIQUser()) router.replace(next);
  }, [router, searchParams]);

  const signIn = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    saveBareIQUser({
      name,
      email: "ranga@bareiq.app",
      skinGoal: "Check products, find matches, and join the BareIQ community.",
    });
    router.push("/splash");
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="app-container grid min-h-[calc(100vh-4rem)] place-items-center">
        <form onSubmit={signIn} className="pixel-window-light w-full max-w-lg p-6">
          <Link href="/" className="pixel-title text-xl font-black text-black">BareIQ</Link>
          <h1 className="pixel-title mt-8 text-5xl font-black leading-none">Try BareIQ</h1>
          <p className="mt-4 text-sm font-bold leading-6 text-black/60">Local sign-in only. No password. This keeps the prototype simple.</p>
          <label className="mt-6 block">
            <span className="text-xs font-black uppercase text-black/55">Profile name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full border-3 border-black bg-white px-4 py-4 font-black outline-none"
              required
            />
          </label>
          <button className="pixel-button mt-6 w-full bg-[var(--accent)] px-6 py-4 text-sm font-black uppercase text-black">
            Continue -&gt;
          </button>
        </form>
      </div>
    </main>
  );
}
