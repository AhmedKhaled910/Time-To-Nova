// Vercel serverless function.
// Telegram sends every message here as a POST request. This function
// wakes up, processes that one update, replies, and shuts down again.
//
// After deploying, point Telegram at this URL with:
//   npm run set-webhook
// (see scripts/setWebhook.ts)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bot } from '../src/bot';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(200).send('Kids Area & Nursery bot webhook is live.');
    return;
  }

  try {
    await bot.handleUpdate(req.body, res);
  } catch (err) {
    console.error('Webhook error:', err);
    // Always respond 200 so Telegram doesn't endlessly retry a failed update.
    if (!res.headersSent) {
      res.status(200).send('ok');
    }
  }
}
