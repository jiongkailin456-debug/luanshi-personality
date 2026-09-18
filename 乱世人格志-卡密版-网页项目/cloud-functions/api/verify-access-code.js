import { runPost } from './_route.js';
import { verifyAccess } from './_access-core.js';

export const onRequestPost = context => runPost(context, ({ store, body, ip }) =>
  verifyAccess({ store, code:body.code, ip }));
