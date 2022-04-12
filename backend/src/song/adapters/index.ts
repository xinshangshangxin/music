import { Adapter } from '@s4p/music-api';
import qq from '../adapters/qq';

const qqAdapter = new Adapter(qq as any);

export { qqAdapter };
