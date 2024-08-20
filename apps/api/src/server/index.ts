import '../utils/logger';

import { env } from '../env';
import { app } from './app';
import { v1 } from './routes';

app.use(v1.routes());

app.listen(env.PORT, () => {
  logger.info(`Start Server at http://localhost:${env.PORT}`);
});
