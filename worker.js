/**
 * worker.js — Cloudflare Worker Entrypoint with Static Assets & API Routing
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Routes API requests (/api/vatar-webhook, /api/claim-purchase)
 * 2. Unlocks Cloudflare Environment Variables & Secrets (VATAR_SECRET, VATAR_WEBHOOK_SECRET)
 * 3. Verifies purchases with Lagos Life API: GET /api/games/v1/purchases/{id}
 * 4. Marks purchases delivered: POST /api/games/v1/purchases/{id}/deliver
 * 5. Serves all static assets (HTML, 3D GLBs, CSS, audio) via env.ASSETS
 * ─────────────────────────────────────────────────────────────────────────
 */

const LAGOS_LIFE_API = 'https://lagoslife.app/api/games/v1';

/**
 * Server-to-server verification & delivery with Lagos Life API
 */
async function verifyAndDeliverPurchase(purchaseId, vatarSecret) {
  if (!purchaseId) {
    throw new Error('Missing purchaseId');
  }

  if (!vatarSecret) {
    console.warn('[Worker] VATAR_SECRET not set in Cloudflare environment variables.');
    return { verified: false, delivered: false, reason: 'VATAR_SECRET not configured' };
  }

  const authHeader = {
    'Authorization': `Bearer ${vatarSecret}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  // Step 1: Verify purchase with Lagos Life server
  console.log(`[Worker] Verifying purchase "${purchaseId}" with Lagos Life...`);
  const verifyRes = await fetch(`${LAGOS_LIFE_API}/purchases/${encodeURIComponent(purchaseId)}`, {
    method: 'GET',
    headers: authHeader
  });

  let purchaseData = null;
  try {
    purchaseData = await verifyRes.json();
  } catch (_) {}

  console.log(`[Worker] Verify response (${verifyRes.status}):`, JSON.stringify(purchaseData));

  // Step 2: Mark purchase delivered
  console.log(`[Worker] Marking purchase "${purchaseId}" delivered...`);
  const deliverRes = await fetch(`${LAGOS_LIFE_API}/purchases/${encodeURIComponent(purchaseId)}/deliver`, {
    method: 'POST',
    headers: authHeader
  });

  let deliverData = null;
  try {
    deliverData = await deliverRes.json();
  } catch (_) {}

  console.log(`[Worker] Deliver response (${deliverRes.status}):`, JSON.stringify(deliverData));

  return {
    verified: verifyRes.ok,
    delivered: deliverRes.ok,
    purchase: purchaseData,
    deliver: deliverData
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ── 1. Client-Triggered Purchase Claim Endpoint ────────────────────
    // Called by the game client right after Vatar.purchase() completes
    if (url.pathname === '/api/claim-purchase' || url.pathname === '/api/vatar-claim') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }

      try {
        const body = await request.json();
        const { purchaseId, productId, playerId } = body;

        console.log(`[Worker] Claim request received for purchaseId: "${purchaseId}", product: "${productId}", player: "${playerId}"`);

        const vatarSecret = env.VATAR_SECRET;
        const result = await verifyAndDeliverPurchase(purchaseId, vatarSecret);

        return new Response(JSON.stringify({
          status: 'success',
          purchaseId,
          productId,
          verified: result.verified,
          delivered: result.delivered,
          details: result
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.error('[Worker] Claim error:', err);
        return new Response(JSON.stringify({
          error: 'Failed to process purchase claim',
          message: err.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // ── 2. Webhook Endpoint for Async Lagos Life Events ─────────────────
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

        const purchaseId = payload.purchaseId || payload.id;
        console.log(`[VatarWebhook] Received event "${payload.event}" for purchaseId: "${purchaseId}"`);

        // If this is a purchase event and we have purchaseId, verify & deliver
        if (purchaseId && env.VATAR_SECRET) {
          try {
            await verifyAndDeliverPurchase(purchaseId, env.VATAR_SECRET);
          } catch (e) {
            console.warn('[VatarWebhook] verifyAndDeliver warning:', e.message);
          }
        }

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

    // ── 3. Static Asset Fallback ─────────────────────────────────────────
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
