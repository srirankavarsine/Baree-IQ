"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { consumePendingDestination, getBareIQUser, saveBareIQUser, savePendingDestination } from "@/lib/session";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-900" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const next = searchParams.get("next");
    if (next) savePendingDestination(next);
    if (getBareIQUser()) {
      router.replace(consumePendingDestination(next || "/quiz"));
    }
  }, [router, searchParams]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveBareIQUser({ name, email, skinGoal: "Skin profile pending" });
    router.push(consumePendingDestination("/quiz"));
  };

  return (
    <main className="pixel-page login-page">
      <div className="pixel-shell login-shell">
        <section>
          <Link href="/" className="pixel-logo">BareIQ<span>_</span></Link>
          <p className="eyebrow login-eyebrow">WELCOME TO BAREIQ</p>
          <h1 className="pixel-title login-title">One quick intro, then your skin tools open.</h1>
          <p className="lede">Your name stays on this device for the prototype. We’ll use it to keep the agent and community experience personal.</p>
        </section>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-panel login-form"
        >
          <h2 className="pixel-section-title">Create your BareIQ profile</h2>
          <label className="label login-label">
            Name or display alias
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Sriranka or Anonymous Bare"
              className="pixel-input"
              required
            />
          </label>
          <label className="label login-label">
            Email <span className="optional">(optional)</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="pixel-input"
            />
          </label>
          <button className="pixel-button full-button">
            Continue
          </button>
          <p className="disclaimer">Local prototype sign-in. No password. Your profile stays on this device.</p>
        </motion.form>
      </div>
    </main>
  );
}
