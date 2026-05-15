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
        const signature = req.headers['x-signature'] as string || '';
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
        );

        // Verify Lemon Squeezy signature
        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
        const signatureBuffer = Buffer.from(signature, 'utf8');

        if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
          return res.status(401).json({ error: 'Invalid signature' });
        }

        const payload = JSON.parse(rawBody.toString('utf8'));

        // Handle order_created event
        if (payload.meta.event_name === 'order_created') {
          const customData = payload.meta.custom_data;
          if (customData && customData.user_id) {
            const userId = customData.user_id;

            // Update user's profile to premium in Supabase
            const { error } = await supabase
              .from('profiles')
              .update({ is_premium: true })
              .eq('id', userId);

            if (error) {
              console.error('Error updating user profile:', error);
              return res.status(500).json({ error: 'Database error' });
            }
            
            console.log(`Successfully upgraded user ${userId} to premium via Lemon Squeezy webhook!`);
          }
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
