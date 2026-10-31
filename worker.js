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
  // Lagos Life API requires POST /purchases/{id}/deliver
  console.log(`[Worker] Step 2: Marking purchase "${purchaseId}" delivered...`);
  const deliverRes = await fetch(`${LAGOS_LIFE_API}/purchases/${encodeURIComponent(purchaseId)}/deliver`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({})
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
    // Compatible with /claim (official docs), /api/claim, /api/claim-purchase, /api/vatar-claim
    if (url.pathname === '/claim' || url.pathname === '/api/claim' || url.pathname === '/api/claim-purchase' || url.pathname === '/api/vatar-claim') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }

      try {
        const body = await request.json();
        const purchaseId = body.purchaseId || body.data?.purchaseId || body.id;
        const productId = body.productId || body.sku;
        const playerId = body.playerId;
        const session = body.session;

        console.log(`[Worker] Claim request received for purchaseId: "${purchaseId}", product: "${productId}", player: "${playerId}"`);

        // If session token provided, optionally verify session with Lagos Life API
        if (session && env.VATAR_SECRET) {
          try {
            await fetch(`${LAGOS_LIFE_API}/session/verify`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.VATAR_SECRET.trim()}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ session })
            });
          } catch (e) {
            console.warn('[Worker] Session verify warning:', e.message);
          }
        }

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
    // Supports /api/vatar-webhook, /webhook, and /api/webhook
    if (url.pathname === '/api/vatar-webhook' || url.pathname === '/webhook' || url.pathname === '/api/webhook') {
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
          const keyData = encoder.encode(webhookSecret.trim());
          const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
          );

          // Strip sha256= or v1= prefix before matching hex bytes
          const cleanSig = signature.replace(/^(sha256=|v1=)/i, '').trim();
          const sigBytes = new Uint8Array(
            cleanSig.match(/[\da-f]{2}/gi)?.map(h => parseInt(h, 16)) || []
          );

          const isValid = await crypto.subtle.verify(
            'HMAC',
            cryptoKey,
            sigBytes,
            encoder.encode(rawBody)
          );

          if (!isValid) {
            console.warn('[Worker] Webhook HMAC signature mismatch. Signature:', signature);
            // In production, reject if signature fails
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

        console.log('[Worker] Webhook raw payload received:', JSON.stringify(payload));

        // In Lagos Life webhooks, event type is "purchase.paid" and real purchaseId is inside data:
        // { id: "evt_...", type: "purchase.paid", data: { purchaseId: "pur_...", productId: "..." } }
        const eventType = payload.type || payload.event;
        const purchaseId = payload.data?.purchaseId ||
                           payload.data?.id ||
                           payload.purchase?.purchaseId ||
                           payload.purchase?.id ||
                           payload.purchaseId ||
                           (payload.id && !payload.id.startsWith('evt_') ? payload.id : null);

        console.log(`[VatarWebhook] Event: "${eventType}", Extracted purchaseId: "${purchaseId}"`);

        // If purchaseId extracted and VATAR_SECRET configured, verify with server & mark delivered
        if (purchaseId && env.VATAR_SECRET) {
          try {
            const deliverResult = await verifyAndDeliverPurchase(purchaseId, env.VATAR_SECRET);
            console.log('[VatarWebhook] verifyAndDeliver completed:', JSON.stringify(deliverResult));
          } catch (e) {
            console.warn('[VatarWebhook] verifyAndDeliver warning:', e.message);
          }
        } else if (!env.VATAR_SECRET) {
          console.warn('[VatarWebhook] Missing VATAR_SECRET in environment; cannot verify purchase.');
        } else {
          console.warn('[VatarWebhook] No purchaseId found in payload data.');
        }

        return new Response(JSON.stringify({ status: 'success', received: true, purchaseId }), {
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
