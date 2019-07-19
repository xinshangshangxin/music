import {
  download, Format, KugouLrc, search
} from './download';
import { KrcInfo, parseKrc } from './parser/krc';
import { LrcInfo, parseLrc } from './parser/lrc';

type QueryItem =
  | KugouLrc & { lrc?: LrcInfo; krc?: KrcInfo; fmt?: Format; str?: string }
  | {
    lrc?: LrcInfo;
    krc?: KrcInfo;
    fmt: Format;
    str: string;
    id: string;
    accesskey: string;
    duration: number;
    uid: string;
    song: string;
    singer: string;
  };

async function query({
  keyword,
  milliseconds,
  parse = [[0], [Format.krc]],
}: {
  keyword: string;
  milliseconds: number;
  parse?: [number[], Format[]];
}): Promise<QueryItem[]> {
  const list = await search({ keyword, milliseconds });

  if (!list.length) {
    return [];
  }

  const [parseList, fmtList] = parse;

  if (!parseList || !parseList.length) {
    return list;
  }

  const promises = list.map(async (item, index) => {
    if (!parseList.includes(index)) {
      return item;
    }

    const fmt = fmtList[index];
    const str = await download({ id: item.id, accesskey: item.accesskey, fmt });
    const result: { lrc?: LrcInfo; krc?: KrcInfo } = {};

    if (fmt === Format.krc) {
      result.krc = parseKrc(str);
    } else if (fmt === Format.lrc) {
      result.lrc = parseLrc(str);
    }

    return {
      ...item,
      fmt,
      str,
      ...result,
    };
  });

  return Promise.all(promises);
}

async function get({
  keyword,
  milliseconds,
  fmt = Format.krc,
}: {
  keyword: string;
  milliseconds: number;
  fmt?: Format;
}): Promise<KrcInfo | LrcInfo> {
  const list = await search({ keyword, milliseconds });
  if (!list.length) {
    throw new Error('no lrc');
  }

  const [{ id, accesskey }] = list;
  const str = await download({ id, accesskey, fmt });

  if (fmt === Format.krc) {
    return parseKrc(str);
  }
  return parseLrc(str);
}

export { get, query };
export {
  download, LrcDownloadOption, Format, search, LrcSearchOption, KugouLrc
} from './download';
export { parseKrc, KrcInfo } from './parser/krc';
export { parseLrc, LrcInfo } from './parser/lrc';
