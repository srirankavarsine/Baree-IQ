"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoginGate } from "@/components/Auth/LoginGate";
import { SiteNav } from "@/components/Navigation/SiteNav";
import { fallbackProducts } from "@/lib/fallbackProducts";
import { buildRetailSearchLinks } from "@/lib/barecheck";

export default function ProductMatchPage() {
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState("acne");
  useEffect(() => {
    const productFromLink = new URLSearchParams(window.location.search).get("product");
    if (productFromLink) setQuery(productFromLink);
  }, []);
  const product = useMemo(() => fallbackProducts.find((item) => `${item.brand} ${item.name}`.toLowerCase().includes(query.toLowerCase())) || fallbackProducts.find((item) => item.concerns.includes(goal)) || fallbackProducts[1], [query, goal]);
  const links = buildRetailSearchLinks(product);
  const score = Math.min(96, 62 + (product.concerns.includes(goal) ? 25 : 0) + (product.is_fragrance_free ? 6 : 0));
  return <main className="pixel-page"><LoginGate /><SiteNav /><div className="pixel-shell narrow-shell"><p className="eyebrow">NEW // PRODUCT MATCH</p><h1 className="pixel-title">Does this belong in your routine?</h1><p className="lede">Enter a product, pick your goal, and get a quick match with reasons you can actually understand.</p><section className="pixel-panel"><label className="label">PRODUCT NAME</label><input className="pixel-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Minimalist 10% Niacinamide" /><div className="goal-row"><label className="label">YOUR MAIN GOAL</label><select className="pixel-input" value={goal} onChange={(event) => setGoal(event.target.value)}><option value="acne">Acne / pores</option><option value="dark_spots">Dark spots</option><option value="dryness">Dryness / barrier</option><option value="dullness">Dullness</option></select></div></section><section className="match-result"><div className="match-score"><span>YOUR MATCH</span><strong>{score}</strong><small>/ 100</small></div><div><p className="eyebrow">{product.brand}</p><h2>{product.name}</h2><p className="result-copy">{product.description}</p><ul className="check-list"><li className="good">✓ Supports your {goal.replace("_", " ")} goal</li><li className="good">✓ {product.is_fragrance_free ? "Fragrance-free" : "Available in the Indian market"}</li><li className="warn">⚠ Add one new active at a time and patch test first</li></ul><p className="verdict">This could fit, but compare it with your current routine before you buy.</p><div className="buy-row"><a className="buy-button nykaa" href={links.nykaa} target="_blank" rel="noopener noreferrer">Buy on Nykaa ↗</a><a className="buy-button amazon" href={links.amazon} target="_blank" rel="noopener noreferrer">Buy on Amazon ↗</a></div><Link className="pixel-button secondary-button full-button" href={`/routine-sync?product=${encodeURIComponent(`${product.brand} ${product.name}`)}`}>Routine Sync → compare with my routine</Link></div></section></div></main>;
}
