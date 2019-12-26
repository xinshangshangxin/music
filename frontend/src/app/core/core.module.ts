import { NgModule } from '@angular/core';

import { ConfigService } from './services/config.service';
import { PersistService } from './services/persist.service';
import { PlayerService } from './services/player.service';
import { PreloadService } from './services/preload.service';
import { SearchService } from './services/search.service';
import { StorageService } from './services/storage.service';

@NgModule({
  providers: [
    ConfigService,
    PersistService,
    PlayerService,
    PreloadService,
    StorageService,
    SearchService,
  ],

})
export class CoreModule {}
