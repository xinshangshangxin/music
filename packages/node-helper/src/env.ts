import process from 'node:process';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { Errors } from 'helper';
import { config } from 'dotenv';

const ENV_NAME = (() => {
  const { NODE_ENV } = process.env;

  let name = NODE_ENV;
  switch (NODE_ENV) {
    case undefined:
    case '':
    case 'dev':
    case 'development':
      name = 'dev';
      break;

    case 'prod':
    case 'production':
      name = 'prod';
      break;

    default:
      name = NODE_ENV;
      break;
  }

  return name;
})();

interface Env {
  HEADLESS_FILE_ROOT?: string;

  PORT: number;
  DATABASE_URL: string;
  LX_SOURCE_DIR?: string;
}

function getEnvPath() {
  const list = [
    // 运行目录下
    resolve(process.cwd(), `.env.${ENV_NAME}`),
    // 当前目录下
    resolve(__dirname, `.env.${ENV_NAME}`),
    resolve(__dirname, '../', `.env.${ENV_NAME}`),
    resolve(__dirname, '../../', `.env.${ENV_NAME}`),
    resolve(__dirname, '../../../', `.env.${ENV_NAME}`),
    resolve(__dirname, '../../../../', `.env.${ENV_NAME}`),
  ];

  for (const p of list) {
    if (existsSync(p)) {
      return p;
    }
  }

  throw new Errors.EnvInvalid({ ENV_NAME, list }, 'env未找到');
}

const envPath = getEnvPath();

// 获取环境变量
const env = config({
  path: envPath,
})?.parsed as unknown as Env;

if (!env) {
  throw new Errors.EnvInvalid({ envPath }, 'env解析失败');
}

// 获取后端启动的端口
if (process.env.PORT) {
  env.PORT = Number(process.env.PORT);
}

if (!env.PORT) {
  throw new Errors.EnvInvalid(env, 'PORT未找到');
}

env.PORT = Number(env.PORT);

if (!env.DATABASE_URL) {
  throw new Errors.EnvInvalid(env, 'DATABASE_URL未找到');
}

export type { Env };
export { ENV_NAME, env };
