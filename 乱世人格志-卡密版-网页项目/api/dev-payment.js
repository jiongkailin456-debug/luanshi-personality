import { json } from '../server/payment-security.mjs';

export async function POST() {
  return json({ error: 'payment_not_configured' }, 404);
}
