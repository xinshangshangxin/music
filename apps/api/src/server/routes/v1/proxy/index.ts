import type { Stream } from 'node:stream';
import Router from '@koa/router';
import type { AxiosResponseHeaders } from 'axios';
import axios from 'axios';

const proxy = new Router({
  prefix: '/proxy',
});

async function request(
  url: string,
  referer?: string,
  index = 0,
): Promise<{
    headers: AxiosResponseHeaders;
    data: Stream;
  }> {
  const { headers, data, status } = await axios({
    method: 'GET',
    url,

    headers:
      index === 0
        ? {
            'referer': referer || new URL(url).origin,
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          }
        : {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },

    responseType: 'stream',
  }).catch((e) => {
    logger.warn(e);
    return {} as Record<string, any>;
  });

  logger.log('proxy', { url, status, index });
  if ((!status || status >= 500) && index === 0) {
    return request(url, referer, 1);
  }

  return { headers, data };
}

proxy.get('/', async (ctx) => {
  const url = ctx.query.url as string;
  let referer = ctx.query.referer as string | undefined;

  const u = new URL(url);
  referer = referer || u.searchParams.get('referer') || u.origin;

  const { headers, data } = await request(url, referer);

  Object.entries(headers).forEach(([k, v]) => {
    ctx.set(k, v);
  });

  ctx.body = data;
});

export { proxy };
