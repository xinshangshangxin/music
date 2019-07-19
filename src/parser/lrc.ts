import { baseInfoRegExpMap, splitLine } from './helper';

interface LrcItem {
  offset: number;
  line: string;
}

export interface LrcInfo {
  ti?: string;
  ar?: string;
  al?: string;
  by?: string;
  offset?: string;
  items: {
    duration: number;
    offset: number;
    line: string;
  }[];
}

function resolveLine(): LrcItem[] {
  const times = RegExp.$1.trim();
  const text = RegExp.$4.trim();

  const timeMatch = times.match(/(\[\d+:\d+(\.\d+)?\])/g);

  if (!timeMatch) {
    return [];
  }

  // 逐个时间处理
  return timeMatch
    .map((t) => {
      return t.trim();
    })
    .map((t) => {
      return t.substr(1, t.length - 2);
    })
    .map((time) => {
      const match = time.match(/^(\d+):(\d+)(\.\d+)?$/);
      if (!match) {
        return undefined;
      }

      let [, m, s, ms] = match;
      let t = parseInt(m, 10) * 60 + parseInt(s, 10);
      if (ms) {
        ms = ms.substr(1);
        t += parseInt(ms, 10) / 1000;
      }

      if (Number.isNaN(t)) {
        return undefined;
      }

      return { offset: t, line: text };
    })
    .filter((item) => {
      return item !== undefined;
    }) as LrcItem[];
}

function parseLrc(content: string): LrcInfo {
  const lrc: LrcInfo = { items: [] };

  const lines = splitLine(content);

  const regExpMap = {
    ...baseInfoRegExpMap,
    line: /^((\[\d+:\d+(\.\d+)?\])+)([\s\S]+?)$/,
  };

  const items: LrcItem[] = [];

  // 逐行转换
  lines.forEach((line) => {
    Object.keys(regExpMap).some((k) => {
      const key = k as keyof typeof regExpMap;
      const isMatch = regExpMap[key].test(line);

      if (isMatch) {
        if (key === 'line') {
          items.push(...resolveLine());
        } else {
          lrc[key] = RegExp.$1;
        }
      }

      return isMatch;
    });
  });

  items.sort((a, b) => {
    return a.offset - b.offset;
  });

  lrc.items = items.map((item, index) => {
    let next = items[index + 1];

    if (!next) {
      return {
        ...item,
        duration: Number.MAX_SAFE_INTEGER,
      };
    }

    return {
      ...item,
      duration: next.offset - item.offset,
    };
  });
  return lrc;
}

export { parseLrc };
