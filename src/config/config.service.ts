import { Injectable } from '@nestjs/common';
import { resolve as pathResolve } from 'path';
import { readFileSync } from 'fs';
import * as JSON5 from 'json5';

import * as Joi from 'joi';

interface EnvConfig {
  [prop: string]: any;
}

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(env = 'development') {
    let filePath = pathResolve(__dirname, `${env}.json5`);
    let webpackBuildPath = `/${env}.json5`;

    // use webpack fix the path
    if (filePath === webpackBuildPath) {
      filePath = `./dist/${env}.json5`;
    }

    console.log('filePath: ', filePath);
    const config = readFileSync(filePath, {
      encoding: 'utf8',
    });
    this.envConfig = this.validateInput(JSON5.parse(config));
  }

  get nmdbUrl(): string {
    return this.envConfig.nmdbUrl;
  }

  get disabledCache(): boolean {
    return !!this.envConfig.disabledCache;
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      nmdbUrl: Joi.string().required(),
      disabledCache: Joi.boolean().default(false),
      appId: Joi.string(),
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
