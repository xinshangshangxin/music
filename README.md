# Music Player

[在线试用](https://music.xinshangshangxin.com/)

## 目录说明

### [api](./api)

支持 酷狗/网易/虾米 音乐获取

[![npm](https://img.shields.io/npm/v/@s4p/music-api.svg?label=%40s4p%2Fmusic-api&style=flat-square)](https://www.npmjs.com/package/@s4p/music-api)
![build](https://gitlab.com/shang-music/music-api/badges/develop/build.svg)
![coverage](https://gitlab.com/shang-music/music-api/badges/develop/coverage.svg)

### [backend](./backend)

基于 `nestjs` 调用 `@s4p/music-api` 提供 `graphql` 接口的后台服务

### [frontend](./frontend)

基于 `Angular 6` 提供简易的界面

### [proxy](./proxy)

提供跨域歌曲 URL

### [nmdb](./nmdb)

提供 [mongodb](https://github.com/mongodb/mongo) 和 [nedb](https://github.com/louischatriot/nedb) 以相似接口

### [devops](./devops)

`docker-compose` 启动/构建脚本

## 界面说明

![main](./frontend/data/main.png)
![peak](./frontend/data/peak.png)
![search](./frontend/data/search.png)
![playlist](./frontend/data/playlist.png)

## Quickstart

### 内存存储

```bash
docker-compose -f devops/data/docker-compose-build-memory.yml build
docker-compose -f devops/data/docker-compose-build-memory.yml up
```

访问 [http://localhost:8000](http://localhost:8000)

### mongodb 存储

```bash
docker-compose -f devops/data/docker-compose-build-mongo build
docker-compose -f devops/data/docker-compose-build-mongo up
```

访问 [http://localhost:8000](http://localhost:8000)

### 变量说明

```yaml
environment:
  # 运行环境配置, 请勿变动
  - NODE_ENV=docker
  # docker 内部端口
  - PORT=80
  # 歌曲缓存路径, 此处为docker容器内部路径
  - SAVE_DIR=/app/.music
  # mongodb 或者 nedb url
  - NMDB_URL=${NMDB_URL}
volumes:
  # 将 歌曲缓存映射到宿主机路径
  - ./data/.music:/app/.music
ports:
  # 容器端口映射到宿主机
  - '8000:80'
```

## Q&A

### `docker-compose` 中只用到了 `frontend` 和 `backend` 项目, 其它都没有用到

- `proxy` 项目的相关功能在 `backend` 项目中已经存在了, 独立成 `proxy` 项目是因为 [在线试用 demo](https://music.xinshangshangxin.com/) 部署在 [leancloud](https://leancloud.cn/) 上, 由于 `leancloud` 有内存限制(256M), 所以独立了一个 `proxy` 项目来突破内存限制. 而 `docker-compose` 启动不存在内存限制问题,故不需要部署 `proxy` 项目
- `api` 项目是一个 `npm` 包, 独立发布到 [![npm](https://img.shields.io/npm/v/@s4p/music-api.svg?label=%40s4p%2Fmusic-api&style=flat-square)](https://www.npmjs.com/package/@s4p/music-api), 已经在 `backend` 项目的 `package.json` 的依赖中了
- `nmdb` 项目是一个 `npm` 包, 独立发布到 [![npm](https://img.shields.io/npm/v/@s4p/nmdb.svg?label=%40s4p%2Fnmdb&style=flat-square)](https://www.npmjs.com/package/@s4p/nmdb)
  [![npm](https://img.shields.io/npm/v/@s4p/nest-nmdb.svg?label=%40s4p%2Fnest-nmdb&style=flat-square)](https://www.npmjs.com/package/@s4p/nest-nmdb), 已经在 `backend` 项目的 `package.json` 的依赖中了
- `devops` 目录是一些启动/构建脚本

## TODO

- [ ] 歌曲进度调整
- [ ] 歌词显示
- [x] 完整 `docker` 镜像 build
- [ ] 完善桌面浏览器下界面样式
- [ ] `Electron` 构建桌面应用
- [ ] 音量调整
- [ ] 设置界面, 添加渐近渐出, 排行榜隐藏等配置
