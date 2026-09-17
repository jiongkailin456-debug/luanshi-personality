import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const hash = (value, seed) => {
  let current = seed >>> 0;
  for (let i = 0; i < value.length; i++) current = Math.imul(current ^ value.charCodeAt(i), 16777619) >>> 0;
  return current.toString(16).padStart(8, '0');
};

export function validateResult(input) {
  if (!input || !Array.isArray(input.scores) || input.scores.length !== 8 ||
      !input.scores.every(value => Number.isInteger(value) && value >= 0 && value <= 100) ||
      typeof input.matchedCharacter !== 'string' || input.matchedCharacter.length > 30 ||
      typeof input.personalityType !== 'string' || input.personalityType.length > 30) return null;
  const canonical = `${input.scores.join(',')}|${input.matchedCharacter}|${input.personalityType}`;
  const resultId = `ls1-${hash(canonical, 2166136261)}`;
  const resultHash = `v1-${hash(canonical, 3339675911)}`;
  if (input.resultId !== resultId || input.resultHash !== resultHash) return null;
  return { resultId, resultHash, scores: input.scores, matchedCharacter: input.matchedCharacter, personalityType: input.personalityType };
}

export const devPaymentsEnabled = () =>
  process.env.PREMIUM_DEV_MODE === 'true' &&
  process.env.NODE_ENV !== 'production' &&
  process.env.VERCEL_ENV !== 'production' &&
  Boolean(process.env.PREMIUM_DEV_SECRET);

const sign = value => createHmac('sha256', process.env.PREMIUM_DEV_SECRET).update(value).digest('base64url');
export function createDevPayment(result) {
  if (!devPaymentsEnabled()) return null;
  const issuedAt = Date.now();
  const payload = { v: 1, resultId: result.resultId, resultHash: result.resultHash, orderId: `dev-${randomUUID()}`, issuedAt, expiresAt: issuedAt + 7 * 24 * 60 * 60 * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return { status: 'paid', paid: true, orderId: payload.orderId, unlockedAt: new Date(issuedAt).toISOString(), paymentToken: `dev.${encoded}.${sign(encoded)}` };
}

export async function verifyPayment(result, paymentToken) {
  // 未来真实收款：在此查询商户服务端订单，并核对金额、币种、resultId 和 resultHash。
  if (!devPaymentsEnabled() || typeof paymentToken !== 'string' || paymentToken.length > 2048) return { paid: false };
  const parts = paymentToken.split('.');
  if (parts.length !== 3 || parts[0] !== 'dev') return { paid: false };
  const expected = Buffer.from(sign(parts[1]));
  const supplied = Buffer.from(parts[2]);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return { paid: false };
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (payload.v !== 1 || payload.resultId !== result.resultId || payload.resultHash !== result.resultHash ||
        !Number.isFinite(payload.expiresAt) || payload.expiresAt < Date.now() || payload.issuedAt > Date.now() ||
        typeof payload.orderId !== 'string') return { paid: false };
    return { paid: true, orderId: payload.orderId, unlockedAt: new Date(payload.issuedAt).toISOString() };
  } catch (_) { return { paid: false }; }
}

export const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
