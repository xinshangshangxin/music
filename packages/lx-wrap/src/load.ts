import { readDirDeep } from 'node-helper';
import { tryit } from 'radash';
import { type Source, loadLxSource } from './vm';

function getValidSources(list: ([Error, undefined] | [undefined, Source])[]): [string, Source['getUrl']][] {
  const arr = list.map(([err, item]) => {
    if (err || !item) {
      return undefined;
    }
    const { name, getUrl } = item;
    return [name, getUrl];
  }).filter((v): v is NonNullable<typeof v> => {
    return !!v;
  });

  return arr as any;
}

async function load(dir: string) {
  const files = await readDirDeep(dir, 1);
  const fn = tryit(loadLxSource);

  const list = await Promise.all(
    files.map((file) => {
      return fn(file);
    }),
  );

  return getValidSources(list);
}

export { load };
