"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { LoginGate } from "@/components/Auth/LoginGate";
import { SiteNav } from "@/components/Navigation/SiteNav";
import { apiFetch } from "@/lib/api";
import { getBareIQUser } from "@/lib/session";
import { getRoutineContext, saveRoutineContext } from "@/lib/routine";

type Message = { role: "user" | "assistant"; text: string; image?: string };
type AgentMode = "chat" | "extract" | "analyze";

const MEMORY_KEY = "bareiq_agent_memory";

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [imageDraft, setImageDraft] = useState<string>();
  const [awaitingImageConfirmation, setAwaitingImageConfirmation] = useState(false);
  const [routine, setRoutine] = useState("");
  const [userName, setUserName] = useState("there");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getBareIQUser();
    const savedRoutine = getRoutineContext()?.raw || "";
    const savedMessages = window.localStorage.getItem(MEMORY_KEY);
    setUserName(user?.name || "there");
    setRoutine(savedRoutine);
    setMessages(savedMessages ? JSON.parse(savedMessages) : [{
      role: "assistant",
      text: savedRoutine
        ? `Hey ${user?.name || "there"}! I remember your routine. Tell me what you want to add, compare, or understand.`
        : `Hey ${user?.name || "there"}! I’m BareIQ. Before I recommend anything, tell me what you currently use in your routine — even a rough list is fine.`,
    }]);
  }, []);

  useEffect(() => {
    if (messages.length) window.localStorage.setItem(MEMORY_KEY, JSON.stringify(messages.slice(-30)));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = useMemo(() => [
    "Compare a new product with my routine",
    "I use Dot & Key moisturizer with ceramides and hyaluronic acid",
    "My skin is irritated — what should I pause?",
  ], []);

  const rememberRoutine = (text: string) => {
    if (!/(i use|my routine|routine:|am:|pm:|moisturizer|cleanser|serum|sunscreen|toner|retinol|niacinamide|ceramide|hyaluronic)/i.test(text)) return routine;
    const next = routine && !routine.toLowerCase().includes(text.toLowerCase()) ? `${routine}\n${text}` : routine || text;
    saveRoutineContext(next);
    setRoutine(next);
    return next;
  };

  const callAgent = async (nextMessages: Message[], nextRoutine: string, mode: AgentMode, image?: string, imageConfirmed = false) => {
    const latestQuiz = window.localStorage.getItem("bareiq_local_quizzes");
    let skinProfile: unknown = undefined;
    try { skinProfile = latestQuiz ? JSON.parse(latestQuiz)[0] : undefined; } catch { skinProfile = undefined; }
    try {
      const response = await apiFetch<{ text: string }>("/api/agent/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: nextMessages.slice(-24).map(({ role, text }) => ({ role, content: text })),
          routine: nextRoutine,
          skin_profile: skinProfile,
          image_data_url: image,
          image_confirmed: imageConfirmed,
          mode,
        }),
      });
      return response.text;
    } catch (error) {
      const message = error instanceof Error ? error.message : "The agent is unavailable.";
      return `I couldn’t complete that analysis right now. ${message} Please try again in a moment.`;
    }
  };

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    if (isSending || (!input.trim() && !imageDraft)) return;
    setIsSending(true);
    const text = input.trim() || "Please read the product label in this photo.";
    const nextRoutine = rememberRoutine(text);
    const userMessage: Message = { role: "user", text, image: imageDraft };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    const response = await callAgent(nextMessages, nextRoutine, imageDraft ? "extract" : "chat", imageDraft, false);
    setMessages((current) => [...current, { role: "assistant", text: response }]);
    if (imageDraft) setAwaitingImageConfirmation(true);
    setIsSending(false);
  };

  const confirmImage = async () => {
    if (!imageDraft || isSending) return;
    setIsSending(true);
    const userMessage: Message = { role: "user", text: "Yes, that reading is correct. Analyze it with my routine.", image: imageDraft };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    const response = await callAgent(nextMessages, routine, "analyze", imageDraft, true);
    setMessages((current) => [...current, { role: "assistant", text: response }]);
    setAwaitingImageConfirmation(false);
    setImageDraft(undefined);
    setIsSending(false);
  };

  return (
    <main className="pixel-page">
      <LoginGate /><SiteNav />
      <div className="pixel-shell agent-shell">
        <div className="agent-heading">
          <div>
            <p className="eyebrow">BAREIQ AI // GROQ CONNECTED</p>
            <h1 className="pixel-title">Your skin sidekick.</h1>
            <p className="lede">Tell me what you use, ask naturally, or upload a product/skin photo. I’ll use your saved routine and ask one question when I need more context.</p>
          </div>
          <span className="status-dot">● ROUTINE AWARE</span>
        </div>

        <section className="routine-strip">
          <span className="label">SAVED ROUTINE</span>
          <p>{routine || "No routine saved yet — start by telling me what you use."}</p>
        </section>

        <section className="chat-window" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
              {message.role === "assistant" && <span className="chat-avatar">BIQ</span>}
              <div><p>{message.text}</p>{message.image && <img src={message.image} alt="Uploaded product or skin context" className="chat-image" />}</div>
            </div>
          ))}
          <div ref={endRef} />
        </section>

        {awaitingImageConfirmation && imageDraft && (
          <div className="image-confirm">
            <span>Confirm the product/ingredient reading above before I analyze it.</span>
            <button className="pixel-button secondary-button" type="button" onClick={confirmImage} disabled={isSending}>Yes, analyze →</button>
          </div>
        )}

        <div className="suggestions">
          {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => setInput(suggestion)}>{suggestion}</button>)}
        </div>

        <form onSubmit={send} className="chat-composer">
          <label className="upload-button" title="Attach an image">
            ＋
            <input type="file" accept="image/*" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => { setImageDraft(String(reader.result)); setAwaitingImageConfirmation(false); };
              reader.readAsDataURL(file);
            }} />
          </label>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask BareIQ about your skin or routine..." />
          <button className="pixel-button" type="submit" disabled={isSending}>{isSending ? "Thinking…" : "Send →"}</button>
        </form>
        <p className="disclaimer">BareIQ gives safety-first information, not a diagnosis. Uploaded images remain in this browser’s prototype chat history.</p>
      </div>
    </main>
  );
}
