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

  const {
    botToken,
    chatId,
    message,
    parseMode = "HTML",          // ✅ n8n 傳 parseMode，預設 HTML
    threadId,                    // ✅ 自訂欄位
    message_thread_id,           // ✅ 支援 TG 原生欄位
    disablePreview,
    disableNotification
  } = body;

  if (!botToken || !chatId || !message) {
    return { statusCode: 400, body: "Missing botToken/chatId/message" };
  }

  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: parseMode,       // ✅ 回覆訊息使用格式
  };

  const tid = message_thread_id ?? threadId;
  if (tid !== undefined && tid !== null && String(tid).length > 0) {
    payload.message_thread_id = Number(tid);
  }

  if (disablePreview !== undefined) {
    payload.disable_web_page_preview = !!disablePreview;
  }
  if (disableNotification !== undefined) {
    payload.disable_notification = !!disableNotification;
  }

  const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await resp.text();

  return {
    statusCode: resp.status,
    body: text,
    headers: { "content-type": "application/json" },
  };
};