import { json } from '../server/payment-security.mjs';

// 当前改为小红书成交后由卖家本地生成报告；网页不提供自动付费报告。
export async function POST() {
  return json({ error: 'premium_required' }, 403);
}
