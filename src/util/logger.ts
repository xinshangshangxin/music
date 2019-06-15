import pino from 'pino';

const myLogger = pino({
  level: 'trace',
});

// @ts-ignore
global.logger = myLogger;
