# music-api

## how to use

```ts
enum Provider {
  kugou = 'kugou',
  netease = 'netease',
  xiami = 'xiami',
}

function search(
  query: string | { keyword: string; skip?: number; limit?: number },
  provider?: Provider | Provider[]
): Promise<ISearchItem[]>;

function getSong(id: string, provider: Provider): Promise<ISong>;
```
