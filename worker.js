/**
 * worker.js — Cloudflare Worker Entrypoint with Static Assets & API Routing
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Routes API requests (e.g. /api/vatar-webhook) to serverless handlers.
 * 2. Unlocks Cloudflare Environment Variables & Secrets (env.VATAR_WEBHOOK_SECRET).
 * 3. Serves all static assets (HTML, 3D GLBs, CSS, audio) via env.ASSETS.
 * ─────────────────────────────────────────────────────────────────────────
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ── 1. Webhook Endpoint for Lagos Life Purchases ───────────────────
    if (url.pathname === '/api/vatar-webhook') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }

      try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-vatar-signature') || request.headers.get('vatar-signature');
        const webhookSecret = env.VATAR_WEBHOOK_SECRET;

        // Verify HMAC signature if secret is configured in Cloudflare
        if (webhookSecret && signature) {
          const encoder = new TextEncoder();
          const keyData = encoder.encode(webhookSecret);
          const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
          );

          const sigBytes = new Uint8Array(
            signature.match(/[\da-f]{2}/gi)?.map(h => parseInt(h, 16)) || []
          );

          const isValid = await crypto.subtle.verify(
            'HMAC',
            cryptoKey,
            sigBytes,
            encoder.encode(rawBody)
          );

          if (!isValid) {
            return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        let payload = {};
        try {
          payload = JSON.parse(rawBody);
        } catch (_) {
          return new Response(JSON.stringify({ error: 'Malformed JSON' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        console.log('[VatarWebhook] Processed event:', payload.event, payload.sku);

        return new Response(JSON.stringify({ status: 'success', received: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal Error', message: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // ── 2. Static Asset Fallback ─────────────────────────────────────────
    // Serves all game files (index.html, garage.html, GLBs, JS, audio) from ./dist
    const res = await env.ASSETS.fetch(request);

    // Ensure headers allow framing inside Lagos Life and its sandbox
    const newHeaders = new Headers(res.headers);
    newHeaders.set(
      'Content-Security-Policy',
      'frame-ancestors https://lagoslife.app https://www.lagoslife.app https://naijalife.app https://www.naijalife.app https://lagoslife.eliysites.com https://*.lagoslife.app http://localhost:*'
    );
    newHeaders.delete('X-Frame-Options');

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders
    });
  }
};

