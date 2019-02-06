# music frontend

## online demo

[https://music.xinshangshangxin.com/](https://music.xinshangshangxin.com/)

![main](./data/main.png)
![peak](./data/peak.png)
![search](./data/search.png)
![playlist](./data/playlist.png)

## Usage

```bash
# use node with yarn
yarn
yarn start

# or use node with npm
npm i
npm start
```

## peak play

use [`AudioBuffer`](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) to get peak time, then play the peak range

## Technical details

- framework is [angular 6](https://github.com/angular/angular)
- style is [Material Design for Angular](https://github.com/angular/material2)
- peak play use [`AudioBuffer`](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer)
