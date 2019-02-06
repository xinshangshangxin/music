# music backend

## Usage

```bash
# use node with yarn
yarn
yarn start

# or use node with npm
npm i
npm start

# or use docker
docker build -t music-backend .
docker run --env=NMDB_URL="nedb://memory" --env=PORT=80 -p 3000:80 music-backend
```

> if you don't have mongodb, you can change `mongodb://localhost/music-backend` to `nedb://memory` under `src/config/development.js`  
> or use `ENV config` `NMDB_URL=nedb://memory npm start`, this means use memory to storage song info.  
> more info about `nmdb` to check repository [`@s4p/nmdb`](https://github.com/shang-music/nmdb.git)

then open [`http://localhost:3000/graphql`](http://localhost:3000/graphql)  
or use next curls

- search

```bash
curl 'http://localhost:3000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:3000' --data-binary '{"query":"query($keyword: String!, $providers: [Provider]) {\n  search(keyword: $keyword, providers: $providers) {\n    id\n    name\n    provider\n    artists {\n      name\n    }\n    album {\n      name\n    }\n  }\n}\n","variables":{"keyword":"田馥甄","providers":["kugou"]}}'
```

- get

```bash
curl 'http://localhost:3000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:3000' --data-binary '{"query":"query($id: ID!, $provider: Provider!, $br: BitRate) {\n  get(id: $id, provider: $provider, br: $br) {\n    provider\n    id\n    name\n    lrc\n    klyric\n    artists {\n      id\n      name\n    }\n    album {\n      name\n      img\n    }\n  }\n}\n","variables":{"id":"0de83c11190b47251b14e3494ee2f842","provider":"kugou","br":"mid"}}'
```

- rank

```bash
curl 'http://localhost:3000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:3000' --data-binary '{"query":"query($provider: Provider!, $rankType: RankType) {\n  rank(provider: $provider, rankType: $rankType) {\n    id\n    name\n    provider\n    artists {\n      name\n    }\n  }\n}\n","variables":{"provider":"xiami","rankType":"new"}}'
```

- url

```bash
curl 'http://localhost:3000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:3000' --data-binary '{"query":"query($id: ID!, $provider: Provider!, $br: BitRate) {\n  url(id: $id, provider: $provider, br: $br)\n}\n","variables":{"id":"504D039E327F73E64C32A77E9FE5722C","provider":"kugou","br":"mid"}}'
```

## Technical details

- framework is [nestjs](https://github.com/nestjs/nest)

- [`kugou/netease/xiami` music-api](https://github.com/shang-music/api)

- storage is [`@s4p/nmdb`](https://github.com/shang-music/nmdb.git)
