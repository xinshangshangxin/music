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

export interface IDeleteResult {
  n: number;
  ok: number;
  acknowledged?: boolean;
  deletedCount: number;
}

export interface IInsertResult {
  acknowledged?: boolean;
  _id: string; // ObjectId
}

export interface IInsertManyResult {
  acknowledged?: boolean;
  _id: string[]; // ObjectId
}

export interface IUpsertedResult {
  n: number;
  nModified: number;
  ok: number;
}

export class Collection {
  protected collection: any;

  constructor(originCollection: any) {
    this.collection = originCollection;
  }

  async countDocuments(query: object): Promise<number> {
    return this.collection.countDocuments(query);
  }

  async createIndex(fieldOrSpec: string | object, options?: IIndexOptions): Promise<void> {
    return this.collection.createIndex(fieldOrSpec, options);
  }

  async deleteMany(filter: object): Promise<IDeleteResult> {
    let result = await this.collection.deleteOne(filter);
    return { deletedCount: result.deleteMany, ...result.toJSON() };
  }

  async deleteOne(filter: object): Promise<IDeleteResult> {
    let result = await this.collection.deleteOne(filter);
    return result.toJSON();
  }

  // TODO: drop

  async dropIndex(indexName: string): Promise<void> {
    return this.collection.dropIndex(indexName);
  }

  // eslint-disable-next-line no-restricted-globals
  async find(query: object, options: IFindOptions): Promise<object[]> {
    let cursor = this.collection.find(query, options);
    return cursor.toArray();
  }

  async findOne(query: object, options: IFindOptions): Promise<object | null> {
    return this.collection.findOne(query, options);
  }

  // TODO:  indexes Retrieve all the indexes on the collection.

  async insertMany(docs: object[]): Promise<IInsertManyResult> {
    return this.collection.insertMany(docs);
  }

  async insertOne(doc: object): Promise<IInsertResult> {
    return this.collection.insertOne(doc);
  }

  async remove(selector: object, options = { single: false }): Promise<IDeleteResult> {
    return this.collection.remove(selector, options);
  }

  async updateMany(
    filter: object,
    document: object,
    options = { upsert: false }
  ): Promise<IUpsertedResult> {
    let result = await this.collection.updateMany(filter, document, options);
    return result.toJSON();
  }

  async updateOne(
    filter: object,
    document: object,
    options = { upsert: false }
  ): Promise<IUpsertedResult> {
    let result = await this.collection.updateOne(filter, document, options);
    return result.toJSON();
  }
}
