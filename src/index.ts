import { download, Format, search } from './download';
import { KrcInfo, parseKrc } from './parser/krc';
import { LrcInfo, parseLrc } from './parser/lrc';

async function get(params: {
  keyword: string;
  milliseconds: number;
  fmt: Format.krc;
}): Promise<KrcInfo>;
async function get(params: {
  keyword: string;
  milliseconds: number;
  fmt: Format.lrc;
}): Promise<LrcInfo>;
async function get(params: { hash: string; fmt: Format.krc }): Promise<KrcInfo>;
async function get(params: { hash: string; fmt: Format.lrc }): Promise<LrcInfo>;
async function get(params: { keyword: string; milliseconds: number }): Promise<KrcInfo>;
async function get(params: { hash: string }): Promise<KrcInfo>;
async function get(params: any): Promise<KrcInfo | LrcInfo> {
  const list = await search(params);
  if (!list.length) {
    throw new Error('no lrc');
  }

  const { fmt } = params;

  const [{ id, accesskey }] = list;
  const str = await download({ id, accesskey, fmt });

  if (fmt === Format.krc) {
    return parseKrc(str);
  }
  return parseLrc(str);
}

export { get };
export {
  download, LrcDownloadOption, Format, search, KugouLrc
} from './download';
export { parseKrc, KrcInfo } from './parser/krc';
export { parseLrc, LrcInfo } from './parser/lrc';
