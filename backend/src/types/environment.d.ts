import { TypeOrmModuleOptions } from '@nestjs/typeorm';

declare global {
  const environment: {
    env: string;
    port: number | string;
    typeorm: TypeOrmModuleOptions;
    logger: any;
  };
}

export {};
