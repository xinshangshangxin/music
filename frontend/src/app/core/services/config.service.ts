import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { setProxyUrl } from '../audio/helper';

import { Config } from '../player/interface';
import { PersistService } from './persist.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor(private readonly persistService: PersistService) {
    this.getConfig().subscribe(config => {
      ConfigService.setProxyUrl(config);
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
      setProxyUrl(proxyUrl);
    }

    return this.persistService.persistConfig(config);
  }

  private static setProxyUrl(config?: Partial<Config>) {
    const { proxyUrl } = config || { proxyUrl: '' };

    if (proxyUrl) {
      setProxyUrl(proxyUrl);
    }
  }
}
