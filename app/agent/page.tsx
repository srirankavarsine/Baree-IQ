"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LoginGate } from "@/components/Auth/LoginGate";
import { SiteNav } from "@/components/Navigation/SiteNav";
import { fallbackProducts } from "@/lib/fallbackProducts";
import { getBareIQUser } from "@/lib/session";

type Message = { role: "user" | "assistant"; text: string; image?: string };
const MEMORY_KEY = "bareiq_agent_memory";

function replyTo(text: string, userName: string) {
  const lower = text.toLowerCase();
  const product = fallbackProducts.find((item) => `${item.brand} ${item.name}`.toLowerCase().includes(lower)) ||
    fallbackProducts.find((item) => lower.includes(item.brand.toLowerCase()) || lower.includes(item.category));
  if (/^(hi|hello|hey|yo)\b/.test(lower)) return `Hey ${userName || "there"}! I’m BareIQ. Tell me what your skin is doing, what you’re using, or drop a product name and I’ll help you think it through.`;
  if (lower.includes("routine") || lower.includes("compare") || lower.includes("already")) return "I can map a product against your current routine. Open Routine Sync and I’ll flag overlap, missing basics, and active-stacking risks.";
  if (lower.includes("image") || lower.includes("photo") || lower.includes("picture")) return "I’ve attached the image to this chat context. I can use it as a visual note, but I can’t diagnose a skin condition from a photo. Share symptoms and timing too so the safety check is more useful.";
  if (product) return `${product.brand} ${product.name} is a ${product.category} aimed at ${product.concerns.replaceAll(",", ", ")}. I’d check how it fits your goal and existing actives before adding it. Want a match score or a routine comparison?`;
  if (lower.includes("acne") || lower.includes("redness") || lower.includes("irritation")) return "Let’s slow it down: what product changed, when did the symptoms start, and are you feeling burning, swelling, pain, or trouble breathing? Those details decide whether to pause, simplify, or seek urgent care.";
  return "Got it. I’ll keep that in mind for this chat. Tell me your skin goal, the exact product, and what changed recently, and I’ll connect the dots instead of forcing you through a form.";
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string>();
  const [userName, setUserName] = useState("there");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const user = getBareIQUser();
    setUserName(user?.name || "there");
    const saved = window.localStorage.getItem(MEMORY_KEY);
    setMessages(saved ? JSON.parse(saved) : [{ role: "assistant", text: `Hey ${user?.name || "there"}! I’m your BareIQ AI agent. What are we figuring out today?` }]);
  }, []);
  useEffect(() => { if (messages.length) window.localStorage.setItem(MEMORY_KEY, JSON.stringify(messages.slice(-30))); endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const suggestions = useMemo(() => ["Can I add this to my routine?", "My skin is irritated", "Find a product for acne"], []);
  const send = (event?: FormEvent) => {
    event?.preventDefault();
    if (!input.trim() && !image) return;
    const text = input.trim() || "I attached a skin photo.";
    const userMessage: Message = { role: "user", text, image };
    setMessages((current) => [...current, userMessage, { role: "assistant", text: replyTo(text, userName) }]);
    setInput(""); setImage(undefined);
  };
  return (
    <main className="pixel-page">
      <LoginGate /><SiteNav />
      <div className="pixel-shell agent-shell">
        <div className="agent-heading"><div><p className="eyebrow">BAREIQ AI // ONLINE</p><h1 className="pixel-title">Your skin sidekick.</h1><p className="lede">Chat naturally. Ask about a product. Upload a photo as context. Your recent chat stays on this device.</p></div><span className="status-dot">● READY</span></div>
        <section className="chat-window" aria-live="polite">
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>{message.role === "assistant" && <span className="chat-avatar">BIQ</span>}<div><p>{message.text}</p>{message.image && <img src={message.image} alt="Attached skin context" className="chat-image" />}</div></div>)}
          <div ref={endRef} />
        </section>
        <div className="suggestions">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => setInput(suggestion)}>{suggestion}</button>)}</div>
        <form onSubmit={send} className="chat-composer"><label className="upload-button" title="Attach an image">＋<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setImage(String(reader.result)); reader.readAsDataURL(file); }} /></label><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask BareIQ anything about your skin..." /><button className="pixel-button" type="submit">Send →</button></form>
        <p className="disclaimer">BareIQ gives safety-first information, not a diagnosis. Swelling, trouble breathing, severe pain, or a fast-spreading rash needs urgent medical care.</p>
      </div>
    </main>
  );
}
