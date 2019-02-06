// eslint-disable-next-line import/no-extraneous-dependencies
import * as mongodb from 'mongodb';
import assign from 'lodash/assign';
import muri from 'muri';
import { Collection } from './Collection';

export class MongodbClient {
  Collection = Collection;

  private url: string;

  private opts: any;

  private client: any;

  private collections: any = {};

  constructor(url: string, opts?: object) {
    this.url = url;
    this.opts = opts;
  }

  async connect() {
    if (this.client) {
      return this.client;
    }

    this.client = await mongodb.MongoClient.connect(
      this.url,
      assign({ useNewUrlParser: true }, this.opts)
    );

    return this.client;
  }

  async disconnect() {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
  }

  async getCollection(name: string, opts: any) {
    if (this.collections[name]) {
      return this.collections[name];
    }

    let client = await this.connect();
    let originCollection = client.db(muri(this.url).db).collection(name, opts);
    let collection = new Collection(originCollection);

    this.collections[name] = collection;
    return collection;
  }
}
