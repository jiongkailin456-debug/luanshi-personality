// 结果码用于离线传递数据和发现复制损坏，不是加密或防伪凭据。
const ResultCode = (() => {
  const keys = ['decision', 'empathy', 'innovation', 'insight', 'expression', 'management', 'independence', 'responsibility'];
  const types = ['谋局者', '开局者', '守局者', '合纵者', '破局者', '独行者', '持炬者', '经营者'];
  const characters = ['诸葛亮', '曹操', '刘备', '孙权', '周瑜', '司马懿', '张良', '韩信', '王安石', '苏轼', '范仲淹', '张居正', '班超', '李清照', '王阳明', '商鞅'];
  const scoreNames = ['决断', '共情', '开创', '洞察', '表达', '经营', '独立', '担当'];
  function checksum(value) {
    let current = 2166136261;
    for (let i = 0; i < value.length; i++) current = Math.imul(current ^ value.charCodeAt(i), 16777619) >>> 0;
    return current.toString(16).padStart(8, '0');
  }
  function encodeText(value) {
    const bytes = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    return btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  function decodeText(value) {
    const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4));
    let escaped = '';
    for (let i = 0; i < binary.length; i++) escaped += '%' + binary.charCodeAt(i).toString(16).padStart(2, '0');
    return decodeURIComponent(escaped);
  }
  function valid(data) {
    return data && data.version === 1 && data.scores && typeof data.scores === 'object' &&
      keys.every(key => Number.isInteger(data.scores[key]) && data.scores[key] >= 0 && data.scores[key] <= 100) &&
      types.includes(data.personalityType) && Array.isArray(data.matchedCharacters) && data.matchedCharacters.length === 3 &&
      data.matchedCharacters.every(item => item && characters.includes(item.name) && Number.isInteger(item.match) && item.match >= 0 && item.match <= 100) &&
      new Set(data.matchedCharacters.map(item => item.name)).size === 3 &&
      typeof data.createdAt === 'string' && !Number.isNaN(Date.parse(data.createdAt));
  }
  function encode(result, createdAt) {
    const scores = Object.fromEntries(keys.map((key, index) => [key, result.scores[index]]));
    const payload = { version:1, scores, personalityType:result.archetype.id,
      matchedCharacters:result.figures.slice(0, 3).map(item => ({ name:item.name, match:item.match })), createdAt };
    if (!valid(payload)) throw new Error('无法生成结果码');
    const body = encodeText(JSON.stringify(payload));
    return `LS1-${body}.${checksum(body)}`;
  }
  function decode(input) {
    const code = String(input || '').trim();
    const version = /^LS(\d+)-/i.exec(code);
    if (version && version[1] !== '1') return { ok:false, error:'unknown_version', message:'该结果来自新版测试，请升级报告生成器。' };
    const parts = /^LS1-([A-Za-z0-9_-]{20,2000})\.([a-f0-9]{8})$/.exec(code);
    if (!parts || checksum(parts[1]) !== parts[2]) return { ok:false, error:'invalid_code', message:'无法识别该结果码，请用户重新复制。' };
    try {
      const data = JSON.parse(decodeText(parts[1]));
      if (!valid(data)) throw new Error('invalid payload');
      return { ok:true, data, code };
    } catch (_) { return { ok:false, error:'invalid_code', message:'无法识别该结果码，请用户重新复制。' }; }
  }
  return Object.freeze({ encode, decode, keys, scoreNames });
})();
