import { BitRate, Provider } from '@s4p/music-api';
import { Privilege } from '@s4p/music-api/common/privilege';
import { registerEnumType } from 'type-graphql';

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
