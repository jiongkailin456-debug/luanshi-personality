import { runPost } from './_route.js';
import { checkAccess } from './_access-core.js';

export const onRequestPost = context => runPost(context, ({ store, body }) =>
  checkAccess({ store, accessToken:body.accessToken }));
