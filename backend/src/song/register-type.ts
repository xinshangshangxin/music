import { BitRate } from '@s4p/music-api';
import { Privilege } from '@s4p/music-api/common/privilege';
import { registerEnumType } from 'type-graphql';

enum Provider {
  kugou = 'kugou',
  netease = 'netease',
}

namespace Provider {
  export const adapterQQ = 'adapterQQ' as Provider;
}

registerEnumType(Provider, {
  name: 'Provider',
});

registerEnumType(Privilege, {
  name: 'Privilege',
});

registerEnumType(BitRate, {
  name: 'BitRate',
});

export { Provider, Privilege, BitRate };
