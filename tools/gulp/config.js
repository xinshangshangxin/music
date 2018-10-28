const distBasePath = './dist/';

const config = {
  clean: {
    src: [`${distBasePath}**/*`],
    options: {
      force: true,
    },
  },
  server: {
    src: ['**/*', '!**/*.d.ts'],
    opt: {
      cwd: 'src/',
      base: 'src/',
    },
    dest: distBasePath,
  },
  replace: {
    src: ['index.js'],
    regexp: '',
    newSubstr: '',
  },
  cp: {
    src: ['package.json', 'README.md'],
    opt: {
      cwd: './',
      base: './',
    },
    dest: distBasePath,
  },
  nodemon: {
    config: {
      script: 'src/index.ts',
      ext: 'js,ts',
      watch: ['src/'],
      verbose: true,
      restartable: 'rs',
      env: {
        NODE_ENV: 'development',
      },
      args: [
        '--extensions=".ts"',
        // if you want use attach debug, use `INSPECT=9229 gulp`
        process.env.INSPECT ? [`--inspect=${process.env.INSPECT}`] : '',
      ],
      exec: 'babel-node',
    },
    events: {
      crash: true,
      start: false,
      quit: true,
    },
  },
};

module.exports = config;
