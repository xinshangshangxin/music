export enum Action {
  put = 'put',
  get = 'get',
}
export interface Message {
  action: Action;
  key: string;
  value: any;
  result: any;
  uuid: string | number;
}

export interface Defer<T, U = Error> {
  resolve: (value?: T | PromiseLike<T> | undefined) => void;
  reject: (reason?: U) => void;
  promise: Promise<T>;
}

async function awaitWrap<T, U = Error>(promise: T): Promise<[U, null] | [null, T]> {
  try {
    let data = await promise;
    return [null, data];
  } catch (e) {
    return [e, null];
  }
}

function defer<T, U = Error>(): Defer<T, U> {
  let resolve: any;
  let reject: any;

  const promise = new Promise<T>((rs, rj) => {
    resolve = rs;
    reject = rj;
  });

  return {
    resolve,
    reject,
    promise,
  };
}

export { defer, awaitWrap };
