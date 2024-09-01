import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { Context } from 'koa';
import type { PathLike } from 'node-helper';

function getRange(fileSize: number, rangeHeader?: string) {
  const range = [0, fileSize];

  if (rangeHeader) {
    const rLoc = rangeHeader.indexOf('bytes=');
    if (rLoc >= 0) {
      const ranges = rangeHeader.substr(rLoc + 6).split('-');
      try {
        range[0] = Number.parseInt(ranges[0], 10);
        if (ranges[1] && ranges[1].length) {
          range[1] = Number.parseInt(ranges[1], 10);
          range[1] = range[1] < 16 ? 16 : range[1];
        }
      } catch {
      }
    }

    if (range[1] === fileSize) {
      range[1]--;
    }

    range[2] = fileSize;
  }

  return range;
}

async function audioPipe(
  ctx: Context,
  filePath: PathLike,
) {
  const { size } = await stat(filePath);

  const [start, end, len] = getRange(size, ctx.get('range'));
  console.info([start, end, len]);

  ctx.set({
    'Content-Type': 'audio/mpeg',
  });

  if (!len) {
    ctx.response.status = 200;
    ctx.set({
      'Content-Length': `${size}`,
    });
  } else {
    ctx.response.status = 206;
    ctx.set({
      'Content-Length': `${end - start + 1}`,
      'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${start}-${end}/${size}`,
    });
  }

  ctx.response.body = createReadStream(filePath, len ? { start, end } : undefined);
}

export { audioPipe };
