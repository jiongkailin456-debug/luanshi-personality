import { createDevPayment, devPaymentsEnabled, json, validateResult } from '../server/payment-security.mjs';

export async function POST(request) {
  if (!devPaymentsEnabled()) return json({ error: 'payment_not_configured' }, 404);
  let input;
  try { input = await request.json(); } catch (_) { return json({ error: 'invalid_request' }, 400); }
  const result = validateResult(input);
  if (!result) return json({ error: 'invalid_result' }, 400);
  return json({ ...createDevPayment(result), resultId: result.resultId, resultHash: result.resultHash });
}
