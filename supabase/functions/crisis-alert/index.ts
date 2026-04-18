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
    const { level, score, season, timestamp } = await req.json();
    const DISCORD_WEBHOOK = Deno.env.get("DISCORD_WEBHOOK_URL");

    if (!DISCORD_WEBHOOK) {
      return new Response("Webhook not configured", { status: 500, headers: corsHeaders });
    }

    const bangkokTime = new Date(timestamp).toLocaleString("en-TH", {
      timeZone: "Asia/Bangkok",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const seasonEmoji: Record<string, string> = { r: "🍂", g: "🌿", b: "🌸" };
    const emoji = seasonEmoji[season?.[0]] || "🌱";
    const isSevere = level === "severe";

    const embed = {
      title: isSevere ? "🚨 Blossom Crisis Alert" : "⚠️ Blossom Support Alert",
      color: isSevere ? 15158332 : 16776960,
      description: isSevere
        ? "A user may be in crisis. Check @LotusBlossomBot activity and consider reaching out."
        : "A user expressed distress. Monitor for follow-up.",
      fields: [
        { name: "⏰ Bangkok Time", value: bangkokTime, inline: true },
        { name: "🌸 Blossom Score", value: score ? `${score}/100` : "Unknown", inline: true },
        { name: `${emoji} Season`, value: season || "Unknown", inline: true },
      ],
      footer: { text: "🔒 No message content stored — privacy protected | Blossom v2.0" },
    };

    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Blossom Alert System", embeds: [embed] }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
