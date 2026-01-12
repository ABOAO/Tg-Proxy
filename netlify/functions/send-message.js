export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 簡單 API KEY 驗證（強烈建議）
  const apiKey = request.headers.get("x-api-key");
  if (process.env.PROXY_API_KEY && apiKey !== process.env.PROXY_API_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { message, chatId, parseMode } = await request.json();

  const token = process.env.BOT_TOKEN;
  const defaultChatId = process.env.CHAT_ID;

  if (!token) {
    return new Response("Missing BOT_TOKEN", { status: 500 });
  }

  const payload = {
    chat_id: chatId || defaultChatId,
    text: message,
    parse_mode: parseMode || "HTML",
  };

  const resp = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await resp.text();
  return new Response(data, {
    status: resp.status,
    headers: { "content-type": "application/json" },
  });
};
