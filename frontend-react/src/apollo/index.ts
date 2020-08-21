import { GraphQLClient } from 'graphql-request';

import { getSdk } from './graphql';

const client = new GraphQLClient('https://music.xinshangshangxin.com/graphql');

const sdk = getSdk(client);

export { sdk };
