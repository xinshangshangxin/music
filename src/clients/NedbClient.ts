import bb from 'bluebird';
import debugPkg from 'debug';
// eslint-disable-next-line import/no-extraneous-dependencies
import Datastore from 'nedb';
import { join as pathJoin } from 'path';

import { Collection, IFindOptions, IIndexOptions } from './Collection';

const debug = debugPkg('NedbClient');

interface INedbOpts {
  memory?: boolean;
}

function urlToPath(url: string) {
  if (url.indexOf('nedb://') > -1) {
    return url.slice(7, url.length);
  }
  return url;
}

function getCollectionPath(dbLocation: string, collectionName: string) {
  if (dbLocation === 'memory') {
    return dbLocation;
  }
  return `${pathJoin(dbLocation, collectionName)}.db`;
}

async function createOriginCollection(collectionName: string, dbDir: string, opts: INedbOpts = {}) {
  let db: any;
  if (dbDir === 'memory') {
    db = new Datastore({ inMemoryOnly: true });
  } else if (opts.memory) {
    db = new Datastore({ inMemoryOnly: true });
  } else {
    let collectionPath = getCollectionPath(dbDir, collectionName);
    db = new Datastore({ filename: collectionPath });
  }

  return new Promise((resolve, reject) => {
    db.loadDatabase((err: Error) => {
      if (err) {
        return reject(err);
      }
      return resolve(db);
    });
  });
}

class NedbCollection extends Collection {
  countDocuments(query: object) {
    return bb.promisify<null, object>(this.collection.count, { context: this.collection })(query);
  }

  async createIndex(
    fieldOrSpec: string | object,
    { unique, expireAfterSeconds } = {} as IIndexOptions
  ) {
    let nedbIndexOptions;
    if (typeof fieldOrSpec === 'string') {
      nedbIndexOptions = {
        fieldName: fieldOrSpec,
        unique,
        expireAfterSeconds,
      };
    } else {
      let keys = Object.keys(fieldOrSpec);
      if (keys.length > 1) {
        throw new TypeError('nedb index support only one field');
      }
      nedbIndexOptions = {
        fieldName: keys[0],
        unique,
        expireAfterSeconds,
      };
    }

    await bb.promisify<null, object>(this.collection.ensureIndex, { context: this.collection })(
      nedbIndexOptions
    );

    return { result: {} };
  }

  async deleteMany(filter: object) {
    await bb.promisify<null, object, object>(this.collection.remove, { context: this.collection })(
      filter,
      { multi: true }
    );

    return { result: {} };
  }

  async deleteOne(filter: object) {
    await bb.promisify<null, object, object>(this.collection.remove, { context: this.collection })(
      filter,
      { multi: false }
    );

    return { result: {} };
  }

  async dropIndex(indexName: string) {
    await bb.promisify<null, string>(this.collection.removeIndex, { context: this.collection })(
      indexName
    );
    return { result: {} };
  }

  find(query: object, {
    sort, skip, limit, projection,
  } = {} as IFindOptions) {
    let cursor = this.collection.find(query, projection);

    if (sort) {
      cursor = cursor.sort(sort);
    }

    if (skip) {
      cursor = cursor.skip(skip);
    }

    if (limit) {
      cursor = cursor.limit(limit);
    }

    return bb.promisify(cursor.exec, { context: cursor })();
  }

  findOne(query: object, {
    sort, skip, limit, projection,
  } = {} as IFindOptions) {
    let cursor = this.collection.findOne(query, projection);

    if (sort) {
      cursor = cursor.sort(sort);
    }

    if (skip) {
      cursor = cursor.skip(skip);
    }

    if (limit) {
      cursor = cursor.limit(limit);
    }

    return bb.promisify(cursor.exec, { context: cursor })();
  }

  insertMany(docs: object[]) {
    return Promise.all(
      docs.map((doc) => {
        return this.insertOne(doc);
      })
    );
  }

  async insertOne(doc: object) {
    await bb.promisify<null, any>(this.collection.insert, { context: this.collection })(doc);

    return {
      result: {
        ok: true,
      },
    };
  }

  async remove(selector: object, { single } = { single: false }) {
    await bb.promisify<null, object, object>(this.collection.remove, { context: this.collection })(
      selector,
      {
        multi: !single,
      }
    );

    return { result: {} };
  }

  async updateMany(filter: object, document: object, { upsert } = { upsert: false }) {
    await bb.promisify<null, object, object, object>(this.collection.update, {
      context: this.collection,
    })(filter, document, { multi: true, upsert });

    return { result: {} };
  }

  async updateOne(filter: object, document: object, { upsert } = { upsert: false }) {
    await bb.promisify<null, object, object, object>(this.collection.update, {
      context: this.collection,
    })(filter, document, { multi: false, upsert });

    return { result: {} };
  }
}

export class NedbClient {
  Collection = NedbCollection;

  private opts: any;

  private dbDir: any;

  private collections: any = {};

  constructor(url: string, opts: INedbOpts) {
    this.opts = opts;
    this.dbDir = urlToPath(url);
  }

  // eslint-disable-next-line class-methods-use-this
  async connect() {
    debug('connect called');
  }

  // eslint-disable-next-line class-methods-use-this
  async disconnect() {
    debug('disconnect called');
  }

  async getCollection(name: string) {
    if (this.collections[name]) {
      return this.collections[name];
    }

    let originCollection = await createOriginCollection(name, this.dbDir, this.opts);
    let collection = new NedbCollection(originCollection);

    this.collections[name] = collection;
    return collection;
  }
}
