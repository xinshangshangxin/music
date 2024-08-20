import { SubsetMongo } from '@s4p/smdb';
import DataStore from '@s4p/nedb';

import { objectify, unique } from 'radash';
import { env } from '@/env';

const smdb = new SubsetMongo(DataStore);
smdb.connect(env.DATABASE_URL, { timestamp: true });

interface PopulateParams<T> {
  list?: T[];
  from: string;
  localField: string;
  as?: string;
  projection?: Record<string, boolean>;
}

async function populate<T extends Record<string, any>>({
  list = [],
  from,
  localField,
  as = from,
  projection,
}: PopulateParams<T>) {
  const idList = unique(
    list
      .map((item) => {
        return item[localField];
      })
      .flat(),
  ).filter((v) => {
    return !!v;
  });

  if (!idList) {
    return list;
  }

  const where = {
    _id: {
      $in: idList,
    },
  };

  const data = await smdb.collection(from).find(where, projection);

  const keyById = objectify(data, f => f.name);

  return list.map((item) => {
    const keyOrKeys = item[localField];

    if (Array.isArray(keyOrKeys)) {
      const list = keyOrKeys.map((v) => {
        return keyById[v];
      });

      return {
        ...item,
        [as]: list,
      };
    }

    return {
      ...item,
      [as]: keyById[keyOrKeys],
    };
  });
}

export { smdb, populate };
export type { PopulateParams };
