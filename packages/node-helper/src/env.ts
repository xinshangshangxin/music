import process from 'node:process';

const ENV_NAME = (() => {
  const { NODE_ENV } = process.env;

  let name = NODE_ENV;
  switch (NODE_ENV) {
    case undefined:
    case '':
    case 'dev':
    case 'development':
      name = 'dev';
      break;

    case 'prod':
    case 'production':
      name = 'prod';
      break;

    default:
      name = NODE_ENV;
      break;
  }

  return name;
})();

export { ENV_NAME };
