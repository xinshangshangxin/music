const env = process.env.NODE_ENV || 'development';

// tslint:disable-next-line: no-var-requires
const obj: any = require(`../../environment/${env}.js`);

// @ts-ignore
global.environment = {
  env,
  ...obj,
};
