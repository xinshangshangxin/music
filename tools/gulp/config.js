const distBasePath = './dist/';

const config = {
  clean: {
    src: [`${distBasePath}**/*`],
    options: {
      force: true,
    },
  },
  server: {
    src: ['**/*', '!views/**/*', '!**/*.d.ts'],
    opt: {
      cwd: 'src/',
      base: 'src/',
    },
    dest: distBasePath,
  },
  replace: {
    src: [],
    regexp: '',
    newSubstr: '',
  },
  cp: {
    src: ['package.json'],
    opt: {
      cwd: './',
      base: './',
    },
    dest: distBasePath,
  },
  nodemon: {
    config: {
      script: 'src/index.ts',
      ext: 'ts',
      watch: ['src/'],
      verbose: true,
      restartable: 'rs',
      env: {
        NODE_ENV: 'development',
      },
      args: [
        // if you want use attach debug, use `INSPECT=9229 gulp`
        process.env.INSPECT ? [`--inspect=${process.env.INSPECT}`] : '',
      ],
      exec: './node_modules/.bin/ts-node --project=tsconfig.json --files src/index.ts',
    },
    events: {
      crash: true,
      start: false,
      quit: true,
    },
  },
};

module.exports = config;
