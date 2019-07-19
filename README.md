# kugou-lrc

[![npm](https://img.shields.io/npm/v/@s4p/kugou-lrc.svg?label=%40s4p%2Fkugou-lrc&style=flat-square)](https://www.npmjs.com/package/@s4p/kugou-lrc)
![build](https://gitlab.com/shang-music/kugou-lrc/badges/develop/build.svg)
![coverage](https://gitlab.com/shang-music/kugou-lrc/badges/develop/coverage.svg)

## how to use

`npm install @s4p/kugou-lrc`

**see [test folder](https://github.com/xinshangshangxin/music/tree/develop/kugou-lrc/test) to learn more**

### get

```ts
function get({
  keyword,
  milliseconds,
  fmt,
}: {
  keyword: string;
  milliseconds: number;
  fmt?: Format;
}): Promise<KrcInfo | LrcInfo>;

const lrc = await get({
  keyword: '小さな恋のうた',
  milliseconds: 325000,
  fmt: Format.lrc,
});
```

### search

```ts
function search({ keyword, milliseconds }: LrcSearchOption): Promise<KugouLrc[]>;

await search({ keyword: '小さな恋のうた', milliseconds: 325000 });
```

### download

```ts
function download(option: LrcDownloadOption): Promise<string>;

await download({ id, accesskey, fmt: Format.krc });
```

### parse

```ts
function parseKrc(content: string): KrcInfo;
function parseLrc(content: string): LrcInfo;

const krc = await parseKrc(krcStr);
```

### query

```ts
function query({
  keyword,
  milliseconds,
  parse,
}: {
  keyword: string;
  milliseconds: number;
  parse?: [number[], Format[]];
}): Promise<QueryItem[]>;

const [krcResult, ...others] = await query({
  keyword: '小さな恋のうた',
  milliseconds: 325000,
  parse: [[0], [Format.lrc]],
});
```
