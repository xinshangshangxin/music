import { resolve } from 'node:path';
import type { SearchItem } from 'core';
import { Provider, mixed } from 'core';
import { load } from 'lx-wrap';
import { env } from 'node-helper';

let promise: Promise<[string, (id: string, provider: Provider) => Promise<string>][]> | undefined;

interface CandidateSong {
  name: string;
  artist: string;
  albumName: string;
}

async function getUrlFromSources(song: SearchItem) {
  if (!promise) {
    promise = load(resolve(import.meta.dirname, env.LX_SOURCE_DIR || '../assets'));
  }

  const sources = await promise;

  for (const [key, source] of sources) {
    const url = await source(song.id, song.provider);
    if (url?.length > 10) {
      logger.info(`${song.name}-${song.artist}-${song.albumName}-${song.provider} success by ${key}, url: ${url}`);
      return url;
    }
  }
}

async function getUrl(cs: CandidateSong) {
  const providers = [Provider.kuwo, Provider.migu];

  const record = await mixed.candidate(cs, providers);

  for (const provider of providers) {
    const song = record[provider];

    if (!song.id || !song.provider) {
      continue;
    }

    const url = await getUrlFromSources(song);
    if (!url) {
      continue;
    }

    return url;
  }
}

export { getUrl };
export type { CandidateSong };
