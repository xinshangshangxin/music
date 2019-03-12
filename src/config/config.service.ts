import { Injectable } from '@nestjs/common';
import Joi from 'joi';
import { resolve as pathResolve } from 'path';

interface EnvConfig {
  [prop: string]: any;
  nmdbUrl: string;
  port: number;
  saveDir: string;
  downloadTimeout: number;
}

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(env = 'development') {
    let filePath = pathResolve(__dirname, `${env}.js`);

    // when use webpack, should fix the path
    if (filePath === `/${env}.js`) {
      filePath = `./dist/${env}.js`;
    }

    console.log('filePath: ', filePath);
    this.envConfig = this.validateInput(require(filePath));
  }

  get nmdbUrl(): string {
    return this.envConfig.nmdbUrl;
  }

  get disabledCache(): boolean {
    return !!this.envConfig.disabledCache;
  }

  get port(): number {
    return this.envConfig.port;
  }

  get saveDir(): string {
    return this.envConfig.saveDir;
  }

  get downloadTimeout(): number {
    return this.envConfig.downloadTimeout;
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      nmdbUrl: Joi.string().required(),
      disabledCache: Joi.boolean().default(false),
      appId: Joi.string(),
      port: Joi.number().default(3000),
      saveDir: Joi.string(),
      downloadTimeout: Joi.number().default(10000),
    });

    const { error, value: validatedEnvConfig } = Joi.validate(
      envConfig,
      envVarsSchema,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedEnvConfig;
  }
}
