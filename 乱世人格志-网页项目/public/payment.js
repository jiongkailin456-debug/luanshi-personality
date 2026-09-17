// 生产环境默认关闭。仅在本机开发服务与服务端双重开启时显示模拟付款入口。
const DEV_MODE = false;
const PREMIUM_PRICE = 3.9;
const PREMIUM_PURCHASE_KEY = 'luanshi-premium-purchase-v1';

const PremiumPayment = (() => {
  const isLocalDev = DEV_MODE && ['localhost', '127.0.0.1'].includes(location.hostname);
  const hash = (value, seed) => {
    let current = seed >>> 0;
    for (let i = 0; i < value.length; i++) current = Math.imul(current ^ value.charCodeAt(i), 16777619) >>> 0;
    return current.toString(16).padStart(8, '0');
  };
  const identity = result => {
    const canonical = `${result.scores.join(',')}|${result.figures[0].name}|${result.archetype.id}`;
    return {
      resultId: `ls1-${hash(canonical, 2166136261)}`,
      resultHash: `v1-${hash(canonical, 3339675911)}`,
      scores: result.scores,
      matchedCharacter: result.figures[0].name,
      personalityType: result.archetype.id
    };
  };
  async function post(path, data) {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), cache: 'no-store' });
    let body;
    try { body = await response.json(); } catch (_) { body = { error: 'service_unavailable' }; }
    return { ok: response.ok, statusCode: response.status, ...body };
  }
  async function createOrder() {
    // 接入商户后在这里创建真实订单；当前绝不返回假订单。
    return { status: 'payment_not_configured' };
  }
  async function checkPaymentStatus(purchase) {
    if (!purchase?.paymentToken) return { status: 'payment_not_configured' };
    try { return await post('/api/payment-status', purchase); }
    catch (_) { return { status: 'payment_not_configured' }; }
  }
  async function verifyPayment(purchase) {
    const status = await checkPaymentStatus(purchase);
    return status.status === 'paid' && status.paid === true && status.resultId === purchase.resultId && status.resultHash === purchase.resultHash;
  }
  async function unlockPremium(purchase) {
    if (!await verifyPayment(purchase)) return { status: 'unpaid' };
    try {
      const response = await post('/api/premium-report', {
        resultId: purchase.resultId,
        resultHash: purchase.resultHash,
        scores: purchase.scores,
        matchedCharacter: purchase.matchedCharacter,
        personalityType: purchase.personalityType,
        paymentToken: purchase.paymentToken
      });
      return response.ok && response.report ? { status: 'paid', report: response.report } : { status: 'unpaid' };
    } catch (_) { return { status: 'unpaid' }; }
  }
  async function restorePurchase(purchase, currentIdentity) {
    if (!purchase || purchase.resultId !== currentIdentity.resultId || purchase.resultHash !== currentIdentity.resultHash) return { status: 'unpaid' };
    return unlockPremium({ ...currentIdentity, paymentToken: purchase.paymentToken });
  }
  async function simulateDevPayment(currentIdentity) {
    if (!isLocalDev) return { status: 'payment_not_configured' };
    try { return await post('/api/dev-payment', currentIdentity); }
    catch (_) { return { status: 'payment_not_configured' }; }
  }
  return Object.freeze({ price: PREMIUM_PRICE, devMode: isLocalDev, identity, createOrder, checkPaymentStatus, verifyPayment, unlockPremium, restorePurchase, simulateDevPayment, storageKey: PREMIUM_PURCHASE_KEY });
})();
