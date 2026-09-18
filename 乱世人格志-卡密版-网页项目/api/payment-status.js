import { json } from '../server/payment-security.mjs';

export async function POST() {
  return json({ status: 'unpaid', paid: false, orderId: null, unlockedAt: null });
}
