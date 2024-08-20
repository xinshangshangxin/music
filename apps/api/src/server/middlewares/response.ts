import type { Context, Next } from 'koa';
import { ENV_NAME, Errors } from 'node-helper';

const isShowStack = ENV_NAME === 'dev';

async function response(ctx: Context, next: Next) {
  try {
    const data = await next();

    if (ctx.response.body) {
      return;
    }

    ctx.response.body = {
      code: 200,
      data,
    };
  } catch (e) {
    if (e instanceof Errors.OperationalError) {
      ctx.status = e.status || 400;

      const { stack, ...data } = e.toJSON();

      ctx.response.body = {
        code: e.status || 400,
        message: e.message,
        data: isShowStack ? { stack, ...data } : data,
      };

      logger.warn(e.toString());

      return;
    }

    logger.warn(e);

    ctx.status = 500;
    ctx.response.body = {
      code: 500,
      message: (e as any)?.message,
    };
  }
}

export { response };
