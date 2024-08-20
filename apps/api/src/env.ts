import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { ENV_NAME, Errors } from 'node-helper';
import type { SubsetMongoUrl } from '@s4p/smdb';

interface Env {
  PUBLIC_APP_NAME: string;
  PUBLIC_REQ_HEADER_TOKEN: string;

  PORT: number;

  DATABASE_URL: SubsetMongoUrl;
}

if (typeof globalThis.__dirname === 'undefined') {
  globalThis.__dirname = fileURLToPath(new URL('.', import.meta.url));
}

function getEnvPath() {
  const list = [
    resolve(__dirname, `.env.${ENV_NAME}`),
    resolve(process.cwd(), `.env.${ENV_NAME}`),
    resolve(__dirname, '../', `.env.${ENV_NAME}`),
    resolve(__dirname, '../../', `.env.${ENV_NAME}`),
    resolve(__dirname, '../../../', `.env.${ENV_NAME}`),
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

export { env };
