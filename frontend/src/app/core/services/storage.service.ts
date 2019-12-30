import { Injectable } from '@angular/core';
import { v4 as uuidV4 } from 'uuid';

import { Action, Defer, defer, RequestMessage, ResponseMessage } from '../workers/helper';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly worker = new Worker('../workers/store.worker.ts', { type: 'module' });

  private deferredMap: {
    [key: string]: Defer<ResponseMessage>;
  } = {};

  constructor() {
    this.worker.onmessage = ({ data }) => {
      // console.info('worker response data: ', data);

      if (data && data.uuid) {
        const deferred = this.deferredMap[data.uuid];

        if (deferred) {
          deferred.resolve(data);
          delete this.deferredMap[data.uuid];
        }
      }
    };
  }

  public async get<T>(key: string, defaultValue?: T): Promise<T> {
    const { errMsg, result } = await this.sendMessage({
      action: Action.get,
      key,
    });

    if (errMsg) {
      throw new Error(errMsg);
    }

    if (!result) {
      return defaultValue as T;
    }

    return result as T;
  }

  public async put(key: string, value: any): Promise<void> {
    const { errMsg } = await this.sendMessage({
      action: Action.put,
      key,
      value,
    });

    if (errMsg) {
      throw new Error(errMsg);
    }
  }

  public async delete(key: string): Promise<void> {
    const { errMsg } = await this.sendMessage({
      action: Action.delete,
      key,
    });

    if (errMsg) {
      throw new Error(errMsg);
    }
  }

  private async sendMessage(data: RequestMessage, timeout = 10 * 1000): Promise<ResponseMessage> {
    const uuid = StorageService.getUUID();
    const deferred = defer<ResponseMessage>();

    this.deferredMap[uuid] = deferred;
    this.worker.postMessage({
      ...data,
      uuid,
    });

    setTimeout(() => {
      deferred.reject(new Error('TIMEOUT'));
      delete this.deferredMap[uuid];
    }, timeout);

    return deferred.promise;
  }

  private static getUUID(): string {
    return `${uuidV4()}|${new Date().toLocaleTimeString()}`;
  }
}
