import json
import os
import urllib.error
import urllib.request
from typing import Any, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/agent", tags=["agent"])


class AgentMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=12000)


class AgentRequest(BaseModel):
    messages: list[AgentMessage] = Field(default_factory=list, max_length=40)
    routine: str = Field(default="", max_length=12000)
    skin_profile: Optional[dict[str, Any]] = None
    image_data_url: Optional[str] = None
    image_confirmed: bool = False
    mode: Literal["chat", "extract", "analyze"] = "chat"


SYSTEM_PROMPT = """You are BareIQ, a careful skincare assistant for Indian skincare users.

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
"""


@router.post("/chat")
def chat(request: AgentRequest):
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is not configured on the backend yet.")

    if request.image_data_url and len(request.image_data_url) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="That image is larger than Groq's 20 MB request limit.")

    model = os.getenv("GROQ_MODEL", "qwen/qwen3.6-27b")
    context = {
        "current_routine": request.routine or "Not provided yet",
        "skin_profile": request.skin_profile or "Not provided yet",
        "image_confirmed": request.image_confirmed,
        "mode": request.mode,
    }
    messages: list[dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.append({"role": "system", "content": f"User context JSON:\n{json.dumps(context, ensure_ascii=False)}"})
    messages.extend({"role": item.role, "content": item.content} for item in request.messages[-24:])

    if request.image_data_url:
        image_instruction = (
            "Read the product packaging and ingredient label only. Ask for confirmation before analysis."
            if request.mode == "extract" or not request.image_confirmed
            else "The user confirmed the reading. Analyze the product image together with the routine and profile."
        )
        messages.append(
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": image_instruction},
                    {"type": "image_url", "image_url": {"url": request.image_data_url}},
                ],
            }
        )

    payload = json.dumps(
        {
            "model": model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 900,
        }
    ).encode("utf-8")
    http_request = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(http_request, timeout=45) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise HTTPException(status_code=502, detail=f"Groq request failed: {detail[:500]}") from error
    except (urllib.error.URLError, TimeoutError) as error:
        raise HTTPException(status_code=504, detail="Groq took too long to respond. Please try again.") from error

    try:
        text = result["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as error:
        raise HTTPException(status_code=502, detail="Groq returned an unexpected response.") from error

    return {"text": text, "model": model, "image_reviewed": bool(request.image_data_url)}
