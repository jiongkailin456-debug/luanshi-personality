/* 仅保存本浏览器的访问令牌与 accessId；卡密库存和验证规则始终在服务器。 */
const ACCESS_TOKEN_KEY = 'luanshi-access-token-v1';
const ACCESS_ID_KEY = 'luanshi-access-id-v1';
const accessScreen = document.getElementById('access-screen');
const accessStatus = document.getElementById('access-status');
const accessForm = document.getElementById('access-form');
const accessInput = document.getElementById('access-code');
const accessSubmit = document.getElementById('access-submit');
const accessRetry = document.getElementById('access-retry');
const siteShell = document.querySelector('.page-shell');
let activeToken = null;
let activeId = null;
let justActivated = false;
let resolveReady;
let readyResolved = false;
const ready = new Promise(resolve => { resolveReady = resolve; });

function stored(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function clearStoredAccess() {
  try { localStorage.removeItem(ACCESS_TOKEN_KEY); localStorage.removeItem(ACCESS_ID_KEY); } catch { /* 忽略 */ }
  activeToken = null;
  activeId = null;
}
function showGate(message = '') {
  siteShell.hidden = true;
  accessScreen.hidden = false;
  accessStatus.textContent = message;
}
function showSite(token, accessId) {
  activeToken = token;
  activeId = accessId;
  accessScreen.hidden = true;
  siteShell.hidden = false;
  accessStatus.textContent = '';
  if (!readyResolved) { readyResolved = true; resolveReady(); }
}
async function post(path, body) {
  const response = await fetch(path, {
    method:'POST', headers:{ 'Content-Type':'application/json' },
    body:JSON.stringify(body), cache:'no-store', credentials:'omit'
  });
  const data = await response.json();
  if (!response.ok && data.reason === 'service_unavailable') throw new Error('service_unavailable');
  return data;
}
async function checkSavedAccess() {
  const token = stored(ACCESS_TOKEN_KEY);
  if (!token) { showGate(); accessRetry.hidden = true; return; }
  showGate('正在核验访问资格……');
  accessRetry.hidden = true;
  try {
    const result = await post('/api/check-access', { accessToken:token });
    if (!result.success) {
      clearStoredAccess();
      showGate('访问资格已失效。如这是你的订单，请联系客服。');
      return;
    }
    try { localStorage.setItem(ACCESS_ID_KEY, result.accessId); } catch { /* 仍可使用本次会话 */ }
    showSite(token, result.accessId);
  } catch {
    showGate('验证服务暂不可用，请检查网络后重试。');
    accessRetry.hidden = false;
  }
}

accessForm.addEventListener('submit', async event => {
  event.preventDefault();
  const code = accessInput.value.replace(/\s/g, '');
  if (!/^\d{6}$/.test(code)) { showGate('请输入 6 位数字验证码。'); return; }
  try {
    const probe = '__luanshi_storage_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
  } catch {
    showGate('浏览器未允许保存访问资格，请开启本地存储后再验证。');
    return;
  }
  accessSubmit.disabled = true;
  accessRetry.hidden = true;
  accessStatus.textContent = '正在验证……';
  try {
    const result = await post('/api/verify-access-code', { code });
    if (!result.success) {
      accessStatus.textContent = ({
        invalid_code:'验证码无效，请检查订单中的发货信息。',
        code_already_used:'该验证码已经激活。如这是你自己的订单，请联系客服。',
        code_disabled:'该验证码已停用，请联系客服。',
        rate_limited:'尝试次数过多，请 15 分钟后再试。'
      })[result.reason] || '验证未完成，请稍后重试。';
      return;
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
    localStorage.setItem(ACCESS_ID_KEY, result.accessId);
    accessStatus.textContent = '✓ 验证成功，正在进入乱世人格志……';
    accessInput.value = '';
    window.setTimeout(() => { justActivated = true; showSite(result.accessToken, result.accessId); }, 450);
  } catch {
    accessStatus.textContent = '验证服务暂不可用，请检查网络后重试。';
  } finally {
    accessSubmit.disabled = false;
  }
});

accessRetry.addEventListener('click', checkSavedAccess);
window.AccessGate = {
  ready,
  getAccessId:() => activeId,
  getToken:() => activeToken,
  wasJustActivated:() => justActivated,
  saveResult:result => post('/api/save-result', { accessToken:activeToken, result })
};
checkSavedAccess();
window.addEventListener('pageshow', event => { if (event.persisted) checkSavedAccess(); });
