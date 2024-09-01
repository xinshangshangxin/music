import Router from '@koa/router';
import { music } from './music';
import { proxy } from './proxy';
import { response } from '@/middlewares/response';

const v1 = new Router({
  prefix: '/api/v1',
}).use(response);

v1.use(proxy.routes());
v1.use(music.routes());

export { v1 };
