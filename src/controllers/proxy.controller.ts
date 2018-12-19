import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { BitRate, Provider } from '@s4p/music-api';
import { access } from 'fs-extra';
import * as ms from 'mediaserver';

import { DownloadService } from '../song/download.service';

@Controller('proxy')
export class ProxyController {
  constructor(private downloadService: DownloadService) {}

  @Get()
  async pipe(
    @Req() req,
    @Res() res,
    @Query('id') id: string,
    @Query('provider') provider: Provider,
    @Query('br') br = BitRate.mid,
  ) {
    console.info({ id, provider, br });

    let { realPath } = await this.downloadService.getDownloadUrl({
      id,
      provider,
      br,
    });

    console.info('realPath: ', realPath);

    // 已经下载过
    try {
      await access(realPath);

      console.info('first ms pipe');
      ms.pipe(
        req,
        res,
        realPath,
      );
      return;
    } catch (e) {}

    // 没有下载过, 再次下载
    await this.downloadService.download({ id, provider, br });

    // 再次尝试获取
    try {
      await access(realPath);

      console.info('second ms pipe');
      ms.pipe(
        req,
        res,
        realPath,
      );
      return;
    } catch (e) {
      console.warn(e);
      res.writeHeader(400);
      res.end();
    }
  }
}
