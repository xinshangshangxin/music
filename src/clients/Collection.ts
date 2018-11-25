export interface IIndexOptions {
  unique?: boolean;
  expireAfterSeconds?: number;
}

export interface IFindOptions {
  sort?: object;
  skip?: number;
  limit?: number;
  projection?: object;
}

export interface IUpdateOptions {
  multi?: boolean;
  upsert: boolean;
}

export class Collection {
  protected collection: any;

  constructor(originCollection: any) {
    this.collection = originCollection;
  }

  countDocuments(query: object) {
    return this.collection.countDocuments(query);
  }

  createIndex(fieldOrSpec: string | object, options?: IIndexOptions) {
    return this.collection.createIndex(fieldOrSpec, options);
  }

  deleteMany(filter: object) {
    return this.collection.deleteOne(filter);
  }

  deleteOne(filter: object) {
    return this.collection.deleteOne(filter);
  }

  // TODO: drop

  dropIndex(indexName: string) {
    return this.collection.dropIndex(indexName);
  }

  // eslint-disable-next-line no-restricted-globals
  find(query: object, options: IFindOptions) {
    return this.collection.find(query, options);
  }

  findOne(query: object, options: IFindOptions) {
    return this.collection.findOne(query, options);
  }

  // TODO:  indexes Retrieve all the indexes on the collection.

  insertMany(docs: object[]) {
    return this.collection.insertMany(docs);
  }

  insertOne(doc: object) {
    return this.collection.insertOne(doc);
  }

  remove(selector: object, options = { single: false }) {
    return this.collection.remove(selector, options);
  }

  updateMany(filter: object, document: object, options = { upsert: false }) {
    return this.collection.updateMany(filter, document, options);
  }

  updateOne(filter: object, document: object, options = { upsert: false }) {
    return this.collection.updateOne(filter, document, options);
  }
}
