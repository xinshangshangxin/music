import Router from '@koa/router';
import { Errors } from 'node-helper';
import { type CandidateSong, getUrl } from '../../../../../music-url';
import { audioPipe } from './audio-pipe';
import { downloader } from './download';

const url = new Router({
  prefix: '/url',
});

url.get('/', async (ctx) => {
  const { name, artist, albumName } = ctx.query as Partial<CandidateSong>;

  if (!name || !artist || !albumName) {
    throw new Errors.Required(['id', 'artist', 'albumName']);
  }

  const url = await getUrl({ name, artist, albumName });
  return url;
});

url.get('/pipe', async (ctx) => {
  const { name, artist, albumName } = ctx.query as Partial<CandidateSong>;

  if (!name || !artist || !albumName) {
    throw new Errors.Required(['id', 'artist', 'albumName']);
  }

  const realPath = await downloader.download({ name, artist, albumName });
  await audioPipe(ctx, realPath);
});

export { url };
