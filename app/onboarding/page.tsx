"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginGate } from "@/components/Auth/LoginGate";
import { SiteNav } from "@/components/Navigation/SiteNav";
import { getBareIQUser } from "@/lib/session";
import { getRoutineContext, saveRoutineContext } from "@/lib/routine";

export default function OnboardingPage() {
  const router = useRouter();
  const [routine, setRoutine] = useState("");
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    setRoutine(getRoutineContext()?.raw || "");
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveRoutineContext(routine);
    setShowSplash(true);
    window.setTimeout(() => router.push("/community"), 1300);
  };

  const user = getBareIQUser();

  return (
    <main className="pixel-page onboarding-page">
      <LoginGate />
      <SiteNav />
      <div className="pixel-shell onboarding-shell">
        {showSplash ? (
          <section className="splash-card" aria-live="polite">
            <p className="eyebrow">WELCOME, {user?.name || "BARE"}</p>
            <h1 className="splash-logo">BareIQ</h1>
            <p>Opening BareTalk community…</p>
          </section>
        ) : (
          <>
            <p className="eyebrow">FIRST CHECK // YOUR ROUTINE</p>
            <h1 className="pixel-title">What are you using right now?</h1>
            <p className="lede">Keep it simple. Type the products you use and any ingredients you know. BareIQ will remember this on this browser and use it when comparing products.</p>
            <form className="pixel-panel onboarding-form" onSubmit={submit}>
              <label className="label" htmlFor="routine">CURRENT ROUTINE</label>
              <textarea
                id="routine"
                className="pixel-input routine-input onboarding-input"
                value={routine}
                onChange={(event) => setRoutine(event.target.value)}
                placeholder={'AM: cleanser — Minimalist salicylic acid\nAM: moisturizer — Dot & Key ceramides + hyaluronic acid\nPM: sunscreen — Re\'equil SPF 50'}
                required
              />
              <p className="field-help">One product per line is enough. You can edit the full routine later in Routine Sync.</p>
              <button className="pixel-button full-button" type="submit">Save routine & enter community →</button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
