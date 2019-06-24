import { TypeOrmModuleOptions } from '@nestjs/typeorm';

declare global {
  const environment: {
    env: string;
    typeorm: TypeOrmModuleOptions;
    logger: any;
  };
}

export {};
