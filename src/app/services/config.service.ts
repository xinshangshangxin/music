import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

import { Config, PersistService } from './persist.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private readonly persistService: PersistService) {}

  getConfig(): Observable<Config> {
    return from(this.persistService.getConfig());
  }

  async changeConfig(config?: { [key in keyof Config]?: Partial<Config[key]> }): Promise<Config> {
    return this.persistService.persistConfig(config);
  }
}
