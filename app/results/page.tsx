"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BottomTabs } from "@/components/AppTabs";
import { LoginGate } from "@/components/Auth/LoginGate";
import { fallbackProducts } from "@/lib/fallbackProducts";
import { buildPurchaseLinks } from "@/lib/barecheck";
import { buildLocalRecommendations, getLocalQuiz } from "@/lib/localQuiz";

type Product = (typeof fallbackProducts)[number] & { match_score: number; reason?: string };

export default function ResultsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black text-white" />}>
      <LoginGate />
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const params = useSearchParams();
  const localQuizId = params.get("localQuizId");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const quiz = localQuizId ? getLocalQuiz(localQuizId) : null;
    const fallbackQuiz = {
      id: "sample",
      skinType: "combination",
      skinTone: "medium",
      concerns: ["acne", "oiliness"],
      sensitivityLevel: "medium",
      budgetRange: "medium",
      prefersNatural: false,
      prefersFragranceFree: true,
      createdAt: new Date().toISOString(),
    };
    setProducts(buildLocalRecommendations(fallbackProducts, quiz || fallbackQuiz));
  }, [localQuizId]);

  const explanation = useMemo(() => {
    const top = products[0];
    if (!top) return "Take the survey to generate product matches.";
    return top.reason || "These matches fit your selected skin type, concern, budget, and product preferences.";
  }, [products]);

  return (
    <main className="min-h-screen tab-safe-bottom bg-black px-4 py-5 text-white">
      <div className="app-container">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="pixel-title text-2xl font-black text-white">BareIQ</Link>
          <div className="flex gap-2">
            <Link href="/quiz" className="pixel-button bg-black px-4 py-2 text-sm font-black text-white">Edit survey</Link>
            <Link href="/community" className="pixel-button bg-white px-4 py-2 text-sm font-black text-black">BIQ Community</Link>
          </div>
        </header>

        <section className="pixel-window-light p-5">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-black/50">Find your match</p>
          <h1 className="pixel-title mt-3 text-5xl font-black leading-none">Results</h1>
          <p className="mt-4 max-w-2xl text-sm font-bold leading-6 text-black/65">{explanation}</p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 6).map((product) => {
            const links = buildPurchaseLinks(product);
            return (
              <article key={product.id} className="pixel-window p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">{product.brand}</p>
                    <h2 className="mt-3 text-2xl font-black leading-tight">{product.name}</h2>
                  </div>
                  <span className="border-3 border-[var(--accent)] bg-[var(--accent)] px-3 py-1 text-sm font-black text-black">{product.match_score}%</span>
                </div>
                <p className="mt-4 text-sm font-bold leading-6 text-white/60">{product.reason}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
                  <span className="border-2 border-white/40 px-3 py-2">Rs {product.price}</span>
                  <span className="border-2 border-white/40 px-3 py-2 capitalize">{product.category}</span>
                  {product.is_fragrance_free && <span className="border-2 border-white/40 px-3 py-2">Fragrance free</span>}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <a href={links.amazon} target="_blank" rel="noreferrer" className="pixel-button bg-white px-4 py-3 text-center text-sm font-black text-black">Amazon</a>
                  <a href={links.nykaa} target="_blank" rel="noreferrer" className="pixel-button bg-[var(--accent)] px-4 py-3 text-center text-sm font-black text-black">Nykaa</a>
                </div>
              </article>
            );
          })}
        </section>
      </div>
      <BottomTabs />
    </main>
  );
}
