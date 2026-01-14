import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class VideoChatHealthService {
  async checkRedis(): Promise<{ok: boolean; detail?: string}> {
    if (process.env.VIDEOCHAT_USE_REDIS !== 'true' || !process.env.REDIS_URL) {
      return { ok: true, detail: 'redis not configured (skipped)' };
    }

    const client = createClient({ url: process.env.REDIS_URL });
    let connected = false;
    const timeoutMs = 2000;

    try {
      const connPromise = client.connect();
      // enforce timeout
      await Promise.race([
        connPromise,
        new Promise((_, rej) => setTimeout(() => rej(new Error('redis connect timeout')), timeoutMs)),
      ]);
      connected = true;
      // some redis clients support ping
      if (typeof (client as any).ping === 'function') {
        await (client as any).ping();
      }
      await client.disconnect();
      return { ok: true };
    } catch (err: any) {
      try {
        if (connected) await client.disconnect();
      } catch (_) {
        // ignore
      }
      return { ok: false, detail: err?.message ?? String(err) };
    }
  }

  async checkTurn(): Promise<{ok: boolean; detail?: string}> {
    // If ICE servers includes a turn URL, require VIDEOCHAT_TURN_SECRET to be set
    const env = process.env.VIDEOCHAT_ICE_SERVERS;
    let hasTurn = false;
    if (env) {
      try {
        const parsed = JSON.parse(env);
        if (Array.isArray(parsed)) {
          hasTurn = parsed.some((s) => {
            const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
            return urls.some((u: string) => typeof u === 'string' && u.startsWith('turn:'));
          });
        }
      } catch (err) {
        // ignore parse errors - fallback to checking TURN secret
      }
    }

    const secret = process.env.VIDEOCHAT_TURN_SECRET;
    if (!hasTurn && !secret) {
      return { ok: true, detail: 'no turn configured' };
    }

    if (!secret) {
      return { ok: false, detail: 'VIDEOCHAT_TURN_SECRET is missing' };
    }

    // We don't actively probe TURN servers (protocol level), but presence of secret is necessary
    return { ok: true };
  }

  async healthCheck() {
    const redis = await this.checkRedis();
    const turn = await this.checkTurn();
    const ok = redis.ok && turn.ok;
    return {
      status: ok ? 'ok' : 'fail',
      checks: { redis, turn },
    };
  }
}
