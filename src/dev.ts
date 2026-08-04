// Local development entry point.
// Uses long polling (bot.launch()) so you can test on your own machine
// without deploying anything or setting up a public URL.
//
// NOTE: If you've already run `npm run set-webhook` to point Telegram at
// your Vercel deployment, Telegram will deliver messages to the webhook
// instead of here. Run `npm run delete-webhook` first if you want to test
// locally with polling again.

import { bot } from './bot';

bot.launch();
console.log('✅ Nursery bot is running locally (long polling)...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
