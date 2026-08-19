import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AgentMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are BareIQ, a careful skincare assistant for Indian skincare users.

You are conversational and warm, but concise and practical. Never diagnose a skin disease or identify a medical condition from an image. You may describe visible observations as uncertain observations, flag possible irritation, ask about symptoms and timing, and recommend medical care for urgent red flags.

Use the user's current routine and skin profile before making decisions. Check for:
1. duplicate ingredients or duplicate goals;
2. potentially irritating or unsafe active combinations;
3. missing routine basics or routine gaps;
4. suitability for the user's skin type, tone, concerns, sensitivity, preferences, and budget;
5. timing, frequency, recent changes, and reported reactions when available.

If key information is missing or two interpretations are possible, ask exactly one short clarifying question and pause the recommendation until the user answers. Do not ask a long questionnaire.

When a product image is provided and image_confirmed is false, read the visible product name, product type, and ingredient label as best you can, mark uncertain text with [?], and ask the user to confirm the reading. Do not analyze suitability yet.

When the user confirms an image reading, analyze the product alongside their routine and profile. Return compact sections when relevant: WORKING, OVERLAP, WATCH, GAP, MATCH, and NEXT STEP. Include a short verdict. Never invent an ingredient that is not visible or supplied by the user.

This is safety-first information, not a diagnosis.`;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse("The AI service is not configured yet. Add GROQ_API_KEY in Vercel Environment Variables.", 503);
  }

  let body: {
    messages?: AgentMessage[];
    routine?: string;
    skin_profile?: unknown;
    image_data_url?: string;
    image_confirmed?: boolean;
    mode?: "chat" | "extract" | "analyze";
  };

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const image = body.image_data_url;
  if (image && image.length > 20 * 1024 * 1024) {
    return errorResponse("That image is too large. Please upload an image under 20 MB.", 413);
  }

  const context = {
    current_routine: body.routine || "Not provided yet",
    skin_profile: body.skin_profile || "Not provided yet",
    image_confirmed: Boolean(body.image_confirmed),
    mode: body.mode || "chat",
  };

  const messages: Array<Record<string, unknown>> = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: `User context JSON:\n${JSON.stringify(context)}` },
    ...(body.messages || []).slice(-24).map((message) => ({
      role: message.role,
      content: String(message.content || "").slice(0, 12000),
    })),
  ];

  if (image) {
    const imageInstruction =
      body.mode === "extract" || !body.image_confirmed
        ? "Read the product packaging and ingredient label only. Ask for confirmation before analysis."
        : "The user confirmed the reading. Analyze the product image together with the routine and profile.";
    messages.push({
      role: "user",
      content: [
        { type: "text", text: imageInstruction },
        { type: "image_url", image_url: { url: image } },
      ],
    });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "qwen/qwen3.6-27b",
        messages,
        temperature: 0.2,
        max_tokens: 900,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      return errorResponse(`Groq request failed: ${detail.slice(0, 500)}`, 502);
    }

    const result = await response.json();
    const text = result?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      return errorResponse("Groq returned an unexpected response.", 502);
    }

    return NextResponse.json({
      text,
      model: process.env.GROQ_MODEL || "qwen/qwen3.6-27b",
      image_reviewed: Boolean(image),
    });
  } catch {
    return errorResponse("The AI service took too long to respond. Please try again.", 504);
  }
}
