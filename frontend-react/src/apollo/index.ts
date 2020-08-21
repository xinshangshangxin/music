import { GraphQLClient } from 'graphql-request';

import { getSdk } from './graphql';

const client = new GraphQLClient('http://music.xinshangshangxin.com/graphql');

const sdk = getSdk(client);

export { sdk };
