"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { BottomTabs } from "@/components/AppTabs";
import { LoginGate } from "@/components/Auth/LoginGate";
import { BareCheckInput, analyzeBareCheck, buildWebLookupLinks } from "@/lib/barecheck";

type ChatMessage = {
  role: "agent" | "user";
  text: string;
};

const initialForm: BareCheckInput = {
  productName: "",
  productUrl: "",
  productKind: "",
  productVariant: "",
  question: "",
  timeline: "2-3 days",
  skinArea: [],
  symptoms: [],
  severity: "Mild",
  changedFactors: [],
  mixedActives: [],
  photoVisibility: "private",
  intent: "Ask AI",
  story: "",
  skinType: "",
};

const quickChips = ["burning", "itching", "redness", "acne", "peeling", "swelling", "fast-spreading rash", "retinol", "vitamin c", "salicylic acid"];

export default function BareCheckPage() {
  const [form, setForm] = useState<BareCheckInput>(initialForm);
  const [draft, setDraft] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      text: "Tell me the product name or paste a product link. Then describe what changed on your skin. I will flag likely irritants, not diagnose.",
    },
  ]);
  const [result, setResult] = useState<ReturnType<typeof analyzeBareCheck> | null>(null);

  const lookupLinks = useMemo(() => buildWebLookupLinks(form.productName || form.productUrl || draft || "skincare product"), [draft, form.productName, form.productUrl]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const nextForm = absorbText(form, text);
    setForm(nextForm);
    setMessages((current) => [...current, { role: "user", text }, { role: "agent", text: "I am checking product clues, ingredient-risk words, review-style signals, and your symptoms now..." }]);
    setDraft("");
    setIsThinking(true);
    setResult(null);

    window.setTimeout(() => {
      const analysis = analyzeBareCheck(nextForm);
      setResult(analysis);
      setIsThinking(false);
      setMessages((current) => [
        ...current,
        {
          role: "agent",
          text: analysis.isRelevant
            ? `${analysis.recommendation}. ${analysis.explanation}`
            : "This does not look related to skincare or a product reaction. Send a product name, ingredient list, symptom, or upload a clear label photo.",
        },
      ]);
    }, 900);
  };

  const addChip = (value: string) => {
    setDraft((current) => current ? `${current}, ${value}` : value);
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    setForm((current) => ({ ...current, question: `${current.question} uploaded product photo label`.trim() }));
    setMessages((current) => [...current, { role: "user", text: `Uploaded photo: ${file.name}` }, { role: "agent", text: "If the exact product is hard to find online, I will use the label photo as the fallback source." }]);
  };

  return (
    <main className="min-h-screen tab-safe-bottom bg-black px-4 py-5 text-white">
      <LoginGate />
      <div className="app-container">
        <header className="mb-5 flex items-center justify-between gap-4">
          <Link href="/" className="pixel-title text-2xl font-black text-white">BareIQ</Link>
          <div className="flex gap-2">
            <Link href="/quiz" className="pixel-button hidden bg-black px-4 py-2 text-sm font-black text-white sm:inline-flex">Find your match</Link>
            <Link href="/community" className="pixel-button bg-white px-4 py-2 text-sm font-black text-black">BIQ Community</Link>
          </div>
        </header>

        <section className="pixel-window grid min-h-[calc(100vh-170px)] grid-rows-[auto_1fr_auto] overflow-hidden">
          <div className="border-b-3 border-white bg-[var(--accent)] p-4 text-black">
            <p className="pixel-title text-2xl font-black">Bare Check AI</p>
            <p className="mt-1 text-sm font-black">Chat-based product reaction checker</p>
          </div>

          <div className="space-y-4 overflow-y-auto p-4 sm:p-6">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[86%] border-3 p-4 text-sm font-bold leading-6 sm:max-w-[72%] ${message.role === "user" ? "border-[var(--accent)] bg-[var(--accent)] text-black" : "border-white bg-black text-white"}`}>
                  {message.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="w-fit border-3 border-white bg-black p-4 text-sm font-black text-[var(--accent)]">
                Searching product pages... scanning ingredient clues... checking review signals...
              </div>
            )}

            {result && (
              <section className="pixel-window-light p-5">
                <p className="text-xs font-black uppercase text-black/50">End result</p>
                <h2 className="pixel-title mt-2 text-3xl font-black leading-none">{result.recommendation}</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-black/70">{result.nextStepRecommendation}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <ResultBlock title="Ingredient flags" items={result.ingredientFlags.length ? result.ingredientFlags : ["No obvious ingredient trigger found from the current text."]} />
                  <ResultBlock title="Review signals to compare" items={result.reviewSignals.length ? result.reviewSignals : ["Look for reviews mentioning burning, bumps, redness, rash, or acne."]} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={lookupLinks.google} target="_blank" rel="noreferrer" className="pixel-button bg-white px-4 py-2 text-xs font-black text-black">Search web</a>
                  <a href={lookupLinks.ingredients} target="_blank" rel="noreferrer" className="pixel-button bg-white px-4 py-2 text-xs font-black text-black">Ingredients</a>
                  <a href={lookupLinks.reviews} target="_blank" rel="noreferrer" className="pixel-button bg-white px-4 py-2 text-xs font-black text-black">Reviews</a>
                </div>
              </section>
            )}
          </div>

          <form onSubmit={submit} className="border-t-3 border-white bg-black p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickChips.map((chip) => (
                <button key={chip} type="button" onClick={() => addChip(chip)} className="border-2 border-white/40 px-3 py-1 text-xs font-black text-white/70 hover:border-[var(--accent)] hover:text-[var(--accent)]">
                  {chip}
                </button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Example: Minimalist salicylic acid serum gave me red itchy bumps after 3 days. Should I stop?"
                className="min-h-24 w-full border-3 border-white bg-black px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-[var(--accent)]"
              />
              <div className="grid gap-2">
                <label className="pixel-button cursor-pointer bg-black px-4 py-3 text-center text-xs font-black text-white">
                  Upload label
                  <input type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
                </label>
                <button className="pixel-button bg-white px-5 py-3 text-sm font-black text-black">Send</button>
              </div>
            </div>
            {photoName && <p className="mt-2 text-xs font-bold text-white/50">Photo ready: {photoName}</p>}
          </form>
        </section>
      </div>
      <BottomTabs />
    </main>
  );
}

function ResultBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-3 border-black bg-white p-4">
      <h3 className="font-black">{title}</h3>
      <div className="mt-2 space-y-2 text-sm font-bold text-black/65">
        {items.map((item) => <p key={item}>{item}</p>)}
      </div>
    </div>
  );
}

function absorbText(current: BareCheckInput, text: string): BareCheckInput {
  const lower = text.toLowerCase();
  const symptoms = ["Bumps", "Acne", "Redness", "Burning", "Itching", "Dryness", "Peeling", "Swelling", "Dark spots", "Pain", "Fast-spreading rash", "Trouble breathing"]
    .filter((symptom) => lower.includes(symptom.toLowerCase()));
  const mixedActives = ["Retinol", "Vitamin C", "AHA/BHA", "Benzoyl peroxide", "Salicylic acid", "Exfoliating scrub", "Prescription acne medicine"]
    .filter((active) => lower.includes(active.toLowerCase()) || (active === "AHA/BHA" && (lower.includes("aha") || lower.includes("bha"))));
  const severity = lower.includes("trouble breathing") || lower.includes("swelling") || lower.includes("fast-spreading") ? "Urgent" : lower.includes("burning") || lower.includes("pain") ? "Moderate" : current.severity;
  const productUrl = lower.includes("http") ? text.split(/\s+/).find((part) => part.startsWith("http")) : current.productUrl;

  return {
    ...current,
    productName: current.productName || guessProductName(text),
    productUrl,
    productKind: current.productKind || guessProductKind(lower),
    productVariant: current.productVariant || text.slice(0, 90),
    question: `${current.question} ${text}`.trim(),
    story: `${current.story} ${text}`.trim(),
    symptoms: Array.from(new Set([...current.symptoms, ...symptoms])),
    mixedActives: Array.from(new Set([...current.mixedActives, ...mixedActives])),
    severity,
  };
}

function guessProductName(text: string) {
  const cleaned = text.replace(/^https?:\/\/\S+/i, "").trim();
  return cleaned.split(/[.?,]/)[0]?.slice(0, 80) || "Skincare product";
}

function guessProductKind(text: string) {
  return ["serum", "cleanser", "moisturizer", "sunscreen", "toner", "cream", "gel"].find((kind) => text.includes(kind)) || "skincare product";
}
