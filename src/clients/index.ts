function getClient(url: string, opts?: object) {
  if (/^nedb:\/\//.test(url)) {
    // eslint-disable-next-line global-require
    let { NedbClient } = require('./NedbClient');
    return new NedbClient(url, opts as { memory?: boolean });
  }
  // eslint-disable-next-line global-require
  let { MongodbClient } = require('./MongodbClient');
  return new MongodbClient(url, opts);
}

export { getClient };
