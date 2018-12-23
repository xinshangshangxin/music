import { NestFactory } from '@nestjs/core';
import cors from 'cors';

import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cors());
  // app.setGlobalPrefix('api/v1');
  let port = process.env.PORT || process.env.LEANCLOUD_APP_PORT || 3000;
  console.info('port: ', port);
  await app.listen(port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
