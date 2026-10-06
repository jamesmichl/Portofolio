'use strict';
const { createHash } = require('node:crypto');

const RECIPIENT = 'james.lionel@binus.ac.id';
const EMAIL = /^(?!\.)(?![^@]*\.\.)[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const FAILURE = 'Something went wrong while sending your message. Please try again or contact me directly by email.';
const MAX_BYTES = 32768;
const buckets = new Map();
const WINDOW_MS = 10 * 60 * 1000;

// Lightweight best-effort limit per warm function instance, not a distributed quota.
// Only hashes of network addresses are retained, never message contents.
function rateLimited(req) {
    const now = Date.now();
    for (const [key, entry] of buckets) if (entry.until <= now) buckets.delete(key);
    const address = process.env.VERCEL === '1'
        ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
        : req.socket?.remoteAddress || 'local';
    const key = createHash('sha256').update(address).digest('hex');
    let entry = buckets.get(key);
    if (!entry) {
        // Bound memory even if many different clients reach this instance.
        if (buckets.size >= 5000) return true;
        entry = { count: 0, until: now + WINDOW_MS };
        buckets.set(key, entry);
    }
    return ++entry.count > 5;
}

module.exports = async function contact(req, res) {
    const reply = (status, error) => res.status(status).json(error ? { ok: false, error } : { ok: true });
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return reply(405, FAILURE);
    }
    // No CORS endpoint: only the portfolio's own origin may submit in a browser.
    try {
        const origin = new URL(req.headers.origin);
        if (!['https:', 'http:'].includes(origin.protocol) || origin.host !== req.headers.host) return reply(403, FAILURE);
    } catch { return reply(403, FAILURE); }
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return reply(415, FAILURE);
    if (Number(req.headers['content-length']) > MAX_BYTES) return reply(413, FAILURE);

    let body;
    try {
        body = req.body; // Vercel parses JSON; this getter can throw for malformed JSON.
        if (typeof body === 'string') body = JSON.parse(body);
        if (!body || Array.isArray(body) || typeof body !== 'object') return reply(400, FAILURE);
        if (Buffer.byteLength(JSON.stringify(body)) > MAX_BYTES) return reply(413, FAILURE);
    } catch { return reply(400, FAILURE); }
    const { name, email, message, website, requestId } = body;
    if ([name, email, message].some(value => typeof value !== 'string') ||
        typeof website !== 'string' || website !== '' ||
        typeof requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) return reply(400, FAILURE);
    const sender = name.trim(), replyTo = email.trim(), text = message.trim();
    if (!sender || sender.length > 100 || /[\x00-\x1f\x7f]/.test(sender) ||
        !EMAIL.test(replyTo) || replyTo.length > 254 ||
        !text || text.length > 5000 || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(text)) return reply(400, FAILURE);
    if (rateLimited(req)) {
        res.setHeader('Retry-After', '600');
        return reply(429, FAILURE);
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.CONTACT_FROM_EMAIL?.trim();
    if (!apiKey || !from || !EMAIL.test(from) || from.length > 254) return reply(503, FAILURE);
    const payload = {
        from: `Portfolio <${from}>`,
        to: [RECIPIENT],
        reply_to: replyTo,
        subject: `Portfolio Contact — ${sender}`,
        text: `Sender name: ${sender}\nSender email: ${replyTo}\n\nMessage:\n${text}`
    };
    // Retrying the same unchanged submission does not send another email.
    const digest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Idempotency-Key': `portfolio/${requestId}/${digest}`
            },
            body: JSON.stringify(payload), signal: controller.signal
        });
        const result = await response.json();
        if (!response.ok || typeof result.id !== 'string' || !result.id) return reply(502, FAILURE);
        // Provider acceptance is confirmed; actual inbox arrival requires a real delivery test.
        return reply(200);
    } catch { return reply(502, FAILURE); }
    finally { clearTimeout(timeout); }
};
