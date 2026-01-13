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

  const { botToken, chatId, message } = body;
  if (!botToken || !chatId || !message) {
    return { statusCode: 400, body: "Missing botToken/chatId/message" };
  }

  const resp = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    }
  );

  const text = await resp.text();

  return {
    statusCode: resp.status,
    body: text,
    headers: { "content-type": "application/json" },
  };
};