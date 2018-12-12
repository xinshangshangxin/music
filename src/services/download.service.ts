import { Injectable } from '@nestjs/common';
import { BitRate, Provider } from '@s4p/music-api';
import { createWriteStream } from 'fs';
import { access, ensureDir, move, remove } from 'fs-extra';
import * as got from 'got';
import { homedir } from 'os';
import { resolve as pathResolve } from 'path';

interface ISongKey {
  id: string;
  provider: Provider;
  br: BitRate;
}

interface IDownloadKet extends ISongKey {
  url: string;
}

@Injectable()
export class DownloadService {
  constructor() {}

  async download({ id, provider, br, url }: IDownloadKet) {
    let { realPath, tempPath } = await this.getDownloadUrl({
      id,
      provider,
      br,
    });

    console.info('realPath: ', realPath);
    try {
      await access(realPath);
      return;
    } catch (e) {
      console.warn(e);
    }

    let statusCode;

    got
      .stream(url)
      .on('response', response => {
        ({ statusCode } = response);
      })
      .on('error', (error, body, response) => {
        console.info(error, body, response);
        remove(tempPath).catch(console.warn);
      })
      .pipe(createWriteStream(tempPath))
      .on('finish', async () => {
        console.info('finished');
        if (statusCode >= 300) {
          remove(tempPath).catch(console.warn);
        } else {
          move(tempPath, realPath).catch(console.warn);
        }
      });
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
}
