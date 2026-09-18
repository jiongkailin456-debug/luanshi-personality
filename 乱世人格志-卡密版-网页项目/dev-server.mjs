import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomInt } from 'node:crypto';
import { verifyAccess, checkAccess, saveResult } from './cloud-functions/api/_access-core.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const files = new Map([['/','index.html'],['/index.html','index.html'],['/deployment-check.html','deployment-check.html'],['/style.css','style.css'],['/app.js','app.js'],['/access.js','access.js'],['/payment.js','payment.js'],['/result-code.js','result-code.js']]);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8' };
const api = new Map([['/api/premium-report','./api/premium-report.js'],['/api/payment-status','./api/payment-status.js'],['/api/dev-payment','./api/dev-payment.js']]);
const port = Number(process.env.PORT) || 4173;
const devCode = /^\d{6}$/.test(process.env.DEV_ACCESS_CODE || '') ? process.env.DEV_ACCESS_CODE : String(randomInt(1000000)).padStart(6, '0');
const memory = new Map([[`codes/${devCode}.json`, { status:'unused', batchId:'local-dev' }]]);
const store = {
  async get(key) { return structuredClone(memory.get(key) ?? null); },
  async setJSON(key, value, options) {
    if (options?.onlyIfNew && memory.has(key)) return;
    memory.set(key, structuredClone(value));
  }
};
const accessApi = new Map([
  ['/api/verify-access-code', ({ code }) => verifyAccess({ store, code, ip:'127.0.0.1' })],
  ['/api/check-access', ({ accessToken }) => checkAccess({ store, accessToken })],
  ['/api/save-result', ({ accessToken, result }) => saveResult({ store, accessToken, input:result })]
]);

createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
  try {
    if (accessApi.has(pathname)) {
      if (request.method !== 'POST') { response.writeHead(405).end(); return; }
      let body = '';
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 8192) { response.writeHead(413).end(); return; }
      }
      const result = await accessApi.get(pathname)(JSON.parse(body));
      response.writeHead(200, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' }).end(JSON.stringify(result));
      return;
    }
    if (api.has(pathname)) {
      if (request.method !== 'POST') { response.writeHead(405).end(); return; }
      let body = '';
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 8192) { response.writeHead(413).end(); return; }
      }
      const { POST } = await import(api.get(pathname));
      const webRequest = new Request(`http://127.0.0.1:${port}${pathname}`, { method:'POST', headers:{'Content-Type':'application/json'}, body });
      const webResponse = await POST(webRequest);
      response.writeHead(webResponse.status, Object.fromEntries(webResponse.headers));
      response.end(Buffer.from(await webResponse.arrayBuffer()));
      return;
    }
    const file = files.get(pathname);
    if (!file) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type':types[path.extname(file)], 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
    response.end(await readFile(path.join(root, file)));
  } catch (_) { response.writeHead(500, { 'Content-Type':'application/json' }).end('{"error":"internal_error"}'); }
}).listen(port, '127.0.0.1', () => console.log(`本地开发服务：http://127.0.0.1:${port}；本次测试卡密：${devCode}`));
