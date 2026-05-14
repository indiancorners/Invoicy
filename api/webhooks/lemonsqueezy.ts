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

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(rawBody.toString('utf8'));

    if (payload.meta?.event_name === 'order_created') {
      const userId = payload.meta?.custom_data?.user_id;
      if (userId) {
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL || '',
          process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        const { error } = await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', userId);

        if (error) {
          console.error('Supabase update error:', error);
          return res.status(500).json({ error: 'Database error' });
        }

        console.log(`Upgraded user ${userId} to premium via Lemon Squeezy`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
