"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomTabs } from "@/components/AppTabs";
import { LoginGate } from "@/components/Auth/LoginGate";
import { saveLocalQuiz } from "@/lib/localQuiz";

const steps = ["Skin Type", "Skin Tone", "Concerns", "Preferences"];
const skinTypes = [
  ["oily", "Oily", "Gets shiny quickly, especially in the T-zone"],
  ["dry", "Dry", "Feels tight or flaky"],
  ["combination", "Combination", "Oily T-zone, dry/normal elsewhere"],
  ["normal", "Normal", "Balanced most days"],
  ["sensitive", "Sensitive", "Reacts easily to products"],
];
const skinTones = [
  ["fair", "Fair", "#f4d7c1"],
  ["wheatish", "Wheatish", "#e8c095"],
  ["medium", "Medium", "#d49a5e"],
  ["dusky", "Dusky", "#9a6339"],
  ["deep", "Deep", "#623725"],
];
const concerns = ["Acne & Breakouts", "Pigmentation", "Tan Removal", "Dark Spots", "Dullness", "Fine Lines", "Open Pores", "Excess Oil", "Dryness"];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [skinType, setSkinType] = useState("oily");
  const [skinTone, setSkinTone] = useState("medium");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(["acne"]);
  const [sensitivityLevel, setSensitivityLevel] = useState("medium");
  const [budgetRange, setBudgetRange] = useState("medium");
  const [prefersNatural, setPrefersNatural] = useState(false);
  const [prefersFragranceFree, setPrefersFragranceFree] = useState(true);

  const progress = ((step + 1) / steps.length) * 100;
  const toggleConcern = (value: string) => {
    const normalized = value.toLowerCase().replace(/&/g, "").replace(/\s+/g, "_");
    setSelectedConcerns((current) => current.includes(normalized) ? current.filter((item) => item !== normalized) : [...current, normalized]);
  };

  const submit = () => {
    const quiz = saveLocalQuiz({
      skinType,
      skinTone,
      concerns: selectedConcerns,
      sensitivityLevel,
      budgetRange,
      prefersNatural,
      prefersFragranceFree,
    });
    router.push(`/results?localQuizId=${quiz.id}`);
  };

  return (
    <main className="min-h-screen tab-safe-bottom bg-black px-4 py-5 text-white">
      <LoginGate />
      <div className="app-container">
        <Header />
        <Progress step={step} progress={progress} />
        <section className="pixel-window mx-auto mt-8 max-w-3xl p-5 sm:p-7">
          {step === 0 && (
            <Step title="Skin Type" subtitle="What's your skin like?">
              <div className="grid gap-3">
                {skinTypes.map(([value, label, note]) => (
                  <button key={value} type="button" onClick={() => setSkinType(value)} className={`pixel-button flex items-center gap-4 bg-black p-4 text-left text-white ${skinType === value ? "border-[var(--accent)] shadow-[5px_6px_0_#00b7ff]" : "border-white/60 shadow-none"}`}>
                    <span className="pixel-title text-2xl">{label.slice(0, 2).toUpperCase()}</span>
                    <span><strong className="block text-lg">{label}</strong><span className="text-sm text-white/55">{note}</span></span>
                  </button>
                ))}
              </div>
            </Step>
          )}
          {step === 1 && (
            <Step title="Skin Tone" subtitle="Pick your shade">
              <div className="grid gap-3">
                {skinTones.map(([value, label, color]) => (
                  <button key={value} type="button" onClick={() => setSkinTone(value)} className={`pixel-button flex items-center gap-4 bg-black p-4 text-left text-white ${skinTone === value ? "border-[var(--accent)] shadow-[5px_6px_0_#00b7ff]" : "border-white/60 shadow-none"}`}>
                    <span className="h-14 w-14 border-3 border-white" style={{ background: color }} />
                    <span><strong className="block text-lg">{label}</strong><span className="text-sm text-white/55">Indian skin tone match</span></span>
                  </button>
                ))}
              </div>
            </Step>
          )}
          {step === 2 && (
            <Step title="Concerns" subtitle="Select all that apply">
              <div className="grid gap-3 sm:grid-cols-3">
                {concerns.map((concern) => {
                  const normalized = concern.toLowerCase().replace(/&/g, "").replace(/\s+/g, "_");
                  const active = selectedConcerns.includes(normalized);
                  return (
                    <button key={concern} type="button" onClick={() => toggleConcern(concern)} className={`pixel-button min-h-28 bg-black p-3 text-sm font-black text-white ${active ? "border-[var(--accent)] shadow-[5px_6px_0_#00b7ff]" : "border-white/60 shadow-none"}`}>
                      {concern}
                    </button>
                  );
                })}
              </div>
            </Step>
          )}
          {step === 3 && (
            <Step title="Preferences" subtitle="Your buying style">
              <Segment title="Sensitivity Level" values={["low", "medium", "high"]} value={sensitivityLevel} onChange={setSensitivityLevel} />
              <Segment title="Budget Range" values={["low", "medium", "high"]} labels={["Under 500", "500-1000", "1000+"]} value={budgetRange} onChange={setBudgetRange} />
              <div className="mt-5 grid gap-3">
                <Toggle label="Natural/Organic Products" active={prefersNatural} onClick={() => setPrefersNatural((value) => !value)} />
                <Toggle label="Fragrance-Free" active={prefersFragranceFree} onClick={() => setPrefersFragranceFree((value) => !value)} />
              </div>
            </Step>
          )}
        </section>
        <div className="mx-auto mt-7 flex max-w-3xl justify-between gap-3">
          <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} className={`pixel-button bg-black px-6 py-3 font-black text-white ${step === 0 ? "invisible" : ""}`}>Back</button>
          <button type="button" onClick={() => step === steps.length - 1 ? submit() : setStep((value) => value + 1)} className="pixel-button bg-white px-7 py-3 font-black text-black">
            {step === steps.length - 1 ? "Get Results" : "Next ->"}
          </button>
        </div>
      </div>
      <BottomTabs />
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between gap-4">
      <Link href="/" className="pixel-title text-2xl font-black text-white">BareIQ</Link>
      <Link href="/community" className="pixel-button bg-white px-4 py-2 text-sm font-black text-black">BIQ Community</Link>
    </header>
  );
}

function Progress({ step, progress }: { step: number; progress: number }) {
  return (
    <section className="mx-auto mt-8 max-w-3xl">
      <div className="grid grid-cols-4 gap-2 text-center">
        {steps.map((item, index) => (
          <div key={item} className={index <= step ? "text-[var(--accent)]" : "text-white/30"}>
            <span className="pixel-title mx-auto grid h-11 w-11 place-items-center border-3 border-current bg-black text-lg">{index < step ? "OK" : index + 1}</span>
            <p className="mt-2 text-xs font-black">{item}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 h-3 border-3 border-white bg-black">
        <div className="h-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <>
      <h1 className="pixel-title text-4xl font-black text-[var(--accent)] sm:text-5xl">{title}</h1>
      <p className="mt-3 text-lg font-bold text-white/55">{subtitle}</p>
      <div className="mt-7">{children}</div>
    </>
  );
}

function Segment({ title, values, labels, value, onChange }: { title: string; values: string[]; labels?: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="mt-5">
      <p className="mb-2 font-black">{title}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {values.map((item, index) => (
          <button key={item} type="button" onClick={() => onChange(item)} className={`pixel-button bg-black px-4 py-4 font-black capitalize text-white ${value === item ? "border-[var(--accent)] shadow-[5px_6px_0_#00b7ff]" : "border-white/60 shadow-none"}`}>
            {labels?.[index] || item}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`pixel-button flex items-center justify-between bg-black px-4 py-4 text-left font-black text-white ${active ? "border-[var(--accent)] shadow-[5px_6px_0_#00b7ff]" : "border-white/60 shadow-none"}`}>
      {label}
      <span className={`h-7 w-7 border-3 ${active ? "border-[var(--accent)] bg-[var(--accent)]" : "border-white/60 bg-black"}`} />
    </button>
  );
}
