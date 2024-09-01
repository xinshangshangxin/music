import { env } from 'node-helper';
import '../utils/logger';

import { app } from './app';
import { v1 } from './routes';

app.use(v1.routes());

app.listen(env.PORT, () => {
  logger.info(`Start Server at http://localhost:${env.PORT}`);
});
