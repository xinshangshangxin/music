import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

console.info('version: v1.0.0');

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
