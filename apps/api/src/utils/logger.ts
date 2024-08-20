import { AsyncLocalStorage } from 'node:async_hooks';
import { formatWithOptions } from 'node:util';
import dayjs from 'dayjs';
import { OperationalError } from 'node-helper';

const TRACE_KEY = 'x-trace-id';
const ALS = new AsyncLocalStorage<string>();

const fnKeyList = ['log', 'info', 'debug', 'warn', 'error', 'trace'] as const;

type Keys = (typeof fnKeyList)[number];

const logger = Object.fromEntries(
  fnKeyList.map((k) => {
    const fn = (message?: any, ...optionalParams: any[]) => {
      const traceId = ALS.getStore() ?? '';

      let msg;
      if (message instanceof OperationalError) {
        msg = message.toString();
      } else {
        msg = message;
      }

      console[k](
        dayjs().format('YY/MM/DD HH:mm:ss:SSS'),
        traceId,
        formatWithOptions(
          {
            depth: null,
            breakLength: Infinity,
            compact: true,
          },
          msg,
          ...optionalParams,
        ),
        '\n',
      );
    };

    return [k, fn];
  }),
) as Record<Keys, (...args: any[]) => void>;

(globalThis as any).logger = logger;

export { ALS, TRACE_KEY };
