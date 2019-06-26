# music-api

[![npm](https://img.shields.io/npm/v/@s4p/music-api.svg?label=%40s4p%2Fmusic-api&style=flat-square)](https://www.npmjs.com/package/@s4p/music-api)
![build](https://gitlab.com/shang-music/music-api/badges/develop/build.svg)
![coverage](https://gitlab.com/shang-music/music-api/badges/develop/coverage.svg)

## how to use

`npm install @s4p/music-api`

**see [test folder](https://github.com/shang-music/api/tree/develop/test) to learn more**

### search

```ts
function search(
  query: string | ISearchQuery,
  provider?: Provider | Provider[]
): Promise<ISearchItem[]>;

await search('Aragaki Yui');
```

### getSong

```ts
function getSong(id: string, provider: Provider, br?: BitRate): Promise<ISong>;

await getSong('A781023E25C4D09EABCB307BE8BD12E8', Provider.kugou);
```

### rank

```ts
function rank(
  provider: Provider,
  rankType: RankType,
  limit?: number,
  skip?: number
): Promise<ISearchItem[]>;

await rank(Provider.kugou, RankType.hot);
```

### playlist

```ts
function playlist(provider: Provider, id: string): Promise<ISearchItem[]>;

await playlist(Provider.kugou, '235427');
```

### album

```ts
function album(provider: Provider, id: string): Promise<ISearchItem[]>;

await album(Provider.kugou, '976931');
```

### Proxy

if you set environment variable `MUSIC_API_PROXY`, it will let all provider use this proxy string.

```bash
MUSIC_API_PROXY="http://your_proxy" npm run test
```

if you want to control special provider, you can use `setRequestOptions`

```ts
function setRequestOptions(
  options?: { proxy: string },
  providers = [Provider.kugou, Provider.netease, Provider.xiami]
): void;

// disable all proxy, use system request
setRequestOptions();

// use proxy for all providers
setRequestOptions('http://your_proxy');

// use proxy only for kugou
setRequestOptions('http://your_proxy', [Provider.kugou]);
```
