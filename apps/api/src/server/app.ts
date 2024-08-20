import cors from '@koa/cors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import { requestInfra, responseInfra, trace } from './middlewares/trace';

const app = new Koa();

// 请求 traceId
app.use(trace);

// 返回结果打印
app.use(responseInfra);

// json
app.use(
  bodyParser({
    jsonLimit: '25mb',
  }),
);

// 请求体打印
app.use(requestInfra);

// 跨域
app.use(cors({ origin: '*' }));

export { app };
