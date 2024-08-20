import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

async function readDirDeep(dir: string, depth = 1): Promise<string[]> {
  const files = await readdir(dir);

  const fileDirList = [];
  for (const file of files) {
    const p = resolve(dir, file);
    const stats = await stat(p);

    if (stats.isFile()) {
      fileDirList.push(p);
    } else if (stats.isDirectory() && depth > 1) {
      const depthList = await readDirDeep(p, depth - 1);
      fileDirList.push(...depthList);
    }
  }

  return fileDirList;
}

export { readDirDeep };
