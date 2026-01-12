# TG Proxy (Netlify)

## APIs

### Send Message
POST /api/send-message

Headers:
- X-API-KEY

Body:
{
  "message": "Hello",
  "chatId": "-100xxx"
}

### Telegram Webhook
POST /api/tg-webhook
