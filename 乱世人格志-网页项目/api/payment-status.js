import { json, validateResult, verifyPayment } from '../server/payment-security.mjs';

export async function POST(request) {
  let input;
  try { input = await request.json(); } catch (_) { return json({ error: 'invalid_request' }, 400); }
  const result = validateResult(input);
  if (!result) return json({ error: 'invalid_result' }, 400);
  const verification = await verifyPayment(result, input.paymentToken);
  return json({ status: verification.paid ? 'paid' : 'unpaid', paid: verification.paid, resultId: result.resultId, resultHash: result.resultHash, orderId: verification.orderId || null, unlockedAt: verification.unlockedAt || null });
}
