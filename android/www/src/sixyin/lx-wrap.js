const zlib = require("zlib");
const needle = require("needle");
const fs = require("fs");
const {
  createCipheriv,
  publicEncrypt,
  constants,
  randomBytes,
  createHash,
} = require("crypto");

function defer() {
  let resolve;
  let reject;

  const promise = new Promise((rs, rj) => {
    resolve = rs;
    reject = rj;
  });

  return { promise, resolve: resolve, reject: reject };
}

function parseScript(filePath) {
  const scriptContent = fs.readFileSync(filePath, "utf-8");
  const name = (scriptContent.match(/@name\s*([^\n]+)/) || [])[1];
  const description = (scriptContent.match(/@description\s*([^\n]+)/) || [])[1];
  const author = (scriptContent.match(/@author\s*([^\n]+)/) || [])[1];
  const version = (scriptContent.match(/@version\s*([^\n]+)/) || [])[1];
  const homepage = (scriptContent.match(/@homepage\s*([^\n]+)/) || [])[1];

  return {
    name,
    description,
    version,
    author,
    homepage,
    rawScript: scriptContent,
  };
}

async function wrap(filePath) {
  const deferred = defer();
  const currentScriptInfo = parseScript(filePath);
  const { rawScript, ...rest } = currentScriptInfo;
  // console.log("========currentScriptInfo==========", rest);

  const EVENT_NAMES = {
    request: "request",
    inited: "inited",
    updateAlert: "updateAlert",
  };
  const eventNames = Object.values(EVENT_NAMES);
  const events = {
    request: null,
  };

  let isInitedApi = false;

  globalThis.lx = {
    EVENT_NAMES: EVENT_NAMES,
    request(
      url,
      { method = "get", timeout, headers, body, form, formData },
      callback
    ) {
      console.log("========request==========", url, {
        method,
        timeout,
        headers,
        body,
        form,
        formData,
      });

      let options = {
        headers,
      };
      let data;
      if (body) {
        data = body;
      } else if (form) {
        data = form;
        options.json = false;
      } else if (formData) {
        data = formData;
        options.json = false;
      }
      options.response_timeout =
        typeof timeout == "number" && timeout > 0
          ? Math.min(timeout, 60_000)
          : 60_000;

      let request = needle.request(
        method,
        url,
        data,
        options,
        (err, resp, body) => {
          // console.log("============response======", url, body);
          try {
            if (err) {
              callback.call(this, err, null, null);
            } else {
              body = resp.body = resp.raw.toString();
              try {
                resp.body = JSON.parse(resp.body);
              } catch (_) {}
              body = resp.body;
              callback.call(
                this,
                err,
                {
                  statusCode: resp.statusCode,
                  statusMessage: resp.statusMessage,
                  headers: resp.headers,
                  bytes: resp.bytes,
                  raw: resp.raw,
                  body,
                },
                body
              );
            }
          } catch (err) {
            console.log("==================", err);
            console.warn(err.message);
          }
        }
      ).request;

      return () => {
        if (!request.aborted) request.abort();
        request = null;
      };
    },
    on(eventName, handler) {
      // console.log("========on==========", eventName, handler);
      if (!eventNames.includes(eventName))
        return Promise.reject(
          new Error("The event is not supported: " + eventName)
        );
      switch (eventName) {
        case EVENT_NAMES.request:
          events.request = handler;
          break;
        default:
          return Promise.reject(
            new Error("The event is not supported: " + eventName)
          );
      }
      return Promise.resolve();
    },
    send(eventName, data) {
      // console.log("========send==========", eventName, data);
      return new Promise((resolve, reject) => {
        if (!eventNames.includes(eventName))
          return reject(new Error("The event is not supported: " + eventName));
        switch (eventName) {
          case EVENT_NAMES.inited:
            if (isInitedApi) return reject(new Error("Script is inited"));
            isInitedApi = true;
            // handleInit(this, data);
            console.log("========inited==========", data);
            deferred.resolve(({ provider, id }) => {
              console.log("========get url==========", provider, id);
              return events.request
                .call(
                  {},
                  {
                    source: provider,
                    action: "musicUrl",
                    info: {
                      type: "128k",
                      musicInfo: {
                        songmid: id,
                      },
                    },
                  }
                )
                .then((response) => {
                  console.log("=========get url response=========", response);

                  if (
                    typeof response != "string" ||
                    response.length > 2048 ||
                    !/^https?:/.test(response)
                  ) {
                    throw new Error("failed");
                  }

                  return response;
                });
            });

            resolve();
            break;
          case EVENT_NAMES.updateAlert:
            if (isShowedUpdateAlert)
              return reject(
                new Error("The update alert can only be called once.")
              );
            isShowedUpdateAlert = true;
            console.log("========handleShowUpdateAlert==========", data);
            // handleShowUpdateAlert(data, resolve, reject);
            break;
          default:
            reject(new Error("Unknown event name: " + eventName));
        }
      });
    },
    utils: {
      crypto: {
        aesEncrypt(buffer, mode, key, iv) {
          const cipher = createCipheriv(mode, key, iv);
          return Buffer.concat([cipher.update(buffer), cipher.final()]);
        },
        rsaEncrypt(buffer, key) {
          buffer = Buffer.concat([Buffer.alloc(128 - buffer.length), buffer]);
          return publicEncrypt(
            { key, padding: constants.RSA_NO_PADDING },
            buffer
          );
        },
        randomBytes(size) {
          return randomBytes(size);
        },
        md5(str) {
          return createHash("md5").update(str).digest("hex");
        },
      },
      buffer: {
        from(...args) {
          return Buffer.from(...args);
        },
        bufToString(buf, format) {
          return Buffer.from(buf, "binary").toString(format);
        },
      },
      zlib: {
        inflate(buf) {
          return new Promise((resolve, reject) => {
            zlib.inflate(buf, (err, data) => {
              if (err) reject(new Error(err.message));
              else resolve(data);
            });
          });
        },
        deflate(data) {
          return new Promise((resolve, reject) => {
            zlib.deflate(data, (err, buf) => {
              if (err) reject(new Error(err.message));
              else resolve(buf);
            });
          });
        },
      },
    },
    currentScriptInfo,
    version: "2.0.0",
    env: "desktop",
  };

  require(filePath);

  return deferred.promise;
}

module.exports = { wrap };
