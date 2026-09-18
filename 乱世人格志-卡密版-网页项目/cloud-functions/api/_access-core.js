// 仅在 EdgeOne Cloud Functions 运行。卡密与访问令牌从不进入静态资源。
const CODE_RE = /^\d{6}$/;
const TOKEN_RE = /^LSA1\.(\d{6})\.([A-Za-z0-9_-]{40,60})$/;
const SUBMISSION_RE = /^[a-f0-9-]{36}$/i;
const SCORE_KEYS = ['decision','empathy','innovation','insight','expression','management','independence','responsibility'];
const PERSONALITY_TYPES = ['谋局者','开局者','守局者','合纵者','破局者','独行者','持炬者','经营者'];
const CHARACTER_NAMES = ['诸葛亮','曹操','刘备','孙权','周瑜','司马懿','张良','韩信','王安石','苏轼','范仲淹','张居正','班超','李清照','王阳明','商鞅'];
const CODE_PREFIX = 'codes/';
const CLAIM_PREFIX = 'claims/';
const DISABLED_PREFIX = 'disabled/';
const RESULT_PREFIX = 'results/';

const key = (prefix, code) => `${prefix}${code}.json`;
const hex = bytes => [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
const sha256 = async value => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
const randomSecret = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};
const fresh = (store, path) => store.get(path, { type:'json', consistency:'strong' });

// Blob 的 onlyIfNew 用于不可覆盖的抢占。部分 SDK 可能在冲突时抛错，部分实现返回空值；
// 两种情况都重新强一致读取并比较自己的随机 nonce，只有真正写入者获准继续。
async function createOnce(store, path, value) {
  try { await store.setJSON(path, value, { onlyIfNew:true }); }
  catch (error) {
    const existing = await fresh(store, path);
    if (!existing) throw error;
  }
  const actual = await fresh(store, path);
  return actual?.nonce === value.nonce ? actual : null;
}

async function consumeAttempt(store, ip, now) {
  const digest = (await sha256(String(ip || 'unknown'))).slice(0, 24);
  const bucket = Math.floor(now / (15 * 60 * 1000));
  for (let slot = 1; slot <= 8; slot++) {
    const path = `attempts/${digest}/${bucket}/${slot}.json`;
    if (await fresh(store, path)) continue;
    const own = await createOnce(store, path, { nonce:crypto.randomUUID(), at:new Date(now).toISOString() });
    if (own) return true;
  }
  return false;
}

export async function verifyAccess({ store, code, ip, now = Date.now() }) {
  if (!CODE_RE.test(code || '')) return { success:false, reason:'invalid_code' };
  if (!await consumeAttempt(store, ip, now)) return { success:false, reason:'rate_limited' };
  const record = await fresh(store, key(CODE_PREFIX, code));
  if (!record || record.status !== 'unused') return { success:false, reason:'invalid_code' };
  if (await fresh(store, key(DISABLED_PREFIX, code))) return { success:false, reason:'code_disabled' };
  if (await fresh(store, key(CLAIM_PREFIX, code))) return { success:false, reason:'code_already_used' };
  const accessId = `ACCESS-${crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
  const accessToken = `LSA1.${code}.${randomSecret()}`;
  const claim = {
    nonce:crypto.randomUUID(), accessId, tokenHash:await sha256(accessToken),
    status:'activated', activatedAt:new Date(now).toISOString()
  };
  const won = await createOnce(store, key(CLAIM_PREFIX, code), claim);
  if (!won) return { success:false, reason:'code_already_used' };
  if (await fresh(store, key(DISABLED_PREFIX, code))) return { success:false, reason:'code_disabled' };
  return { success:true, accessId, accessToken };
}

export async function authorize(store, accessToken) {
  const match = TOKEN_RE.exec(accessToken || '');
  if (!match) return null;
  const code = match[1];
  if (await fresh(store, key(DISABLED_PREFIX, code))) return null;
  const claim = await fresh(store, key(CLAIM_PREFIX, code));
  if (!claim || claim.status !== 'activated') return null;
  if (claim.tokenHash !== await sha256(accessToken)) return null;
  return { code, accessId:claim.accessId, activatedAt:claim.activatedAt };
}

export async function checkAccess({ store, accessToken }) {
  const access = await authorize(store, accessToken);
  if (!access) return { success:false, reason:'invalid_token' };
  const primary = await fresh(store, `${RESULT_PREFIX}${access.accessId}/primary.json`);
  return { success:true, accessId:access.accessId, primaryResultId:primary?.resultId || null };
}

function validResult(input) {
  if (!input || !SUBMISSION_RE.test(input.submissionId || '')) return false;
  const data = decodeResultCode(input.resultCode);
  if (!data || !PERSONALITY_TYPES.includes(input.personalityType) || data.personalityType !== input.personalityType) return false;
  if (!input.scores || !SCORE_KEYS.every(name => Number.isInteger(input.scores[name]) && input.scores[name] >= 0 && input.scores[name] <= 100)) return false;
  if (!SCORE_KEYS.every(name => data.scores[name] === input.scores[name])) return false;
  return Array.isArray(input.matchedCharacters) && input.matchedCharacters.length === 3 && input.matchedCharacters.every((item, index) =>
    CHARACTER_NAMES.includes(item.name) && Number.isInteger(item.match) && item.match >= 0 && item.match <= 100 &&
    data.matchedCharacters[index]?.name === item.name && data.matchedCharacters[index]?.match === item.match) &&
    new Set(input.matchedCharacters.map(item => item.name)).size === 3;
}

function decodeResultCode(code) {
  const parts = typeof code === 'string' && code.length <= 2000 && /^LS1-([A-Za-z0-9_-]{20,2000})\.([a-f0-9]{8})$/.exec(code);
  if (!parts) return null;
  let hash = 2166136261;
  for (let index = 0; index < parts[1].length; index++) hash = Math.imul(hash ^ parts[1].charCodeAt(index), 16777619) >>> 0;
  if (hash.toString(16).padStart(8, '0') !== parts[2]) return null;
  try {
    const bytes = Uint8Array.from(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - parts[1].length % 4) % 4)), char => char.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    return data?.version === 1 && data.scores && Array.isArray(data.matchedCharacters) &&
      typeof data.createdAt === 'string' && !Number.isNaN(Date.parse(data.createdAt)) ? data : null;
  } catch { return null; }
}

export async function saveResult({ store, accessToken, input, now = Date.now() }) {
  const access = await authorize(store, accessToken);
  if (!access) return { success:false, reason:'invalid_token' };
  if (!validResult(input)) return { success:false, reason:'invalid_result' };
  const base = `${RESULT_PREFIX}${access.accessId}/`;
  const resultId = `RESULT-${input.submissionId.replace(/-/g, '').toUpperCase()}`;
  const revision = {
    nonce:crypto.randomUUID(), resultId, accessId:access.accessId,
    submittedAt:new Date(now).toISOString(), resultCode:input.resultCode,
    personalityType:input.personalityType, matchedCharacters:input.matchedCharacters,
    scores:Object.fromEntries(SCORE_KEYS.map(name => [name, input.scores[name]]))
  };
  const revisionPath = `${base}revisions/${input.submissionId}.json`;
  const existing = await fresh(store, revisionPath);
  if (!existing) await createOnce(store, revisionPath, revision);
  const stored = await fresh(store, revisionPath);
  if (!stored || stored.accessId !== access.accessId) throw new Error('result_write_failed');
  if (!await fresh(store, `${base}primary.json`)) {
    await createOnce(store, `${base}primary.json`, { ...stored, nonce:crypto.randomUUID() });
  }
  const primary = await fresh(store, `${base}primary.json`);
  if (!primary) throw new Error('primary_write_failed');
  return { success:true, accessId:access.accessId, resultId:stored.resultId, primaryResultId:primary.resultId };
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers:{
    'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store, private',
    'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer'
  } });
}

export async function readBody(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return null;
  const raw = await request.text();
  if (raw.length > 8192) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}
