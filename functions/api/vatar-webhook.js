/**
 * functions/api/vatar-webhook.js — Cloudflare Pages Function
 * ─────────────────────────────────────────────────────────────────────────
 * Handles Lagos Life Payment & Entitlement Webhooks.
 * Validates incoming HMAC-SHA256 signatures using env.VATAR_WEBHOOK_SECRET.
 * Secrets are encrypted in Cloudflare Pages Environment Variables, NEVER
 * exposed to client bundles or browser devtools.
 * ─────────────────────────────────────────────────────────────────────────
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-vatar-signature') || request.headers.get('vatar-signature');

    const webhookSecret = env.VATAR_WEBHOOK_SECRET;

    // Signature verification if secret is configured in Cloudflare
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

      // Convert hex signature to ArrayBuffer
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
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Malformed JSON payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { event, sku, playerId, transactionId } = payload;
    console.log(`[VatarWebhook] Received event "${event}" for player "${playerId}", sku: "${sku}", tx: "${transactionId}"`);

    // Process event types
    // event: 'purchase.completed' | 'entitlement.granted'
    return new Response(JSON.stringify({
      status: 'success',
      received: true,
      timestamp: Date.now()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[VatarWebhook] Internal error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

