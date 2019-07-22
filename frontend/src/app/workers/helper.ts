export enum Action {
  put = 'put',
  get = 'get',
  delete = 'delete',
}

export interface RequestMessage {
  action: Action;
  key: string;
  value?: object;
}

export interface ResponseMessage {
  uuid: string;
  errMsg: string;
  result: unknown;
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

async function awaitWrap<T, U = Error>(promise: Promise<T>): Promise<[U] | [undefined, T]> {
  try {
    const data = await promise;
    return [, data];
  } catch (e) {
    return [e];
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
