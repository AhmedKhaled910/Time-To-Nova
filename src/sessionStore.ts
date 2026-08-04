// Session storage for Telegraf.
//
// On Vercel, serverless functions do NOT keep memory between invocations,
// so the wizard scenes (Parent Entry, Tour, etc.) would lose their place
// after every single message unless state is stored somewhere external.
//
// This uses Upstash Redis (free tier, REST-based, works great in serverless)
// when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set.
//
// If those env vars are missing (e.g. local development), this returns
// `undefined`, and Telegraf falls back to its default in-memory store,
// which is fine for local testing since the process stays running.

import { Redis } from '@upstash/redis';

export function getSessionStore() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return undefined;
  }

  const redis = new Redis({ url, token });

  return {
    async get(key: string) {
      const data = await redis.get(key);
      return (data as any) ?? undefined;
    },
    async set(key: string, value: any) {
      await redis.set(key, value);
    },
    async delete(key: string) {
      await redis.del(key);
    },
  };
}
