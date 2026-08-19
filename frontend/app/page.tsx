"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SiteNav } from "@/components/Navigation/SiteNav";

export default function Home() {
  return (
    <main className="pixel-page landing-page">
      <SiteNav publicOnly />
      <div className="pixel-shell landing-shell">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="landing-hero"
        >
          <p className="eyebrow">PERSONALIZED SKINCARE INTELLIGENCE</p>
          <h1 className="pixel-title landing-title">BareIQ</h1>
          <p className="landing-tagline">Minimal routines. Smarter product checks. Calmer skin decisions.</p>
          <p className="lede landing-lede">Tell BareIQ your skin context and routine. Get product suggestions you can buy in India, plus clear reasons before you add another step.</p>
          <Link className="pixel-button landing-cta" href="/login?next=%2Fonboarding">Try BareIQ →</Link>
        </motion.div>

        <section className="landing-grid" aria-label="BareIQ features">
          <FeatureCard
            number="01"
            title="Your context first"
            description="Skin type, tone, concerns, budget, and the products already in your routine."
          />
          <FeatureCard
            number="02"
            title="Buyable in India"
            description="A simple Survey ends with recommendations and Nykaa/Amazon click-throughs."
          />
          <FeatureCard
            number="03"
            title="Safer decisions"
            description="Routine overlap, active combinations, image context, and no-diagnosis safety guidance."
          />
        </section>
      </div>
      <footer className="landing-footer">BAREIQ // MADE FOR INDIAN SKINCARE LOVERS</footer>
    </main>
  );
}

function FeatureCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="landing-card"
    >
      <p className="landing-card-number">{number}</p>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
}
