import { NestFactory } from '@nestjs/core';
import cors from 'cors';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  app.use(cors());
  // app.setGlobalPrefix('api/v1');
  const configService: ConfigService = app.get(ConfigService);

  console.info('port: ', configService.port);
  await app.listen(configService.port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
