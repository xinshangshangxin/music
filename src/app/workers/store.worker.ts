/// <reference lib="webworker" />
import { DBSchema, IDBPDatabase, IDBPObjectStore, openDB } from 'idb';

import { Action, awaitWrap, Defer, defer, RequestMessage } from './helper';

interface MusicDBSchema extends DBSchema {
  'music-structured': {
    key: string;
    value: object;
  };
}

const version = 1;
const dbName = 'music';

function openDBWithSchema(): Promise<IDBPDatabase<MusicDBSchema>> {
  return openDB<MusicDBSchema>(dbName, version, {
    upgrade(db) {
      db.createObjectStore('music-structured');
    },
  });
}

const getDb = (() => {
  let deferred: Defer<IDBPDatabase<MusicDBSchema>>;

  return async () => {
    if (deferred) {
      return deferred.promise;
    }
    deferred = defer();

    const [err, data] = await awaitWrap(openDBWithSchema());
    if (data) {
      deferred.resolve(data);
    } else {
      deferred.reject(err);
    }
    return deferred.promise;
  };
})();

async function getSongStore() {
  const db = await getDb();
  const tx = db.transaction(['music-structured'], 'readwrite');
  const store = tx.objectStore('music-structured');

  return store;
}

async function dealAction({
  store,
  action,
  key,
  value,
}: {
  store: IDBPObjectStore<MusicDBSchema, 'music-structured'[], 'music-structured'>;
  action: Action;
  key: string;
  value?: object;
}): Promise<any> {
  if (action === Action.put) {
    if (!value) {
      throw new Error('store put not set value');
    }
    return store.put(value, key);
  } else if (action === Action.get) {
    return store.get(key);
  } else if (action === Action.delete) {
    return store.delete(key);
  } else {
    throw new Error(`action:${action} not support`);
  }
}

addEventListener('message', async ({ data }: { data: RequestMessage & { uuid: string } }) => {
  console.info('worker request data: ', data);

  const { uuid } = data;

  if (!uuid) {
    console.warn('no uuid, ignore action', data);
    return;
  }

  const store = await getSongStore();

  const [err, result] = await awaitWrap(
    dealAction({
      store,
      ...data,
    })
  );

  let errorMessage: string | undefined;
  if (err) {
    console.warn(err, `set store failed`);
    errorMessage = err.message;
  }

  postMessage({
    uuid,
    result,
    errMsg: errorMessage,
  });
});
