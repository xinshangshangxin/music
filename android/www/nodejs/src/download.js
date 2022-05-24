const config = require('./config');

const { createWriteStream, access, ensureDir, move, remove } = require('fs-extra');
const request = require('request');
const rp = require('request-promise');
const { resolve: pathResolve } = require('path');
const { pipeline: originPipeline } = require('stream');
const { promisify } = require('util');

const getDir = require('./save-dir');

const pipeline = promisify(originPipeline);

const cacheMap = {};

const awaitWrap = (promise) => {
  return promise.then((data) => [null, data]).catch((err) => [err, null]);
};

async function getDownloadUrl({ id, provider, br }) {
  const saveDir = await getDir();

  const tmpDir = pathResolve(saveDir, 'tmp');

  await ensureDir(tmpDir);

  const tempPath = pathResolve(tmpDir, `${id}-${provider}-${br}-${Date.now()}.tmp`);

  const realPath = pathResolve(saveDir, `${id}-${provider}-${br}.mp3`);

  return { tempPath, realPath };
}

async function getUrl(id, provider, br) {
  console.debug('==== start getUrl');
  let options = {
    method: 'POST',
    url: config.songUrl,
    body: {
      query: `
        query url($id:String!, $provider: Provider!, $br: BitRate) {
          url(id: $id, provider: $provider, br: $br)
        }
        `,
      variables: { id, provider, br },
    },
    json: true,
  };

  let {
    data: { url },
  } = await rp(options);

  return url;
}

function getCacheKey(id, provider, br) {
  return `${id}|${provider}|${br}`;
}

function defer() {
  let resolve, reject;
  let promise = new Promise((arg1, arg2) => {
    resolve = arg1;
    reject = arg2;
  });

  return {
    resolve,
    reject,
    promise,
  };
}

async function persist(id, provider, br, realPath, tempPath) {
  let cacheKey = getCacheKey(id, provider, br);

  if (cacheMap[cacheKey]) {
    return cacheMap[cacheKey].promise;
  }

  let deferred = defer();
  cacheMap[cacheKey] = deferred;

  // 获取最新url
  let url = await getUrl(id, provider, br);
  console.debug('url: ', url);

  if (!url) {
    deferred.reject(new Error('download error'));
  } else {
    let statusCode;

    try {
      await pipeline(
        request({ url }).on('response', (response) => {
          ({ statusCode } = response);
        }),
        createWriteStream(tempPath)
      );

      if (statusCode >= 300) {
        throw new Error(`download error, statusCode: ${statusCode}`);
      }

      await move(tempPath, realPath);
      deferred.resolve(realPath);
    } catch (e) {
      console.debug(e);
      remove(tempPath).catch(console.warn);
      deferred.reject(e);
    }
  }

  // 延迟删除
  setTimeout(() => {
    deferred = null;
    cacheMap[cacheKey] = null;
    delete cacheMap[cacheKey];

    console.info('cacheList Length: ', Object.keys(cacheMap).length);
  }, 0);

  return deferred.promise;
}

async function download({ id, provider, br }) {
  let { realPath, tempPath } = await getDownloadUrl({
    id,
    provider,
    br,
  });

  console.info('realPath: ', realPath);

  let [err] = await awaitWrap(access(realPath));

  if (err) {
    await persist(id, provider, br, realPath, tempPath);
  }

  return realPath;
}

module.exports = download;
