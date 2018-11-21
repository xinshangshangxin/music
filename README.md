# music-api

## how to use

**see [test](https://github.com/xinshangshangxin/music/tree/api/test) folder to learn more**

`npm install @s4p/music-api`

```ts
declare function search(query: string | ISearchQuery, provider?: Provider | Provider[]): Promise<ISearchItem[]>;

declare function getSong(id: string, provider: Provider, br?: BitRate): Promise<ISong>;

declare function rank(provider: Provider, rankType: RankType, limit?: number, skip?: number): Promise<ISearchItem[]>;
```
