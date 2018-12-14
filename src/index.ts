import debugPkg from 'debug';
import * as _ from 'lodash';
import * as plugins from 'mongolass/lib/plugins';
import { Schema } from 'mongolass/lib/schema';

import { getClient } from './clients';
import {
  IFindOptions,
  IIndexOptions,
  IInsertManyResult,
  IInsertResult,
  IUpsertedResult,
  IDeleteResult,
} from './clients/Collection';
import { Model } from './model';

const debug = debugPkg('Nmdb');

interface IModel {
  countDocuments(query: object): Promise<number>;

  createIndex(fieldOrSpec: string | object, options?: IIndexOptions): Promise<void>;

  deleteMany(filter: object): Promise<IDeleteResult>;

  deleteOne(filter: object): Promise<IDeleteResult>;

  dropIndex(indexName: string): Promise<void>;

  // eslint-disable-next-line no-restricted-globals
  find(query: object, options?: IFindOptions): Promise<any[]>;

  findOne(query: object, options?: IFindOptions): Promise<any | null>;

  insertMany(docs: object[]): Promise<IInsertManyResult>;

  insertOne(doc: object): Promise<IInsertResult>;

  remove(selector: object, options?: { single: boolean }): Promise<IDeleteResult>;

  updateMany(
    filter: object,
    document: object,
    options?: { upsert: boolean }
  ): Promise<IUpsertedResult>;

  updateOne(
    filter: object,
    document: object,
    options?: { upsert: boolean }
  ): Promise<IUpsertedResult>;
}

export default class Nmdb {
  private _plugins: any;

  private _schemas: any;

  private _url: string = '';

  private _models: any;

  private client: any;

  constructor(url?: string, options?: object) {
    this._plugins = {};
    this._schemas = {};
    this._models = {};

    if (url) {
      this._url = url;
      this.client = getClient(url, options);
    }

    Object.keys(plugins).forEach((name) => {
      this.plugin(name, plugins[name]);
    });
  }

  /**
   * connect mongodb
   */
  async connect(url: string, opts?: object) {
    if (url) {
      if (this.client) {
        throw new Error('url had init');
      }

      this._url = url;
      this.client = getClient(this._url, opts);
    }

    return this.client.connect(
      url,
      opts
    );
  }

  /**
   * disconnect mongodb
   */
  async disconnect() {
    return this.client.disconnect();
  }

  async close() {
    return this.disconnect();
  }

  /**
   * get/set collection schema
   */
  schema(name: string, schemaJSON: any) {
    if (!name || !_.isString(name)) {
      throw new TypeError('Missing schema name');
    }
    if (schemaJSON) {
      if (typeof schemaJSON !== 'object') throw new TypeError(`Wrong schemaJSON for schema: ${name}`);
      this._schemas[name] = new Schema(name, schemaJSON);
    }
    if (!this._schemas[name]) {
      throw new TypeError(`No schema: ${name}`);
    }

    return this._schemas[name];
  }

  /**
   * get/set collection model
   */
  model(name: string, schema?: any, opts?: object): IModel {
    if (!name || !_.isString(name)) {
      throw new TypeError('Missing model name');
    }
    if (schema) {
      if (!(schema instanceof Schema)) {
        // eslint-disable-next-line no-param-reassign
        schema = this.schema(`${name}Schema`, schema);
      }
      this._models[name] = new Model(name, schema, this, opts);
    } else {
      this._models[name] = this._models[name] || new Model(name, null, this, opts);
    }

    return this._models[name];
  }

  /**
   * add global plugin
   */
  plugin(name: string, hooks: any) {
    if (!name || !hooks || !_.isString(name) || !_.isPlainObject(hooks)) {
      throw new TypeError('Wrong plugin name or hooks');
    }
    this._plugins[name] = {
      name,
      hooks,
    };

    Object.keys(this._models).forEach((model) => {
      _.defaults(this._models[model]._plugins, this._plugins);
    });

    debug(`Add global plugin: ${name}`);
  }
}

export {
  Nmdb, Schema, Model, IModel
};
