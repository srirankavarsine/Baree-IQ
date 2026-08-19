"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoginGate } from "@/components/Auth/LoginGate";
import { SiteNav } from "@/components/Navigation/SiteNav";
import { apiFetch } from "@/lib/api";
import { fallbackProducts } from "@/lib/fallbackProducts";
import { buildRetailSearchLinks } from "@/lib/barecheck";
import { getRoutineContext, saveRoutineContext } from "@/lib/routine";

export default function RoutineSyncPage() {
  const [productName, setProductName] = useState("Minimalist Niacinamide 10% Face Serum");
  const [routine, setRoutine] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const product = new URLSearchParams(window.location.search).get("product");
    if (product) setProductName(product);
    setRoutine(getRoutineContext()?.raw || "");
  }, []);

  const product = useMemo(() => fallbackProducts.find((item) => `${item.brand} ${item.name}`.toLowerCase().includes(productName.toLowerCase())) || fallbackProducts[1], [productName]);
  const links = buildRetailSearchLinks(product);

  const analyze = async (event: FormEvent) => {
    event.preventDefault();
    const cleanedRoutine = routine.trim();
    if (!cleanedRoutine || !productName.trim()) return;
    saveRoutineContext(cleanedRoutine);
    setIsAnalyzing(true);
    setAnalysis("");
    try {
      const response = await apiFetch<{ text: string }>("/api/agent/chat", {
        method: "POST",
        body: JSON.stringify({
          routine: cleanedRoutine,
          messages: [{ role: "user", content: `Routine Sync request. Product to compare: ${productName}. Current routine:\n${cleanedRoutine}` }],
          mode: "chat",
        }),
      });
      setAnalysis(response.text);
    } catch (error) {
      setAnalysis(`I couldn’t complete the routine check right now. ${error instanceof Error ? error.message : "Please try again in a moment."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="pixel-page">
      <LoginGate /><SiteNav />
      <div className="pixel-shell narrow-shell">
        <p className="eyebrow">ROUTINE SYNC // COMPARE</p>
        <h1 className="pixel-title">Make your routine make sense.</h1>
        <p className="lede">Write your products in plain language. BareIQ will compare the new product with what you already use and explain the trade-offs.</p>

        <form className="pixel-panel" onSubmit={analyze}>
          <label className="label" htmlFor="product">PRODUCT TO COMPARE</label>
          <input id="product" className="pixel-input" value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="Minimalist 10% Niacinamide" required />
          <label className="label top-label" htmlFor="routine">YOUR CURRENT ROUTINE</label>
          <textarea id="routine" className="pixel-input routine-input" value={routine} onChange={(event) => setRoutine(event.target.value)} placeholder={'AM: moisturizer — Dot & Key — ceramides, hyaluronic acid\nPM: cleanser — Minimalist — salicylic acid\nDaily: sunscreen — Re\'equil — SPF 50'} required />
          <p className="field-help">One product per line is enough. Include the category, brand/product, and ingredients when you know them. Add AM/PM or reactions only if useful.</p>
          <button className="pixel-button full-button" type="submit" disabled={isAnalyzing}>{isAnalyzing ? "Analyzing routine…" : "Analyze my routine →"}</button>
        </form>

        <section className="sync-card">
          <div className="sync-header">
            <div><p className="eyebrow">CHECKING</p><h2>{product.brand} {product.name}</h2></div>
            <span className="sync-badge good-badge">GROQ READY</span>
          </div>
          <div className="sync-grid">
            <div><span className="label">PRODUCT ROLE</span><p>{product.category} for {product.concerns.replaceAll(",", ", ")}.</p></div>
            <div><span className="label">KEY INGREDIENTS</span><p>{product.key_ingredients}</p></div>
            <div><span className="label">NEXT STEP</span><p>Analyze overlap and add only if it has a clear job in your routine.</p></div>
          </div>
          {analysis && <div className="ai-analysis"><span className="label">BAREIQ ANALYSIS</span><p>{analysis}</p></div>}
          <div className="buy-row">
            <a className="buy-button nykaa" href={links.nykaa} target="_blank" rel="noopener noreferrer">Open Nykaa ↗</a>
            <a className="buy-button amazon" href={links.amazon} target="_blank" rel="noopener noreferrer">Open Amazon ↗</a>
            <Link href="/product-match" className="pixel-button secondary-button">Back to Match →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
