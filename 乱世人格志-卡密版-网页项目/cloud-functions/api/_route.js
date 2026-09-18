import { getStore } from '@edgeone/pages-blob';
import { jsonResponse, readBody, sameOrigin } from './_access-core.js';

export async function runPost(context, handler) {
  const { request } = context;
  if (!sameOrigin(request)) return jsonResponse({ success:false, reason:'forbidden' }, 403);
  const body = await readBody(request);
  if (!body || typeof body !== 'object') return jsonResponse({ success:false, reason:'bad_request' }, 400);
  try {
    const store = getStore({ name:'luanshi-access-v1', consistency:'strong' });
    return jsonResponse(await handler({ store, body, ip:context.clientIp || 'unknown' }));
  } catch (error) {
    console.error('Access service error:', error?.message || error);
    return jsonResponse({ success:false, reason:'service_unavailable' }, 503);
  }
}
