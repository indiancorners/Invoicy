import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Disable Vercel's default body parsing — HMAC verification needs raw bytes
export const config = {
  api: {
    bodyParser: false,
  },
};

function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';
    const signature = (req.headers['x-signature'] as string) || '';

    if (!secret) {
      console.error('Webhook misconfigured: LEMON_SQUEEZY_WEBHOOK_SECRET missing');
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    // timingSafeEqual throws on length mismatch — reject as 401 (not retryable)
    // rather than falling into the catch and returning a retryable 500.
    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
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

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Idempotency: skip duplicate deliveries. Unique-violation (23505) means
    // we've already processed this event — return 200 so LS stops retrying.
    if (eventId) {
      const { error: dedupErr } = await supabase
        .from('processed_webhooks')
        .insert({ id: eventId, event_name: eventName });
      if (dedupErr && dedupErr.code === '23505') {
        return res.status(200).json({ received: true, duplicate: true });
      }
      if (dedupErr) console.warn('Webhook dedup table issue:', dedupErr.message);
    }

    // Grant premium on purchase. upsert (not update) so a webhook arriving
    // before the client-side profile insert still upgrades the user.
    if (eventName === 'order_created' && userId) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, is_premium: true }, { onConflict: 'id' });
      if (error) {
        console.error('Error upgrading user:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log(`Upgraded user ${userId} to premium via Lemon Squeezy`);
    }

    // Revoke premium on refund.
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

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
