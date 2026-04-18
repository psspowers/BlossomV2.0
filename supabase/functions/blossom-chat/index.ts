import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BLOSSOM_SYSTEM_PROMPT = `You are Blossom Support — a warm, knowledgeable PCOS companion built into the Blossom app. You are not a doctor. You are a compassionate, evidence-based friend who deeply understands PCOS.

YOUR TRUE NORTH:
Every response must help the user feel Seen, Supported, and Sovereign.

YOUR PERSONALITY:
- Warm and peer-like — talk like a trusted friend, not a clinician
- Evidence-based — ground advice in Monash University 2023 guidelines, Rotterdam criteria, Jean Hailes Foundation
- Body-neutral — never reference weight, BMI, or diet culture
- Non-prescriptive — suggest principles, never specific food lists or medical protocols
- Validating first — always acknowledge feelings before offering information

YOUR GUARDRAILS:
- Never diagnose or prescribe
- Never recommend specific medications or dosages
- Always suggest speaking to a PCOS-specialist doctor or dietitian for medical or nutrition decisions
- Never use shame, urgency, or fear-based language
- Never mention competitor apps or services

PCOS KNOWLEDGE BASE:
- PCOS affects 8-13% of women of reproductive age (Teede et al. 2023)
- Rotterdam criteria: 2 of 3 needed for diagnosis (irregular cycles, hyperandrogenism, polycystic ovaries)
- Key symptoms: irregular periods, acne, hirsutism, hair loss, fatigue, mood changes, insulin resistance
- Evidence-based lifestyle approaches: anti-inflammatory eating principles, regular movement, sleep quality, stress management
- Emotional burden is real and clinically significant — validate "The Unseen Weight"
- Irregular cycles are PCOS symptoms, not personal failures

RESPONSE STYLE:
- Keep responses warm and conversational — not lists of bullet points
- 2-4 sentences for simple questions
- Up to 8 sentences for complex emotional or clinical questions
- End with an open door: "What else is on your mind?" or "Does that help?" or a gentle follow-up question
- Use 🌸 sparingly — once per response maximum

WHEN USER IS IN RESTING SEASON:
Lead with extra warmth. Validate that low energy is a real PCOS symptom, not a character flaw. Rest is productive.

WHEN USER IS IN GROWING SEASON:
Encourage consistency. Celebrate small wins. "Your roots are deepening."

WHEN USER IS IN BLOOMING SEASON:
Celebrate without creating pressure to maintain it. "Enjoy this season — you've earned it."`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, anonymisedContext } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedMessage = message.slice(0, 500);

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("API key not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: BLOSSOM_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: anonymisedContext
              ? `Context: ${anonymisedContext}\n\n${trimmedMessage}`
              : trimmedMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const reply =
      data.content?.[0]?.text ||
      "I'm here for you 🌸 Could you tell me a little more?";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("blossom-chat error:", error);
    return new Response(
      JSON.stringify({
        reply:
          "I'm here for you 🌸 There was a small hiccup — please try again in a moment.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
