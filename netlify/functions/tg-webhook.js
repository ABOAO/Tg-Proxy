export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // 驗證 Telegram webhook secret（強烈建議）
  // Telegram 會帶這個 header：X-Telegram-Bot-Api-Secret-Token
  const secret =
    event.headers["x-telegram-bot-api-secret-token"] ||
    event.headers["X-Telegram-Bot-Api-Secret-Token"];

  if (process.env.TG_WEBHOOK_SECRET && secret !== process.env.TG_WEBHOOK_SECRET) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nUrl) {
    return { statusCode: 500, body: "Missing N8N_WEBHOOK_URL" };
  }

  // event.body 是字串（JSON），原封不動轉發給 n8n
  const resp = await fetch(n8nUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: event.body || "{}",
  });

  // Telegram webhook 只要你回 200 就行
  // 這裡不把 n8n 回應透傳回去（避免超時/複雜）
  if (resp.ok) return { statusCode: 200, body: "OK" };

  return { statusCode: 502, body: `Forward failed: ${resp.status}` };
};