import { json, validateResult, verifyPayment } from '../server/payment-security.mjs';
import { generatePremiumReport } from '../server/premium-report-content.mjs';

export async function POST(request) {
  let input;
  try { input = await request.json(); } catch (_) { return json({ error: 'invalid_request' }, 400); }
  const result = validateResult(input);
  if (!result) return json({ error: 'invalid_result' }, 400);
  const verification = await verifyPayment(result, input.paymentToken);
  if (!verification.paid) return json({ error: 'premium_required' }, 403);
  return json({ report: generatePremiumReport(result), resultId: result.resultId, status: 'paid' });
}
