import rp from 'request-promise';

import { decodeKrc } from './krc-decode';

const kugouRp = rp.defaults({
  baseUrl: 'http://lyrics.kugou.com/',
});

export enum Format {
  lrc = 'lrc',
  krc = 'krc',
}

export interface KugouLrc {
  id: string;
  accesskey: string;
  duration: number;
  uid: string;
  song: string;
  singer: string;
}

export interface LrcSearchOption {
  keyword: string;
  milliseconds: number;
}

export interface LrcDownloadOption {
  id: string;
  accesskey: string;
  fmt: Format;
}

async function search({ keyword, milliseconds }: LrcSearchOption): Promise<KugouLrc[]> {
  const { candidates } = await kugouRp({
    method: 'GET',
    uri: '/search',
    qs: {
      ver: 1,
      man: 'yes',
      client: 'pc',
      keyword,
      duration: milliseconds,
    },
    json: true,
  });

  return candidates;
}

async function download(option: LrcDownloadOption): Promise<string> {
  const { fmt, content } = await kugouRp({
    method: 'GET',
    uri: '/download',
    qs: {
      ver: 1,
      client: 'pc',
      charset: 'utf8',
      ...option,
    },
    json: true,
  });

  if (fmt !== Format.lrc && fmt !== Format.krc) {
    throw new Error('unknown fmt');
  }

  if (!content) {
    throw new Error('empty content');
  }

  const buf = Buffer.from(content, 'base64');

  if (fmt === Format.krc) {
    const buffer = await decodeKrc(buf);
    return buffer.toString();
  }

  return buf.toString();
}

export { search, download };
