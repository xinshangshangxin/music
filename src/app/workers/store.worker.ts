/// <reference lib="webworker" />
import { DBSchema, IDBPDatabase, openDB } from 'idb';

import { Action, awaitWrap, Defer, defer, Message } from './helper';

interface MusicDBSchema extends DBSchema {
  'song-list': {
    key: string;
    value: object[];
  };
}

const version = 1;
const dbName = 'music';

function openDBWithSchema(): Promise<IDBPDatabase<MusicDBSchema>> {
  return openDB<MusicDBSchema>(dbName, version, {
    upgrade(db) {
      db.createObjectStore('song-list');
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
  const tx = db.transaction(['song-list'], 'readwrite');
  const store = tx.objectStore('song-list');

  return store;
}

addEventListener('message', async ({ data }: { data: Message }) => {
  const { action, key, value, uuid } = data;
  console.info('workerReceived...', data);
  const store = await getSongStore();
  if (action === Action.get) {
    const [err, result] = await awaitWrap(store[action](key));
    if (err) {
      console.warn(err, data);
    }
    postMessage({ action, key, result, uuid });
  } else if (action === Action.put) {
    const [err, result] = await awaitWrap(store.put(value, key));
    if (err) {
      console.warn(err, data);
    }
    postMessage({ action, key, result, uuid });
  }
});
