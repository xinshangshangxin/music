import { baseInfoRegExpMap, splitLine } from './helper';

interface KrcWord {
  duration: number;
  offset: number;
  word: string;
}

interface KrcLine {
  offset: number;
  duration: number;
  words: KrcWord[];
}

export interface KrcInfo {
  ti?: string;
  ar?: string;
  al?: string;
  by?: string;
  offset?: string;
  items: KrcWord[][];
}

function parseWords(input: string): KrcWord[] {
  let str = input;
  const words: KrcWord[] = [];
  do {
    const match = str.match(/^<(\d+),(\d+),(\d+)>([\s\S]+?)(<|$)/);
    if (!match) {
      break;
    }
    const [sub, offset, duration, , word] = match;

    words.push({
      word,
      duration: parseInt(duration, 10),
      offset: parseInt(offset, 10),
    });

    const isEnd = sub[sub.length - 1] !== '<';
    if (isEnd) {
      break;
    } else {
      str = str.substr(sub.length - 1);
    }

    // eslint-disable-next-line no-constant-condition
  } while (true);

  return words;
}

function resolveLine(): KrcLine[] {
  const times = RegExp.$1;
  const body = RegExp.$3;

  if (!times) {
    return [];
  }
  // 时间
  const timeMatch = times.match(/\[\d+,\d+\]/g);
  if (!timeMatch) {
    return [];
  }
  // 文本
  const words = parseWords(body);
  // 每个时间
  return timeMatch
    .map((time) => {
      const match = time.match(/^\[(\d+),(\d+)\]$/);
      if (!match) {
        return undefined;
      }
      return {
        offset: parseInt(match[1], 10),
        duration: parseInt(match[2], 10),
        words,
      };
    })
    .filter((item) => {
      return !!item;
    }) as KrcLine[];
}

function parseKrc(content: string): KrcInfo {
  const krc: KrcInfo = { items: [] };
  // 行分割
  const lines = splitLine(content);

  const regExpMap = {
    ...baseInfoRegExpMap,
    line: /^((\[\d+,\d+\])+)([\s\S]+)$/,
  };

  const items: KrcLine[] = [];

  // 逐行转换
  lines.forEach((line) => {
    Object.keys(regExpMap).some((k) => {
      const key = k as keyof typeof regExpMap;
      const isMatch = regExpMap[key].test(line);

      if (isMatch) {
        if (key === 'line') {
          items.push(...resolveLine());
        } else {
          krc[key] = RegExp.$1;
        }
      }

      return isMatch;
    });
  });

  items.sort((a, b) => {
    return a.offset - b.offset;
  });

  krc.items = items.map(({ offset, words }) => {
    return words.map((item) => {
      return {
        offset: (offset + item.offset) / 1000,
        duration: item.duration / 1000,
        word: item.word,
      };
    });
  });

  return krc;
}

export { parseKrc };
