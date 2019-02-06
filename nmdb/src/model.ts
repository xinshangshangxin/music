import debugPkg from 'debug';
import * as inflected from 'inflected';
import * as _ from 'lodash';

const Query = require('./lib/query');

const debug = debugPkg('mongolass-model');

export class Model {
  _db: any;

  _schema: any;

  _name: any;

  _collName: any;

  _opts: any;

  _plugins: any;

  _coll: any;

  create: any;

  insert: any;

  index: any;

  ensureIndex: any;

  constructor(name: string, schema: any, db: any, opts: any = {}) {
    this._db = db;
    this._schema = schema;
    this._name = name;
    this._collName = opts.collName || inflected.pluralize(name).toLowerCase();
    this._opts = opts;
    this._plugins = {};

    Query.bindQuery(this, db.client.Collection);

    // alias
    this.create = this.insert;
    this.index = this.ensureIndex;

    _.defaults(this._plugins, this._db._plugins);
  }

  /**
   * get a collection
   */
  async connect() {
    if (this._coll) {
      return this._coll;
    }

    this._coll = await this._db.client.getCollection(this._collName);
    return this._coll;
  }

  /**
   * get/set another model
   */
  model(name: string, schema: any, opts: object) {
    return this._db.model(name, schema, opts);
  }

  /**
   * add model plugin
   */
  plugin(name: string, hooks: any) {
    if (!name || !hooks || !_.isString(name) || !_.isPlainObject(hooks)) {
      throw new TypeError('Wrong plugin name or hooks');
    }
    this._plugins[name] = {
      name,
      hooks,
    };
    debug(`Add ${this._name} plugin: ${name}`);
  }
}
