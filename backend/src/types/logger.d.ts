import pino = require('pino');

declare global {
  const logger: pino.Logger;
}

export {};
