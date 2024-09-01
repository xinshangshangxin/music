import Router from '@koa/router';
import { Provider, getParser, mixed } from 'core';
import { Errors } from 'node-helper';
import { url } from './url';

const music = new Router({
  prefix: '/music',
});

music.use(url.routes());

music.get('/search', async (ctx) => {
  const { keyword, provider = Provider.kuwo, skip = 0, limit = 10 } = ctx.query as Record<string, string | undefined>;

  if (!keyword) {
    throw new Errors.Required(['keyword'], '需要搜索名称');
  }

  if (!provider) {
    throw new Errors.Required(['provider'], '需要provider');
  }

  return mixed.getProvider(provider as Provider).search({
    keyword,
    skip: Number(skip),
    limit: Number(limit),
  });
});

music.get('/cover', async (ctx) => {
  const { coverId, provider } = ctx.query as Record<string, string | undefined>;

  if (!coverId) {
    throw new Errors.Required(['coverId'], '需要coverId');
  }

  if (!provider) {
    throw new Errors.Required(['provider'], '需要provider');
  }

  return mixed.coverImg(coverId, provider as Provider);
});

music.get('/candidate', async (ctx) => {
  const { name, artist, albumName } = ctx.query as Record<string, string | undefined>;

  if (!name || !artist || !albumName) {
    throw new Errors.Required(['name', 'artist', 'albumName']);
  }

  return mixed.candidate({ name, artist, albumName });
});

music.get('/share', async (ctx) => {
  const { url } = ctx.query as Record<string, string | undefined>;

  if (!url) {
    throw new Errors.Required(['url']);
  }

  const parser = await getParser(url);

  logger.info('match parser: ', parser);

  return parser.parse(url);
});

export { music };
