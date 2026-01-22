export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = event.headers["x-api-key"];
  if (process.env.PROXY_API_KEY && apiKey !== process.env.PROXY_API_KEY) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  // 只保留 botToken 作為 proxy 層需求，其餘都視為 Telegram 原生 sendMessage payload
  const { botToken, ...tgPayload } = body;

  if (!botToken) {
    return { statusCode: 400, body: "Missing botToken" };
  }

  // 建議至少檢查 sendMessage 必要欄位（避免打到 TG 才報錯）
  if (tgPayload.chat_id === undefined || tgPayload.text === undefined) {
    return { statusCode: 400, body: "Missing chat_id/text" };
  }

  const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(tgPayload),
  });

  const text = await resp.text();

  return {
    statusCode: resp.status,
    body: text,
    headers: { "content-type": "application/json" },
  };
};
