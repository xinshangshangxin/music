import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { Provider } from 'core';
import needle from 'needle';
import { VM } from 'vm2';
import { Errors } from 'packages/helper/dist/es';
import { parseScript } from './parse-script';

const PROVIDER_MAPPING = {
  [Provider.kugou]: 'kg',
  [Provider.kuwo]: 'kw',
  [Provider.migu]: 'mg',
  [Provider.qq]: 'tx',
};

interface Source {
  getUrl: (id: string, provider: Provider) => Promise<string>;
  name: string;
  description?: string;
  version?: string;
  author?: string;
  homepage?: string;
}

async function loadLxSource(filePath: string): Promise<Source> {
  const currentScriptInfo = await parseScript(filePath);

  if (!currentScriptInfo?.name) {
    throw new Errors.CreatedFailed();
  }

  // 创建一个 VM 实例
  const vm = new VM({
    sandbox: {
      crypto,
      zlib,
      needle,
      setTimeout,
      setInterval,
      log: (...args: any[]) => {
        console.log(`__${currentScriptInfo.name}_vm_log__`, ...args);
      },
    },
  });

  // 不信任的代码示例
  const untrustedCode = `
(function() {



    const { createCipheriv, publicEncrypt, constants, randomBytes, createHash } =
    crypto;

    async function wrap(currentScriptInfo) {
    return new Promise((rs, rj) => {
      const { rawScript, ...rest } = currentScriptInfo;
      log("========currentScriptInfo==========", rest);

      const EVENT_NAMES = {
        request: "request",
        inited: "inited",
        updateAlert: "updateAlert",
      };

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
          // log("========request==========", url, {
          //   method,
          //   timeout,
          //   headers,
          //   body,
          //   form,
          //   formData,
          // });

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
              // log("============response======", url, body);
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
          if (eventName === EVENT_NAMES.request) {
            events.request = handler;
          }
          return Promise.resolve();
        },
        send(eventName) {
          if (eventName !== EVENT_NAMES.inited) {
            return Promise.resolve();
          }

          if (isInitedApi) {
            return Promise.reject(new Error("Script is inited"));
          }
          isInitedApi = true;

          rs(({ provider, id }) => {
            log("========get url==========", provider, id);

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
                      copyrightId: id,
                      hash: id,
                    },
                  },
                }
              )
              .then((response) => {
                log("=========get url response=========", response);

                if (
                  typeof response != "string" ||
                  response.length > 2048 ||
                  !/^https?:/.test(response)
                ) {
                  throw new Error("failed");
                }

                return response;
              }).catch((e) => {
                log("=========get url error=========");
                return '';
              })
          });

          return Promise.resolve();
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

      // 注入代码
      ${currentScriptInfo.rawScript}

    



      });
    }

    return function (currentScriptInfo) {
    return wrap(currentScriptInfo);
};







})()
`;

  const fn = vm.run(untrustedCode);
  const getUrl = await fn(currentScriptInfo);

  const { rawScript, ...rest } = currentScriptInfo;

  return {
    ...rest,
    getUrl: async (id: string, provider: Provider) => {
      return getUrl({
        provider: PROVIDER_MAPPING[provider],
        id,
      });
    },
  };
}

export type { Source };
export { loadLxSource };
