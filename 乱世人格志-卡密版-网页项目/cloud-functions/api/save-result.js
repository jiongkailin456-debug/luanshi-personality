import { runPost } from './_route.js';
import { saveResult } from './_access-core.js';

export const onRequestPost = context => runPost(context, ({ store, body }) =>
  saveResult({ store, accessToken:body.accessToken, input:body.result }));
