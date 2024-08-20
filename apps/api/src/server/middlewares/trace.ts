import { randomUUID } from 'node:crypto';
import type { Context, Next } from 'koa';
import { ALS, TRACE_KEY } from '@/utils/logger';

async function trace(ctx: Context, next: Next) {
  const traceId = ctx.get(TRACE_KEY) || randomUUID();
  ctx.set(TRACE_KEY, traceId);
  return ALS.run(traceId, next);
}

async function requestInfra(ctx: Context, next: Next) {
  if (!['POST', 'PATCH', 'GET'].includes(ctx.method)) {
    return next();
  }

  const logs: any[] = [
    '[request]',
    `${ctx.method} ${ctx.url} -- query:`,
    { ...ctx.request.query },
  ];

  if (ctx.method === 'POST' || ctx.method === 'PATCH') {
    if (ctx.request.rawBody && ctx.request.rawBody.startsWith('<xml>')) {
      logs.push('--- raw:');
      logs.push(ctx.request.rawBody);
    }

    logs.push('--- body:');
    logs.push({ ...(ctx.request.body || {}) });
  }

  logger.info(...(logs as [string, ...any[]]));
  return next();
}

async function responseInfra(ctx: Context, next: Next) {
  const start = Date.now();
  const logs: any[] = [];

  const data = await next();

  const ms = Date.now() - start;
  logs.push(
    '[response]',
    `${ctx.status} - ${ms}ms`,
    // `${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`,
  );

  logs.push('---');
  if ((ctx.body as any)?._readableState) {
    logs.push('response send buffer');
  } else {
    logs.push(ctx.body || '');
  }

  logger.info(...(logs as [string, ...any[]]));

  return data;
}

export { requestInfra, responseInfra, trace };
