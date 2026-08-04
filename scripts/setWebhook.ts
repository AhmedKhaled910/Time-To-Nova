// Run this ONCE after your Vercel deployment is live, to tell Telegram
// where to send messages.
//
// Usage:
//   1. Add WEBHOOK_URL to your .env, e.g.
//      WEBHOOK_URL=https://your-project.vercel.app/api/webhook
//   2. npm run set-webhook

import * as dotenv from 'dotenv';
dotenv.config();
import { Telegraf } from 'telegraf';

const token = process.env.BOT_TOKEN;
const url = process.env.WEBHOOK_URL;

if (!token || !url) {
  console.error('❌ Missing BOT_TOKEN or WEBHOOK_URL in your .env file.');
  process.exit(1);
}

const bot = new Telegraf(token);

bot.telegram
  .setWebhook(url)
  .then(() => {
    console.log('✅ Webhook set to:', url);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to set webhook:', err);
    process.exit(1);
  });
