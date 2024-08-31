import { Provider } from './common/provider';
import { Kugou } from './provider/kugou';
import { Kuwo } from './provider/kuwo';
import { Migu } from './provider/migu';
import { Mixed } from './provider/mixed';
import type { BaseProvider } from './provider/provider';
import { QQ } from './provider/qq';

const mixed = new Mixed();

export { Kugou, Kuwo, Migu, Mixed, QQ, mixed, Provider };
export type { BaseProvider };
