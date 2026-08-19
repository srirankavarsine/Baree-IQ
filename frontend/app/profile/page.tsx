"use client";

import Link from "next/link";
import { LoginGate } from "@/components/Auth/LoginGate";
import { SiteNav } from "@/components/Navigation/SiteNav";
import { getBareIQUser } from "@/lib/session";
import { getLocalQuiz } from "@/lib/localQuiz";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<ReturnType<typeof getBareIQUser>>(null);
  useEffect(() => setUser(getBareIQUser()), []);
  const latestQuiz = typeof window !== "undefined" ? window.localStorage.getItem("bareiq_local_quizzes") : null;
  const quiz = latestQuiz ? JSON.parse(latestQuiz)[0] : null;

  return (
    <main className="pixel-page">
      <LoginGate />
      <SiteNav />
      <div className="pixel-shell narrow-shell">
        <p className="eyebrow">PLAYER PROFILE</p>
        <h1 className="pixel-title">{user?.name || "Your BareIQ profile"}</h1>
        <p className="lede">Your skin context stays close so the agent, matches, and routine checks can respond like they know you.</p>
        <section className="pixel-panel profile-panel">
          <div><span className="label">DISPLAY NAME</span><strong>{user?.name || "Not set"}</strong></div>
          <div><span className="label">SKIN GOAL</span><strong>{user?.skinGoal || "Take the quiz to set a goal"}</strong></div>
          <div><span className="label">EMAIL</span><strong>{user?.email || "Local prototype profile"}</strong></div>
          <div><span className="label">LATEST PROFILE</span><strong>{quiz ? `${quiz.skinType} · ${quiz.skinTone}` : "Not completed yet"}</strong></div>
        </section>
        <div className="action-grid">
          <Link className="pixel-button" href={"/product-match"}>Check a product →</Link>
          <Link className="pixel-button secondary-button" href={"/agent"}>Talk to BareIQ →</Link>
          <Link className="pixel-button secondary-button" href={"/quiz"}>Update my profile →</Link>
        </div>
      </div>
    </main>
  );
}
