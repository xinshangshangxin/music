# music-api

## how to use

`npm install @s4p/music-api`

```ts
import { search, getSong } from '@s4p/music-api';

search({ keyword: 'gakki' })
  .then((data) => {
    console.info(JSON.stringify(data));
  })
  .catch(console.warn);

getSong('f3205f0ff2f4891a2c344086b74b6d6e', 'kugou')
  .then((data) => {
    console.info(JSON.stringify(data));
  })
  .catch(console.warn);
```
