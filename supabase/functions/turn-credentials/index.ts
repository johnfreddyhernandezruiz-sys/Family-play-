const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const keyId = Deno.env.get("CLOUDFLARE_TURN_KEY_ID");
    const apiToken = Deno.env.get("CLOUDFLARE_TURN_API_TOKEN");
    if (!keyId || !apiToken) {
      return new Response(JSON.stringify({ error: "TURN server configuration missing" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      "https://rtc.live.cloudflare.com/v1/turn/keys/" +
      encodeURIComponent(keyId) +
      "/credentials/generate-ice-servers",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + apiToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ttl: 3600 }),
      }
    );

    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error?.message || error) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});