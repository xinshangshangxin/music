import { createReadStream, PathLike, stat } from 'fs-extra';
import { ServerResponse } from 'http';
import { pipeline as originPipeline } from 'stream';
import { promisify } from 'util';

const pipeline = promisify(originPipeline);

function getRange(rangeHeader: string, fileSize: number) {
  let range = [0, fileSize];

  if (rangeHeader) {
    let rLoc = rangeHeader.indexOf('bytes=');
    if (rLoc >= 0) {
      let ranges = rangeHeader.substr(rLoc + 6).split('-');
      try {
        range[0] = parseInt(ranges[0], 10);
        if (ranges[1] && ranges[1].length) {
          range[1] = parseInt(ranges[1], 10);
          range[1] = range[1] < 16 ? 16 : range[1];
        }
      } catch (e) {}
    }

    if (range[1] === fileSize) {
      range[1]--;
    }

    range[2] = fileSize;
  }

  return range;
}

async function audioPipe(
  res: ServerResponse,
  filePath: PathLike,
  rangeHeader?: string,
) {
  let { size } = await stat(filePath);

  let [start, end, len] = getRange(rangeHeader, size);
  console.info([start, end, len]);

  if (!len) {
    start = undefined;
    end = undefined;

    res.statusCode = 200;
    res.setHeader('Content-Length', size);
  } else {
    res.statusCode = 206;
    res.setHeader('Content-Length', end - start + 1);

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
  }

  res.setHeader('Content-Type', 'audio/mpeg');

  await pipeline(createReadStream(filePath, { start, end }), res);
}

export { audioPipe };
