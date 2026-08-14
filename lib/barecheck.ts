export interface BareProduct {
  id: number;
  name: string;
  brand: string;
  category?: string;
}

export interface AnonymousIdentity {
  id: string;
  name: string;
}

export interface BareCheckInput {
  productId?: number;
  productName: string;
  productUrl?: string;
  productKind?: string;
  productVariant?: string;
  category?: string;
  question: string;
  timeline: string;
  skinArea: string[];
  symptoms: string[];
  severity: string;
  changedFactors: string[];
  mixedActives: string[];
  photoDataUrl?: string;
  photoVisibility: "public" | "private";
  intent: "Ask AI" | "Post experience" | "Both";
  story?: string;
  skinType?: string;
}

export interface BareCheckAnalysis {
  isRelevant: boolean;
  productConfidence: number;
  productResearchSummary: string;
  ingredientFlags: string[];
  reviewSignals: string[];
  nextStepRecommendation: string;
  recommendation:
    | "Safe to continue carefully"
    | "Monitor closely"
    | "Pause and simplify routine"
    | "Stop product for now"
    | "Seek urgent care";
  explanation: string;
  saferSteps: string[];
  mixedActiveWarnings: string[];
  credibilityBadges: string[];
  verifiedStatus: boolean;
}

export interface ReactionPost extends BareCheckInput {
  id: string;
  anonymousUserId: string;
  anonymousName: string;
  aiRecommendation: BareCheckAnalysis["recommendation"];
  aiExplanation: string;
  saferSteps: string[];
  credibilityBadges: string[];
  verifiedStatus: boolean;
  outcome?: string;
  stoppedProduct?: string;
  improved?: string;
  wouldRecommend?: string;
  votes: Record<string, number>;
  userVotes: string[];
  createdAt: string;
  updatedAt: string;
}

export const TIMELINES = ["Same day", "2-3 days", "1 week", "2+ weeks"];
export const SKIN_AREAS = ["Forehead", "Cheeks", "Chin", "Nose", "Around mouth", "Neck", "Body", "Other"];
export const SYMPTOMS = [
  "Bumps",
  "Acne",
  "Redness",
  "Burning",
  "Itching",
  "Dryness",
  "Peeling",
  "Swelling",
  "Dark spots",
  "Pain",
  "Fast-spreading rash",
  "Trouble breathing",
];
export const SEVERITIES = ["Mild", "Moderate", "Severe", "Urgent"];
export const CHANGED_FACTORS = [
  "New cleanser",
  "New sunscreen",
  "Diet change",
  "Periods/hormones",
  "Weather",
  "Stress",
  "Medication",
  "New active ingredient",
];
export const MIXED_ACTIVES = [
  "Retinol",
  "Vitamin C",
  "AHA/BHA",
  "Benzoyl peroxide",
  "Salicylic acid",
  "Exfoliating scrub",
  "Prescription acne medicine",
];

const IDENTITY_KEY = "barecheck_identity";
const POSTS_KEY = "barecheck_posts";
const FOLLOWS_KEY = "barecheck_product_follows";
const COMMUNITY_TOPICS_KEY = "barecheck_community_topics";

const SKINCARE_KEYWORDS = [
  "skin",
  "skincare",
  "face",
  "acne",
  "pimple",
  "blemish",
  "serum",
  "moisturizer",
  "cleanser",
  "sunscreen",
  "spf",
  "retinol",
  "niacinamide",
  "salicylic",
  "hyaluronic",
  "ceramide",
  "tone",
  "routine",
  "sensitive",
  "oily",
  "dry",
  "combination",
  "hair",
  "curly",
  "straight",
  "wavy",
];

export function buildRetailSearchLinks(product: { brand: string; name: string }) {
  const query = encodeURIComponent(`${product.brand} ${product.name}`.trim()).replace(/%20/g, "+");

  return {
    nykaa: `https://www.nykaa.com/search/result/?q=${query}`,
    amazon: `https://www.amazon.in/s?k=${query}`,
  };
}

export function buildWebLookupLinks(query: string) {
  const encoded = encodeURIComponent(query.trim()).replace(/%20/g, "+");
  return {
    google: `https://www.google.com/search?q=${encoded}`,
    images: `https://www.google.com/search?tbm=isch&q=${encoded}`,
    reviews: `https://www.google.com/search?q=${encoded}+reviews`,
    ingredients: `https://www.google.com/search?q=${encoded}+ingredients`,
  };
}

export function getCommunityTopics() {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(COMMUNITY_TOPICS_KEY);
  return stored ? (JSON.parse(stored) as string[]) : [];
}

export function toggleCommunityTopic(topic: string) {
  if (typeof window === "undefined") return [];
  const topics = getCommunityTopics();
  const next = topics.includes(topic) ? topics.filter((item) => item !== topic) : [...topics, topic];
  window.localStorage.setItem(COMMUNITY_TOPICS_KEY, JSON.stringify(next));
  return next;
}

export function getIdentity(): AnonymousIdentity | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(IDENTITY_KEY);
  return stored ? (JSON.parse(stored) as AnonymousIdentity) : null;
}

export function createIdentity(alias?: string): AnonymousIdentity {
  const id = crypto.randomUUID();
  const name = alias?.trim() || `Anonymous Bare #${Math.floor(1000 + Math.random() * 9000)}`;
  const identity = { id, name };
  window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  return identity;
}

export function getPosts(): ReactionPost[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(POSTS_KEY);
  return stored ? (JSON.parse(stored) as ReactionPost[]) : seedPosts();
}

export function savePosts(posts: ReactionPost[]) {
  window.localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function addPost(input: BareCheckInput, identity: AnonymousIdentity, analysis: BareCheckAnalysis) {
  const now = new Date().toISOString();
  const post: ReactionPost = {
    ...input,
    id: crypto.randomUUID(),
    anonymousUserId: identity.id,
    anonymousName: identity.name,
    aiRecommendation: analysis.recommendation,
    aiExplanation: analysis.explanation,
    saferSteps: analysis.saferSteps,
    credibilityBadges: analysis.credibilityBadges,
    verifiedStatus: analysis.verifiedStatus,
    votes: {
      "Same happened to me": 0,
      "This helped me": 0,
      Helpful: 0,
      Report: 0,
    },
    userVotes: [],
    createdAt: now,
    updatedAt: now,
  };
  const posts = [post, ...getPosts()];
  savePosts(posts);
  return post;
}

export function updatePost(updatedPost: ReactionPost) {
  const posts = getPosts().map((post) => (post.id === updatedPost.id ? updatedPost : post));
  savePosts(posts);
}

export function getFollows(): number[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(FOLLOWS_KEY);
  return stored ? (JSON.parse(stored) as number[]) : [];
}

export function toggleFollow(productId?: number) {
  if (!productId) return [];
  const follows = getFollows();
  const next = follows.includes(productId)
    ? follows.filter((id) => id !== productId)
    : [...follows, productId];
  window.localStorage.setItem(FOLLOWS_KEY, JSON.stringify(next));
  return next;
}

export function analyzeBareCheck(input: BareCheckInput): BareCheckAnalysis {
  const symptoms = input.symptoms.map((symptom) => symptom.toLowerCase());
  const severity = input.severity.toLowerCase();
  const actives = input.mixedActives.map((active) => active.toLowerCase());
  const query = `${input.productName} ${input.productKind || ""} ${input.productVariant || ""} ${input.question || ""} ${input.story || ""} ${input.skinType || ""}`.toLowerCase();
  const has = (value: string) => symptoms.includes(value.toLowerCase());
  const uses = (value: string) => actives.includes(value.toLowerCase());
  const early = input.timeline === "Same day" || input.timeline === "2-3 days";
  const warnings = buildMixedActiveWarnings(input.mixedActives);
  const isRelevant =
    SKINCARE_KEYWORDS.some((keyword) => query.includes(keyword)) ||
    Boolean(input.productName.trim()) ||
    Boolean(input.productUrl?.trim()) ||
    Boolean(input.symptoms.length) ||
    Boolean(input.mixedActives.length);

  let recommendation: BareCheckAnalysis["recommendation"] = "Safe to continue carefully";
  let explanation = "Your notes do not show an obvious urgent pattern. Keep changes slow and watch how your skin responds.";

  if (!isRelevant) {
    return {
      isRelevant: false,
      recommendation: "Pause and simplify routine",
      explanation:
        "This looks unrelated to skincare. Please share a product, skin concern, or routine question so the checker can give a useful answer.",
      saferSteps: [
        "Try asking about a skin product, ingredient, routine, or a specific concern like acne, dryness, or sensitivity.",
        "Include the product name, product link, or a short description of what happened.",
        "If Bare Check cannot find the product online, upload a clear product photo and I will read the label next.",
      ],
      mixedActiveWarnings: [],
      productConfidence: 10,
      productResearchSummary: "No skincare product could be identified from this input.",
      ingredientFlags: ["No product or ingredient context found."],
      reviewSignals: ["No user-review pattern available."],
      nextStepRecommendation: "Share a product name, product URL, or product photo.",
      credibilityBadges: ["Irrelevant input detected"],
      verifiedStatus: false,
    };
  }

  if (has("Swelling") || has("Trouble breathing") || has("Fast-spreading rash") || severity === "urgent") {
    recommendation = "Seek urgent care";
    explanation =
      "Swelling, trouble breathing, or a fast-spreading rash can be signs of a serious reaction. It is safer to get urgent medical care now.";
  } else if (has("Burning") || has("Pain") || severity === "severe") {
    recommendation = "Stop product for now";
    explanation =
      "Burning, pain, or severe symptoms can mean the product may be irritating your skin. Stopping for now is the safer choice.";
  } else if (early && severity === "moderate" && (has("Acne") || has("Bumps") || has("Redness"))) {
    recommendation = "Pause and simplify routine";
    explanation =
      "Moderate bumps, acne, or redness soon after starting can point to irritation or a mismatch. A simpler routine can help you see what is triggering it.";
  } else if ((has("Dryness") || has("Peeling")) && input.mixedActives.length > 0) {
    recommendation = "Monitor closely";
    explanation =
      "Mild dryness or peeling can happen with active ingredients, but it can worsen if your barrier gets irritated. Reduce frequency and support your skin barrier.";
  } else if (warnings.length > 0 || input.changedFactors.length > 1) {
    recommendation = "Monitor closely";
    explanation =
      "Several recent changes or active ingredients make it harder to tell what caused the reaction. Go slowly and avoid stacking more actives.";
  }

  if (uses("retinol") && uses("prescription acne medicine")) {
    warnings.push("Retinol with prescription acne medicine can be too irritating unless a clinician told you to combine them.");
  }

  const credibilityBadges = [
    "Self-reported",
    input.photoDataUrl ? "Photo attached" : "",
    input.timeline ? "Timeline provided" : "",
    "AI safety reviewed",
    input.symptoms.length > 1 ? "Similar reports found" : "",
  ].filter(Boolean);
  const ingredientFlags = buildIngredientFlags(input, warnings);
  const reviewSignals = buildReviewSignals(input, recommendation);
  const productConfidence = calculateProductConfidence(input, ingredientFlags, reviewSignals);

  return {
    isRelevant: true,
    productConfidence,
    productResearchSummary: input.productUrl
      ? "Product URL included. Bare Check can use it as the strongest product-identification source."
      : input.productName
        ? "Product name identified. Bare Check should search the web for official ingredient lists, retailer pages, and user reviews."
        : "Product name is incomplete. Uploading a label photo will improve the check.",
    ingredientFlags,
    reviewSignals,
    nextStepRecommendation: buildNextStepRecommendation(recommendation),
    recommendation,
    explanation,
    saferSteps: [
      "Use a gentle cleanser, moisturizer, and sunscreen while your skin calms down.",
      "Do not scrub, pick, or add new active ingredients right now.",
      "Patch test before restarting, especially with retinol, exfoliating acids, or benzoyl peroxide.",
      "If you have facial swelling, trouble breathing, severe pain, or a fast-spreading rash, seek urgent medical care.",
    ],
    mixedActiveWarnings: warnings,
    credibilityBadges,
    verifiedStatus:
      Boolean(input.productName && input.timeline && input.symptoms.length && input.severity) &&
      (Boolean(input.photoDataUrl) || credibilityBadges.includes("30-day follow-up completed")),
  };
}

function buildIngredientFlags(input: BareCheckInput, warnings: string[]) {
  const flags = [...warnings];
  const productText = `${input.productName} ${input.productKind || ""} ${input.productVariant || ""}`.toLowerCase();

  if (productText.includes("retinol")) flags.push("Retinol can irritate sensitive or recently exfoliated skin.");
  if (productText.includes("salicylic")) flags.push("Salicylic acid can help clogged pores but may dry the barrier.");
  if (productText.includes("vitamin c")) flags.push("Vitamin C can sting when the skin barrier is compromised.");
  if (input.mixedActives.length > 0) flags.push("Routine includes active ingredients, so irritation risk is higher.");
  if (input.photoDataUrl) flags.push("Product photo uploaded for label review fallback.");

  return Array.from(new Set(flags)).slice(0, 5);
}

function buildReviewSignals(input: BareCheckInput, recommendation: BareCheckAnalysis["recommendation"]) {
  const signals = [];

  if (input.productName) signals.push("Search official product pages and marketplace listings for recurring review complaints.");
  if (input.productUrl) signals.push("Use the provided product URL as the first review and ingredient source.");
  if (recommendation === "Stop product for now" || recommendation === "Seek urgent care") {
    signals.push("User symptoms are stronger than review averages; prioritize the user's reaction pattern.");
  }
  if (input.symptoms.includes("Acne") || input.symptoms.includes("Bumps")) {
    signals.push("Compare reviews mentioning breakouts, bumps, clogged pores, or purging.");
  }

  return signals.length ? signals : ["No strong review signal yet; search reviews or upload the product label."];
}

function calculateProductConfidence(input: BareCheckInput, ingredientFlags: string[], reviewSignals: string[]) {
  let confidence = 35;
  if (input.productName) confidence += 20;
  if (input.productKind) confidence += 10;
  if (input.productVariant) confidence += 10;
  if (input.productUrl) confidence += 15;
  if (input.photoDataUrl) confidence += 10;
  if (ingredientFlags.length > 0) confidence += 5;
  if (reviewSignals.length > 1) confidence += 5;
  return Math.min(confidence, 98);
}

function buildNextStepRecommendation(recommendation: BareCheckAnalysis["recommendation"]) {
  if (recommendation === "Seek urgent care") return "Stop checking online and seek urgent medical care now.";
  if (recommendation === "Stop product for now") return "Stop the product, simplify your routine, and only reintroduce after symptoms calm down.";
  if (recommendation === "Pause and simplify routine") return "Pause the product for a few days and keep cleanser, moisturizer, and sunscreen only.";
  if (recommendation === "Monitor closely") return "Reduce frequency, avoid stacking actives, and watch symptoms for 48-72 hours.";
  return "Continue carefully, patch test changes, and keep the routine stable.";
}

export function buildPurchaseLinks(product: { brand: string; name: string; purchase_links?: Record<string, string> }) {
  const links = buildRetailSearchLinks(product);
  return {
    amazon: product.purchase_links?.amazon || links.amazon,
    nykaa: product.purchase_links?.nykaa || links.nykaa,
  };
}

export function summarizePosts(posts: ReactionPost[]) {
  const countBy = (items: string[]) =>
    items.reduce<Record<string, number>>((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

  const symptomCounts = countBy(posts.flatMap((post) => post.symptoms));
  const timelineCounts = countBy(posts.map((post) => post.timeline).filter(Boolean));
  const activeCounts = countBy(posts.flatMap((post) => post.mixedActives));
  const verifiedCount = posts.filter((post) => post.verifiedStatus).length;

  return {
    symptomCounts,
    timelineCounts,
    activeCounts,
    verifiedCount,
    topTimeline: topEntry(timelineCounts),
    topSymptoms: Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
    topActives: Object.entries(activeCounts).sort((a, b) => b[1] - a[1]).slice(0, 4),
    riskLabel:
      verifiedCount >= 8
        ? "High verified irritation reports"
        : verifiedCount >= 4
          ? "Moderate verified irritation reports"
          : "Low verified reaction reports",
  };
}

function buildMixedActiveWarnings(mixedActives: string[]) {
  const activeSet = new Set(mixedActives.map((active) => active.toLowerCase()));
  const hasActive = (active: string) => activeSet.has(active.toLowerCase());
  const warnings: string[] = [];

  if (hasActive("Retinol") && hasActive("AHA/BHA")) {
    warnings.push("Retinol with AHA/BHA may raise irritation risk.");
  }
  if (hasActive("Retinol") && hasActive("Benzoyl peroxide")) {
    warnings.push("Retinol with benzoyl peroxide can be drying or irritating for many routines.");
  }
  if (hasActive("AHA/BHA") && hasActive("Exfoliating scrub")) {
    warnings.push("AHA/BHA with an exfoliating scrub can over-exfoliate your skin.");
  }
  if (hasActive("Vitamin C") && hasActive("AHA/BHA")) {
    warnings.push("Vitamin C with strong acids may sting or irritate sensitive skin.");
  }
  if (hasActive("Salicylic acid") && hasActive("AHA/BHA")) {
    warnings.push("Multiple exfoliating acids can increase dryness, peeling, and redness.");
  }

  return warnings;
}

function topEntry(items: Record<string, number>) {
  return Object.entries(items).sort((a, b) => b[1] - a[1])[0];
}

function seedPosts(): ReactionPost[] {
  const now = new Date().toISOString();
  return [
    {
      id: "seed-1",
      anonymousUserId: "seed",
      anonymousName: "Anonymous Bare #2048",
      productId: 0,
      productName: "Minimalist 2% Salicylic Acid Serum",
      productKind: "Serum",
      productVariant: "2% Salicylic Acid acne-care serum",
      question: "Is this purging or irritation?",
      story: "I used it every night with a scrub and got tiny bumps around my chin after 3 days.",
      timeline: "2-3 days",
      skinArea: ["Chin", "Around mouth"],
      symptoms: ["Bumps", "Dryness", "Peeling"],
      severity: "Moderate",
      changedFactors: ["New active ingredient"],
      mixedActives: ["Salicylic acid", "Exfoliating scrub"],
      photoVisibility: "private",
      intent: "Post experience",
      skinType: "Oily",
      aiRecommendation: "Pause and simplify routine",
      aiExplanation: "Moderate bumps and dryness soon after adding exfoliation may be irritation.",
      saferSteps: ["Use a gentle cleanser, moisturizer, and sunscreen.", "Avoid scrubs and new actives for now."],
      credibilityBadges: ["Self-reported", "Timeline provided", "AI safety reviewed"],
      verifiedStatus: false,
      votes: { "Same happened to me": 4, "This helped me": 2, Helpful: 7, Report: 0 },
      userVotes: [],
      createdAt: now,
      updatedAt: now,
    },
  ];
}
