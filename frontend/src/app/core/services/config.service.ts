import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { setProxyUrlList } from '../audio/helper';

import { Config } from '../player/interface';
import { PersistService } from './persist.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private readonly persistService: PersistService) {
    this.getConfig().subscribe((config) => {
      ConfigService.setProxyUrlList(config);
    }, console.warn);
  }

  public getConfig(): Observable<Config> {
    return this.persistService.getConfig();
  }

  public changeConfig(
    config?: { [key in keyof Config]?: Partial<Config[key]> }
  ): Observable<Config> {
    const { proxyUrl } = config || { proxyUrl: '' };

    if (proxyUrl) {
      setProxyUrlList(proxyUrl.split(','));
    }

    return this.persistService.persistConfig(config);
  }

  private static setProxyUrlList(config?: Partial<Config>) {
    const { proxyUrl } = config || { proxyUrl: '' };

    if (proxyUrl) {
      setProxyUrlList(proxyUrl.split(','));
    }
  }
}
