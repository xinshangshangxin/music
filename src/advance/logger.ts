import * as pino from 'pino';

const myLogger = pino({
  prettyPrint: {
    errorLikeObjectKeys: ['extra'],
  },
  level: 'trace',
  base: null,
});

myLogger.log = myLogger.trace.bind(myLogger);

declare global {
  const logger: any;

  namespace NodeJS {
    interface Global {
      logger: any;
    }
  }
}

global.logger = myLogger;

export default myLogger;
