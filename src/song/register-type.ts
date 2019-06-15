import { Provider } from '@s4p/music-api';
import { registerEnumType } from 'type-graphql';

registerEnumType(Provider, {
  name: 'Provider',
});

export { Provider };
