"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BottomTabs } from "@/components/AppTabs";
import { LoginGate } from "@/components/Auth/LoginGate";

const communities = ["All", "Oily Skin", "Dry Skin", "Sensitive Skin", "Curly Hair", "Wavy Hair", "Straight Hair"];
const seedPosts = [
  {
    community: "Oily Skin",
    user: "u/blue_barrier",
    title: "Minimalist salicylic acid gave me tiny bumps after 3 days",
    body: "Used it every night with a scrub. Bare Check said to pause and simplify. Anyone else had this?",
  },
  {
    community: "Sensitive Skin",
    user: "u/patchtestplease",
    title: "Fragrance-free moisturizer that does not sting?",
    body: "My cheeks burn with most creams. Looking for simple Indian market options.",
  },
  {
    community: "Curly Hair",
    user: "u/curl_cache",
    title: "Leave-in conditioner that does not break me out",
    body: "Hair products keep touching my cheeks and causing bumps. Need lighter recs.",
  },
];

export default function CommunityPage() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [handle, setHandle] = useState("ranga");

  const posts = useMemo(() => {
    return seedPosts.filter((post) => {
      const matchesFilter = filter === "All" || post.community === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || `${post.community} ${post.title} ${post.body}`.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <main className="min-h-screen tab-safe-bottom bg-black px-4 py-5 text-white">
      <LoginGate />
      <div className="app-container">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="pixel-title text-2xl font-black text-white">BareIQ</Link>
          <div className="flex gap-2">
            <Link href="/barecheck" className="pixel-button bg-black px-4 py-2 text-sm font-black text-white">Bare Check</Link>
            <Link href="/results" className="pixel-button bg-white px-4 py-2 text-sm font-black text-black">Results</Link>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[var(--accent)]">BIQ Community</p>
            <h1 className="pixel-title mt-3 text-5xl font-black leading-none sm:text-7xl">BareTalk</h1>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-6 text-white/55">
              Reddit-style skincare discussions for reactions, routines, and product stories.
            </p>
          </div>
          <aside className="pixel-window p-4">
            <p className="text-xs font-black uppercase text-white/45">Local anonymous profile</p>
            <input value={handle} onChange={(event) => setHandle(event.target.value)} className="mt-3 w-full border-3 border-white bg-black px-4 py-3 font-black text-white outline-none focus:border-[var(--accent)]" />
          </aside>
        </section>

        <section className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product, symptom, story, or recommendation"
            className="border-3 border-white bg-black px-4 py-4 font-bold text-white outline-none placeholder:text-white/35 focus:border-[var(--accent)]"
          />
          <button className="pixel-button bg-white px-6 py-4 font-black text-black">Start a thread</button>
        </section>

        <section className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {communities.map((community) => (
            <button key={community} type="button" onClick={() => setFilter(community)} className={`shrink-0 border-3 px-4 py-2 text-sm font-black ${filter === community ? "border-[var(--accent)] bg-[var(--accent)] text-black" : "border-white bg-black text-white"}`}>
              {community}
            </button>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr]">
          <aside className="pixel-window h-fit p-4">
            <p className="pixel-title text-xl font-black text-[var(--accent)]">Communities</p>
            <div className="mt-4 grid gap-2">
              {communities.slice(1).map((community) => (
                <button key={community} type="button" onClick={() => setFilter(community)} className="border-2 border-white/35 px-3 py-2 text-left text-xs font-black text-white/75 hover:border-[var(--accent)]">
                  r/{community.toLowerCase().replace(/\s+/g, "_")}
                </button>
              ))}
            </div>
          </aside>

          <div className="grid gap-4">
            <section className="pixel-window p-4">
              <h2 className="pixel-title text-2xl font-black">Reaction summary</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Metric label="Reports" value={posts.length} />
                <Metric label="Top board" value={filter === "All" ? "Oily" : filter.split(" ")[0]} />
                <Metric label="Top symptom" value="Redness" />
              </div>
            </section>

            {posts.map((post) => (
              <article key={post.title} className="pixel-window p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-white/40">{post.user} in r/{post.community.toLowerCase().replace(/\s+/g, "_")}</p>
                    <h2 className="mt-2 text-2xl font-black leading-tight">{post.title}</h2>
                  </div>
                  <span className="border-2 border-[var(--accent)] px-3 py-1 text-xs font-black text-[var(--accent)]">AI safety reviewed</span>
                </div>
                <p className="mt-4 text-sm font-bold leading-6 text-white/65">{post.body}</p>
                <div className="mt-4 border-3 border-white/40 bg-black p-3 text-sm font-bold text-white/70">
                  BareIQ note: This might be irritation if symptoms started soon after a new active. Pause, simplify, and patch test before restarting.
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="border-2 border-white/45 px-3 py-2 text-xs font-black">Like</button>
                  <button className="border-2 border-white/45 px-3 py-2 text-xs font-black">Dislike</button>
                  <button className="border-2 border-white/45 px-3 py-2 text-xs font-black">Comments</button>
                  <button className="border-2 border-white/45 px-3 py-2 text-xs font-black">Add 30-day follow-up</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <BottomTabs />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-3 border-white bg-black p-3">
      <p className="text-xs font-black text-white/35">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
