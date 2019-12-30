import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Config } from '../player/interface';
import { PersistService } from './persist.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private readonly persistService: PersistService) {}

  public getConfig(): Observable<Config> {
    return this.persistService.getConfig();
  }

  public changeConfig(
    config?: { [key in keyof Config]?: Partial<Config[key]> }
  ): Observable<Config> {
    return this.persistService.persistConfig(config);
  }
}
