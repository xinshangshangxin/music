import { homedir } from 'node:os';
import { resolve as pathResolve } from 'node:path';
import { pipeline as originPipeline } from 'node:stream';
import { promisify } from 'node:util';
import { createWriteStream } from 'node:fs';
import { Errors, defer, ensureDir, move, pathExists, remove } from 'node-helper';
import axios from 'axios';
import { type CandidateSong, getUrl } from '../../../../../music-url';

const pipeline = promisify(originPipeline);

class Downloader {
  private cacheMap: any = {};

  constructor(
  ) {}

  async download(songKey: CandidateSong): Promise<string> {
    const { realPath, tempPath } = await this.getDownloadUrl(songKey);

    const isExists = await pathExists(realPath);

    if (!isExists) {
      await this.persist(songKey, realPath, tempPath);
    }

    return realPath;
  }

  async getDownloadUrl(songKey: CandidateSong) {
    const saveDir = pathResolve(homedir(), '.music');

    const tmpDir = pathResolve(saveDir, 'tmp');

    await ensureDir(tmpDir);

    const tempPath = pathResolve(
      tmpDir,
      `${this.toKeyString(songKey)}-${Date.now()}.tmp`,
    );

    const realPath = pathResolve(saveDir, `${this.toKeyString(songKey)}.mp3`);

    return { tempPath, realPath };
  }

  private toKeyString(songKey: CandidateSong) {
    return `${songKey.name}-${songKey.artist}-${songKey.albumName}`;
  }

  private async persist(songKey: CandidateSong, realPath: string, tempPath: string) {
    const cacheKey = this.toKeyString(songKey);

    if (this.cacheMap[cacheKey]) {
      return this.cacheMap[cacheKey].promise;
    }

    const deferred = defer();
    this.cacheMap[cacheKey] = deferred;

    // 获取最新url
    const url = await getUrl(songKey);

    if (!url) {
      deferred.reject(new Errors.DownloadFailed(songKey));
    } else {
      try {
        const res = await axios({
          method: 'get',
          url,
          responseType: 'stream',
        });

        await pipeline(
          res.data,
          createWriteStream(tempPath),
        );

        if (res.status >= 300) {
          throw new Errors.DownloadFailed({ status: res.status });
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

const downloader = new Downloader();

export { downloader };
