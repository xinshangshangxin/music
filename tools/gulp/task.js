/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

const notifier = require('node-notifier');
const gulp = require('gulp');
const nodemon = require('nodemon');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const gulpLoadPlugins = require('gulp-load-plugins');
const ts = require('gulp-typescript');
const { spawn } = require('child_process');

const tsProject = ts.createProject('tsconfig.json');

const utilities = require('./utilities');

const defaultNodemonEvent = {
  crash() {
    console.error('Application has crashed!\n');
    notifier.notify({
      title: 'crashed!',
      message: utilities.formatDate('hh:mm:ss'),
    });
  },
  start() {
    notifier.notify({
      title: 'restarting!',
      message: utilities.formatDate('hh:mm:ss'),
    });
  },
  quit() {
    console.warn('\n===============\nApp has quit\n===============\n');
    process.exit(1);
  },
};

const config = require('./config.js');

let $ = gulpLoadPlugins({
  pattern: ['gulp-*', 'del', 'streamqueue'],
  // ,lazy: false
});

$.gulp = gulp;
$.config = config;

function validConfig(setting, name = 'src') {
  return setting[name] && setting[name].length;
}

gulp.task('clean', () => {
  return $.del(config.clean.src, config.clean.options);
});

gulp.task('eslint', (done) => {
  if (!validConfig(config.server)) {
    return done();
  }

  let f = $.filter(['**/*.ts'], { restore: true });

  return gulp
    .src(config.server.src, config.server.opt)
    .pipe($.cached('eslint'))
    .pipe(f)
    .pipe($.eslint())
    .pipe(
      $.eslint.result((result) => {
        utilities.eslintReporter(result);
      })
    )
    .pipe($.eslint.failOnError())
    .pipe(f.restore)
    .pipe($.remember('eslint'));
});

gulp.task('tsc', (done) => {
  if (!validConfig(config.server)) {
    return done();
  }

  return tsProject.src().pipe(tsProject(ts.reporter.longReporter()));
});

gulp.task('tscWatch', () => {
  spawn('tsc', ['-w', '--preserveWatchOutput'], { stdio: 'inherit' });
});

gulp.task('lint', gulp.parallel('eslint', 'tsc'));

gulp.task('wlint', (done) => {
  if (!validConfig(config.server)) {
    return done();
  }

  // eslint init run
  gulp.series('eslint')();

  // tsc watch
  gulp.series('tscWatch')();

  let timer = null;
  // eslint watch
  gulp.watch(config.server.src, config.server.opt).on('change', (filePath) => {
    clearTimeout(timer);

    timer = setTimeout(async () => {
      try {
        await utilities.spawnDefer({
          cmd: 'clear',
          arg: [],
        });
      } catch (e) {
        console.warn(e);
      }

      if (/models\//.test(filePath)) {
        console.info(`${filePath} do d-ts generate`);

        utilities
          .spawnDefer({
            cmd: 'npm',
            arg: ['run', 'd-ts'],
          })
          .catch((e) => {
            console.warn(e);
          });
      }

      setTimeout(() => {
        console.info(`${filePath} do eslint`);
        gulp.series('eslint')();
      });
    });
  });

  return done();
});

gulp.task('nodemon', (done) => {
  nodemon(config.nodemon.config);

  Object.keys(config.nodemon.events).forEach((eventName) => {
    let event = config.nodemon.events[eventName];
    if (typeof eventName === 'function') {
      nodemon.on(eventName, event);
    } else if (event === true && defaultNodemonEvent[eventName]) {
      nodemon.on(eventName, defaultNodemonEvent[eventName]);
    } else if (typeof event === 'undefined' || event === false) {
      return null;
    } else {
      console.warn(`nodemon event not support for ${eventName}`);
    }
    return null;
  });

  return done();
});

gulp.task('babel', () => {
  let f = $.filter(['**/*.ts'], { restore: true });
  let replaceFilter = $.filter(config.replace.src, { restore: true });

  return gulp
    .src(config.server.src, config.server.opt)
    .pipe(f)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(f.restore)
    .pipe(replaceFilter)
    .pipe(replace(config.replace.regexp, config.replace.newSubstr))
    .pipe(replaceFilter.restore)
    .pipe(gulp.dest(config.server.dest));
});

gulp.task('cp', () => {
  return gulp.src(config.cp.src, config.cp.opt).pipe(gulp.dest(config.cp.dest));
});

gulp.task('default', gulp.parallel('nodemon', 'wlint'));

gulp.task('build:dist', gulp.series('clean', gulp.parallel('lint', gulp.series('babel', 'cp'))));

gulp.task('build', gulp.series('build:dist'));
