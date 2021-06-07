import { Injectable } from '@nestjs/common';
import { BitRate, Provider } from '@s4p/music-api';
import { createWriteStream } from 'fs';
import { access, ensureDir, move, remove } from 'fs-extra';
import { homedir } from 'os';
import { resolve as pathResolve } from 'path';
import request from 'request';
import { pipeline as originPipeline } from 'stream';
import { promisify } from 'util';
import { MusicApiService } from '../song/music-api.service';


const pipeline = promisify(originPipeline);

interface ISongKey {
  id: string;
  provider: Provider;
  br?: BitRate;
}

function defer() {
  let resolve, reject;
  let promise = new Promise((arg1, arg2) => {
    resolve = arg1;
    reject = arg2;
  });

  return {
    resolve,
    reject,
    promise,
  };
}

function awaitWrap<T, U = any>(
  promise: Promise<T>,
): Promise<[U | null, T | null]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, null]>(err => [err, null]);
}

@Injectable()
export class DownloadService {
  private cacheMap: any = {};

  constructor(
    private readonly musicApiService: MusicApiService,
  ) {}

  async download({ id, provider, br }: ISongKey): Promise<string> {
    let { realPath, tempPath } = await this.getDownloadUrl({
      id,
      provider,
      br,
    });

    let [err] = await awaitWrap(access(realPath));

    if (err) {
      await this.persist(id, provider, br, realPath, tempPath);
    }

    return realPath;
  }

  async getDownloadUrl({ id, provider, br }: ISongKey) {
    const saveDir =pathResolve(homedir(), '.music');

    const tmpDir = pathResolve(saveDir, 'tmp');

    await ensureDir(tmpDir);

    const tempPath = pathResolve(
      tmpDir,
      `${id}-${provider}-${br}-${Date.now()}.tmp`,
    );

    const realPath = pathResolve(saveDir, `${id}-${provider}-${br}.mp3`);

    return { tempPath, realPath };
  }

  private getCacheKey(id, provider, br) {
    return `${id}|${provider}|${br}`;
  }

  private async persist(id, provider, br, realPath: string, tempPath: string) {
    let cacheKey = this.getCacheKey(id, provider, br);

    if (this.cacheMap[cacheKey]) {
      return this.cacheMap[cacheKey].promise;
    }

    let deferred = defer();
    this.cacheMap[cacheKey] = deferred;

    // 获取最新url
    let url = await this.musicApiService.getUrl(id, provider, br);
    console.debug('url: ', url);

    if (!url) {
      deferred.reject(new Error('download error'));
    } else {
      let statusCode;

      try {
        await pipeline(
          // @ts-ignore
          request({ url }).on('response', response => {
            ({ statusCode } = response);
          }),
          createWriteStream(tempPath),
        );

        if (statusCode >= 300) {
          throw new Error(`download error, statusCode: ${statusCode}`);
        }

        await move(tempPath, realPath);
        deferred.resolve(realPath);
      } catch (e) {
        console.debug(e);
        remove(tempPath).catch(console.warn);
        deferred.reject(e);
      }
    }

    // 延迟删除
    setTimeout(() => {
      this.cacheMap[cacheKey] = null;
      delete this.cacheMap[cacheKey];

      console.info(Object.keys(this.cacheMap));
    }, 0);

    return deferred.promise;
  }
}