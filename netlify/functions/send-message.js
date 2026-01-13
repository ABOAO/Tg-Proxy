export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // （可選）如果你想完全公開，刪掉這段或不要設定 PROXY_API_KEY
  const apiKey = request.headers.get("x-api-key");
  if (process.env.PROXY_API_KEY && apiKey !== process.env.PROXY_API_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const {
    botToken,
    chatId,
    message,
    parseMode = "HTML",
    threadId,              // 你自己的欄位名稱
    message_thread_id,     // 也支援直接用 TG 原生欄位
    disablePreview,        // 可選：關閉預覽
    disableNotification    // 可選：靜音
  } = body;

  if (!botToken || !chatId || !message) {
    return new Response("Missing botToken/chatId/message", { status: 400 });
  }

  const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: parseMode,
  };

  // Thread 支援（Telegram 叫 message_thread_id）
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

  const resp = await fetch(tgUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: { "content-type": "application/json" },
  });
};