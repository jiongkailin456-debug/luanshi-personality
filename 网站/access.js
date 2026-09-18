/* 早期 MVP：验证码列表随静态网页发布，购买资格只保存在本浏览器。 */
const ACCESS_VERIFIED_KEY = 'accessVerified';
const ACCESS_CODE_KEY = 'accessCode';
const accessScreen = document.getElementById('access-screen');
const accessStatus = document.getElementById('access-status');
const accessForm = document.getElementById('access-form');
const accessInput = document.getElementById('access-code');
const siteShell = document.querySelector('.page-shell');
const validAccessCodes = new Set(VALID_ACCESS_CODES);
let activeCode = null;
let justActivated = false;
let resolveReady;
let readyResolved = false;
const ready = new Promise(resolve => { resolveReady = resolve; });

try {
  localStorage.removeItem('luanshi-access-token-v1');
  localStorage.removeItem('luanshi-access-id-v1');
} catch { /* 禁用本地存储时由验证入口提示。 */ }

function showGate(message = '') {
  activeCode = null;
  siteShell.hidden = true;
  accessScreen.hidden = false;
  accessStatus.textContent = message;
}
function showSite(code) {
  activeCode = code;
  accessScreen.hidden = true;
  siteShell.hidden = false;
  accessStatus.textContent = '';
  if (!readyResolved) { readyResolved = true; resolveReady(); }
}
function restoreAccess() {
  try {
    const code = localStorage.getItem(ACCESS_CODE_KEY);
    if (localStorage.getItem(ACCESS_VERIFIED_KEY) === 'true' && validAccessCodes.has(code)) {
      showSite(code);
      return;
    }
  } catch { /* 浏览器禁用本地存储时停留在验证页。 */ }
  showGate();
}

accessForm.addEventListener('submit', event => {
  event.preventDefault();
  const code = accessInput.value.trim();
  if (!/^\d{6}$/.test(code) || !validAccessCodes.has(code)) {
    showGate('验证码无效，请检查小红书订单中的发货信息。');
    return;
  }
  try {
    localStorage.setItem(ACCESS_VERIFIED_KEY, 'true');
    localStorage.setItem(ACCESS_CODE_KEY, code);
  } catch {
    showGate('浏览器未允许保存验证码，请开启本地存储后再验证。');
    return;
  }
  accessStatus.textContent = '✓ 验证成功，正在进入乱世人格志……';
  accessInput.value = '';
  window.setTimeout(() => {
    justActivated = true;
    showSite(code);
  }, 450);
});

window.AccessGate = {
  ready,
  getCode: () => activeCode,
  wasJustActivated: () => justActivated
};
restoreAccess();
window.addEventListener('pageshow', event => { if (event.persisted) restoreAccess(); });
