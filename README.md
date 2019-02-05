# music-api

![build](https://gitlab.com/shang-music/music-api/badges/develop/build.svg)
![coverage](https://gitlab.com/shang-music/music-api/badges/develop/coverage.svg)

## how to use

`npm install @s4p/music-api`

```ts
declare function search(
  query: string | ISearchQuery,
  provider?: Provider | Provider[]
): Promise<ISearchItem[]>;

declare function getSong(id: string, provider: Provider, br?: BitRate): Promise<ISong>;

declare function rank(
  provider: Provider,
  rankType: RankType,
  limit?: number,
  skip?: number
): Promise<ISearchItem[]>;

async function playlist(provider: Provider, id: string): Promise<ISearchItem[]>;

async function album(provider: Provider, id: string): Promise<ISearchItem[]>;
```

**see [test](./tree/develop/test) folder to learn more**
