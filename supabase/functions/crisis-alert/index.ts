import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const { message, timestamp } = await req.json();

    const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");
    if (!DISCORD_WEBHOOK_URL) {
      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = {
      embeds: [
        {
          title: "Blossom — Wellness Check Triggered",
          description: "A user may need extra support right now. No identifying information is included.",
          color: 0xf9a8d4,
          fields: [
            {
              name: "Time",
              value: timestamp || new Date().toISOString(),
              inline: true,
            },
            {
              name: "Signal",
              value: "Crisis keyword detected in chat",
              inline: true,
            },
          ],
          footer: {
            text: "Blossom Companion — Wellness Alert (No personal data transmitted)",
          },
        },
      ],
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("crisis-alert error:", error);
    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
