// Run this if you want to go back to testing locally with `npm run dev`
// (long polling). Telegram only delivers to ONE place at a time, so the
// webhook must be removed first, or your local bot won't receive anything.
//
// Usage: npm run delete-webhook

import * as dotenv from 'dotenv';
dotenv.config();
import { Telegraf } from 'telegraf';

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('❌ Missing BOT_TOKEN in your .env file.');
  process.exit(1);
}

const bot = new Telegraf(token);

bot.telegram
  .deleteWebhook()
  .then(() => {
    console.log('✅ Webhook removed. You can now use `npm run dev` for local polling.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to delete webhook:', err);
    process.exit(1);
  });
