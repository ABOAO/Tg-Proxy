export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 驗證 Telegram webhook secret
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (
    process.env.TG_WEBHOOK_SECRET &&
    secret !== process.env.TG_WEBHOOK_SECRET
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const n8nWebhook = process.env.N8N_WEBHOOK_URL;
  if (!n8nWebhook) {
    return new Response("Missing N8N_WEBHOOK_URL", { status: 500 });
  }

  const body = await request.text();

  const resp = await fetch(n8nWebhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

  return new Response("OK", { status: 200 });
};
