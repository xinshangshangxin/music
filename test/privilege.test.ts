import test from 'ava';

import { getSong, Provider, search } from '../src';
import { Privilege } from '../src/common/privilege';

type CheckInfo =
  | {
    provider: Provider;
    keyword: string;
    id?: undefined;
  }
  | {
    provider: Provider;
    id: string;
    keyword?: undefined;
  };

let testCaseMap = {
  [Privilege.allow]: [
    {
      provider: Provider.kugou,
      keyword: 'Aragaki Yui',
    },
    {
      provider: Provider.kugou,
      id: 'f3205f0ff2f4891a2c344086b74b6d6e',
    },

    {
      provider: Provider.netease,
      keyword: 'Aragaki Yui',
    },
    {
      provider: Provider.netease,
      id: '29829683',
    },

    {
      provider: Provider.xiami,
      keyword: 'Aragaki Yui',
    },
    {
      provider: Provider.xiami,
      id: 'mQ3vjR95254',
    },
  ],
  [Privilege.audition]: [
    {
      provider: Provider.kugou,
      keyword: '圆 AGA',
    },
    {
      provider: Provider.kugou,
      id: '504D039E327F73E64C32A77E9FE5722C',
    },
  ],
  [Privilege.deny]: [
    {
      provider: Provider.kugou,
      keyword: '弦子 第三者的第三者 不爱最大',
    },
    {
      provider: Provider.kugou,
      id: '41AC5854B48A8BFBE3DC43C1C414A464',
    },

    {
      provider: Provider.netease,
      keyword: '告白气球 周杰伦的床边故事 ',
    },
    {
      provider: Provider.netease,
      id: '418603077',
    },

    {
      provider: Provider.xiami,
      keyword: '告白气球 周杰伦的床边故事 ',
    },
    {
      provider: Provider.xiami,
      id: 'mQX8iP8fbe8',
    },
  ],
};

async function getPrivilege({ provider, keyword, id }: CheckInfo) {
  if (keyword) {
    let [song] = await search(keyword, provider);
    return song.privilege;
  }

  if (id) {
    let song = await getSong(id, provider);
    return song.privilege;
  }

  throw new Error('no keyword or id found');
}

test('test privilege', async (t) => {
  await Promise.all(
    Object.keys(testCaseMap).map((key) => {
      let arr = testCaseMap[key as keyof typeof testCaseMap];
      return Promise.all(
        arr.map(async (item) => {
          let privilege = await getPrivilege(item);
          t.is(key, privilege, `privilege: ${privilege}, check: ${JSON.stringify(item)}`);
        })
      );
    })
  );
});
