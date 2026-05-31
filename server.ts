import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import getRawBody from 'raw-body';
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // --- Lemon Squeezy Webhook API Route ---
  app.post(
    '/api/webhooks/lemonsqueezy',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      try {
        const rawBody = req.body;
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';
        const signature = (req.headers['x-signature'] as string) || '';

        if (!secret) {
          console.error('Webhook misconfigured: LEMON_SQUEEZY_WEBHOOK_SECRET missing');
          return res.status(500).json({ error: 'Server misconfigured' });
        }

        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
        const signatureBuffer = Buffer.from(signature, 'utf8');

        // timingSafeEqual throws RangeError on length mismatch — reject explicitly
        // as 401 instead of falling into the catch and returning 500 (which LS
        // treats as a retryable error).
        if (
          signatureBuffer.length !== digest.length ||
          !crypto.timingSafeEqual(digest, signatureBuffer)
        ) {
          return res.status(401).json({ error: 'Invalid signature' });
        }

        let payload: any;
        try {
          payload = JSON.parse(rawBody.toString('utf8'));
        } catch {
          return res.status(400).json({ error: 'Invalid JSON' });
        }

        const eventName = payload?.meta?.event_name;
        const eventId = payload?.meta?.event_id ?? null;
        const userId = payload?.meta?.custom_data?.user_id;

        if (!eventName) {
          return res.status(400).json({ error: 'Missing meta.event_name' });
        }

        // Require the service role key — the anon key can't write profiles /
        // processed_webhooks under RLS, so a fallback would silently fail to
        // grant premium to paying users.
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
          console.error('Webhook misconfigured: SUPABASE_SERVICE_ROLE_KEY missing');
          return res.status(500).json({ error: 'Server misconfigured' });
        }
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Idempotency: skip duplicate deliveries. The processed_webhooks table
        // must exist (id text primary key). If insert fails with unique
        // violation (23505), we've already processed this event — return 200
        // so LS stops retrying.
        if (eventId) {
          const { error: dedupErr } = await supabase
            .from('processed_webhooks')
            .insert({ id: eventId, event_name: eventName });
          if (dedupErr && dedupErr.code === '23505') {
            return res.status(200).json({ received: true, duplicate: true });
          }
          // Non-unique errors (e.g. table missing) shouldn't block processing —
          // log and continue rather than 500'ing into a retry storm.
          if (dedupErr) console.warn('Webhook dedup table issue:', dedupErr.message);
        }

        // Grant premium on purchase
        if (eventName === 'order_created' && userId) {
          // upsert so a webhook arriving before the client-side profile insert
          // (rare race) still grants premium
          const { error } = await supabase
            .from('profiles')
            .upsert({ id: userId, is_premium: true }, { onConflict: 'id' });
          if (error) {
            console.error('Error upgrading user:', error);
            return res.status(500).json({ error: 'Database error' });
          }
          console.log(`Upgraded user ${userId} to premium`);
        }

        // Revoke premium on refund
        if (eventName === 'order_refunded' && userId) {
          const { error } = await supabase
            .from('profiles')
            .update({ is_premium: false })
            .eq('id', userId);
          if (error) {
            console.error('Error revoking premium:', error);
            return res.status(500).json({ error: 'Database error' });
          }
          console.log(`Revoked premium for user ${userId} (refund)`);
        }

        res.status(200).json({ received: true });
      } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    }
  );

  // Standard JSON body parsing for everything else
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
