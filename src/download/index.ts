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

export interface LrcDownloadOption {
  id: string;
  accesskey: string;
  fmt?: Format;
}

async function search(params: { keyword: string; milliseconds: number }): Promise<KugouLrc[]>;
async function search(params: { hash: string }): Promise<KugouLrc[]>;
async function search(params: any): Promise<KugouLrc[]> {
  const qs: any = {
    ver: 1,
    man: 'yes',
    client: 'pc',
    duration: undefined,
    keyword: undefined,
    hash: undefined,
  };

  if (params.milliseconds) {
    qs.duration = params.milliseconds;
    qs.keyword = params.keyword;
  } else {
    qs.hash = params.hash;
  }

  const { candidates } = await kugouRp({
    method: 'GET',
    uri: '/search',
    qs,
    json: true,
  });

  return candidates;
}

async function download({
  fmt: inputFmt = Format.krc,
  ...option
}: LrcDownloadOption): Promise<string> {
  const { fmt, content } = await kugouRp({
    method: 'GET',
    uri: '/download',
    qs: {
      ver: 1,
      client: 'pc',
      charset: 'utf8',
      ...option,
      fmt: inputFmt,
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
