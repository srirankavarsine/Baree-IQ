"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LoginGate } from "@/components/Auth/LoginGate";
import { SiteNav } from "@/components/Navigation/SiteNav";
import { fallbackProducts } from "@/lib/fallbackProducts";

export default function RoutineSyncPage() {
  const [productName, setProductName] = useState("Minimalist Niacinamide 10% Face Serum");
  const [routine, setRoutine] = useState("Cleanser, moisturizer, sunscreen");
  useEffect(() => { const product = new URLSearchParams(window.location.search).get("product"); if (product) setProductName(product); }, []);
  const product = useMemo(() => fallbackProducts.find((item) => `${item.brand} ${item.name}`.toLowerCase().includes(productName.toLowerCase())) || fallbackProducts[1], [productName]);
  const overlap = routine.toLowerCase().includes("serum") || routine.toLowerCase().includes("niacinamide");
  return <main className="pixel-page"><LoginGate /><SiteNav /><div className="pixel-shell narrow-shell"><p className="eyebrow">ROUTINE SYNC // FM</p><h1 className="pixel-title">Make your routine make sense.</h1><p className="lede">See what this product adds, duplicates, or risks stacking with what you already use.</p><section className="pixel-panel"><label className="label">PRODUCT TO COMPARE</label><input className="pixel-input" value={productName} onChange={(event) => setProductName(event.target.value)} /><label className="label top-label">YOUR CURRENT ROUTINE</label><textarea className="pixel-input routine-input" value={routine} onChange={(event) => setRoutine(event.target.value)} placeholder="List your cleanser, serums, moisturizer, sunscreen, and actives" /></section><section className="sync-card"><div className="sync-header"><div><p className="eyebrow">CHECKING</p><h2>{product.brand} {product.name}</h2></div><span className={overlap ? "sync-badge warn-badge" : "sync-badge good-badge"}>{overlap ? "OVERLAP FOUND" : "CLEAR LANE"}</span></div><div className="sync-grid"><div><span className="label">ADDS</span><p>One targeted {product.category} option for {product.concerns.replaceAll(",", ", ")}.</p></div><div><span className="label">WATCH</span><p>{overlap ? "Your routine already mentions a similar serum/active. You may not need another layer." : "Patch test and introduce it slowly; avoid changing multiple products together."}</p></div><div><span className="label">VERDICT</span><p className="verdict">{overlap ? "You probably don't need this yet — your current routine may already cover the same goal." : "This has a clear role, but add it one product at a time."}</p></div></div><Link href="/product-match" className="pixel-button">Back to Product Match →</Link></section></div></main>;
}
