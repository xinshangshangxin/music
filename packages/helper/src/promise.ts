import { Errors } from './error';

async function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

function defer<T>() {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((rs, rj) => {
    resolve = rs;
    reject = rj;
  });

  return { promise, resolve: resolve!, reject: reject! };
}

async function promiseForEach<T>(arr: T[], fun: (...args: T[]) => Promise<any>) {
  return arr.reduce((p, value) => p.then(() => fun(value)), Promise.resolve());
}

async function promiseForEachWithCatch<T>(arr: T[], fun: (...args: T[]) => Promise<any>, catchFun = console.warn) {
  return arr.reduce((p, value) => p.then(() => fun(value).catch(catchFun)), Promise.resolve());
}

async function wrapTimeout<T>(p: Promise<T>, timeout = 5000) {
  return new Promise<T>((rs, rj) => {
    const timer = setTimeout(() => {
      rj(new Errors.Timeout());
    }, timeout);

    p.then(rs)
      .catch(rj)
      .finally(() => {
        clearTimeout(timer);
      });
  });
}

async function promiseMap<T, U>(arr: T[], mapper: (item: T, index: number) => Promise<U>, concurrency = 3) {
  const results: U[] = [];
  const processingPromises: Promise<any>[] = [];

  async function processItem(item: T, index: number) {
    const result = await mapper(item, index);
    results[index] = result;
  }

  for (const [index, item] of arr.entries()) {
    const promise = processItem(item, index).finally(() => {
      processingPromises.splice(processingPromises.indexOf(promise), 1);
    });

    processingPromises.push(promise);

    // 当达到并发数量上限时，等待其中一个 promise 完成，然后再继续
    if (processingPromises.length >= concurrency) {
      await Promise.race(processingPromises);
    }
  }

  await Promise.all(processingPromises);

  return results;
}

export { type Deferred, defer, delay, promiseForEach, promiseForEachWithCatch, promiseMap, wrapTimeout };
