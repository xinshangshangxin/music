import pino from 'pino';

const myLogger = pino(environment.logger);

// @ts-ignore
global.logger = myLogger;
