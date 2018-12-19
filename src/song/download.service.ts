import { Injectable } from '@nestjs/common';
import { BitRate, Provider } from '@s4p/music-api';
import { createWriteStream } from 'fs';
import { access, ensureDir, move, remove } from 'fs-extra';
import * as got from 'got';
import { homedir } from 'os';
import { resolve as pathResolve } from 'path';

import { SongService } from '../song/song.service';

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

@Injectable()
export class DownloadService {
  private cacheMap: any = {};

  constructor(private songService: SongService) {}

  async download({ id, provider, br }: ISongKey): Promise<string> {
    let { realPath, tempPath } = await this.getDownloadUrl({
      id,
      provider,
      br,
    });

    console.info('realPath: ', realPath);
    try {
      await access(realPath);
      return realPath;
    } catch (e) {
      console.warn(e);
    }

    await this.persist(id, provider, br, realPath, tempPath);
    return realPath;
  }

  async getDownloadUrl({ id, provider, br }: ISongKey) {
    const saveDir = pathResolve(homedir(), '.music');
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
    let url = await this.songService.getUrl(id, provider, br);
    console.debug('url: ', url);

    if (!url) {
      deferred.reject(new Error('download error'));
    } else {
      new Promise((resolve, reject) => {
        let statusCode;

        got
          .stream(url)
          .on('response', response => {
            ({ statusCode } = response);
          })
          .on('error', (error, body, response) => {
            console.debug(error, body, response);
            remove(tempPath).catch(console.warn);
          })
          .pipe(createWriteStream(tempPath))
          .on('finish', async () => {
            console.debug('finished');
            if (statusCode >= 300) {
              remove(tempPath).catch(console.warn);

              reject(new Error(`download error, statusCode: ${statusCode}`));
              return;
            }

            move(tempPath, realPath)
              .then(() => {
                resolve(realPath);
              })
              .catch(reject);
          });
      })
        .then(() => {
          deferred.resolve();
        })
        .catch(e => {
          deferred.reject(e);
        });
    }

    // 延迟删除
    setTimeout(() => {
      delete this.cacheMap[cacheKey];
    }, 0);

    return deferred.promise;
  }
}
